const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const adminProductController = require('../controllers/adminProductController');
const adminBulkController = require('../controllers/adminBulkController');
const categoryController = require('../controllers/categoryController');

const router = express.Router();

// All routes require admin authorization
router.use(protect, authorize('admin'));

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
router.get('/dashboard', async (req, res) => {
  try {
    // Get total counts
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email')
      .populate('items.product', 'name');

    // Get top selling products
    const topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' }
    ]);

    // Get monthly revenue
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          },
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalProducts,
          totalOrders,
          totalUsers,
          totalRevenue: totalRevenue[0]?.total || 0
        },
        recentOrders,
        topProducts,
        monthlyRevenue
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get all orders (admin)
// @route   GET /api/admin/orders
// @access  Private/Admin
router.get('/orders', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      paymentStatus,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'user.name': { $regex: search, $options: 'i' } },
        { 'user.email': { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name email')
      .populate('items.product', 'name images');

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get admin orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
router.put('/orders/:id/status', [
  body('status')
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'])
    .withMessage('Invalid status'),
  body('trackingNumber')
    .optional()
    .isString()
    .withMessage('Tracking number must be a string'),
  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { status, trackingNumber, notes } = req.body;

    const updateData = {
      status,
      $push: {
        statusHistory: {
          status,
          timestamp: new Date(),
          note: notes || `Status changed to ${status}`
        }
      }
    };

    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = {};

    if (role) {
      filter.role = role;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(filter)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
router.put('/users/:id/role', [
  body('role')
    .isIn(['user', 'admin'])
    .withMessage('Invalid role')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get comprehensive analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
router.get('/analytics', async (req, res) => {
  try {
    const { timeRange = '12months' } = req.query;
    
    // Calculate date range
    let startDate = new Date();
    switch (timeRange) {
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '3months':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case '6months':
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case '12months':
      default:
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    // Get basic stats
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments({ createdAt: { $gte: startDate } });
    const totalUsers = await User.countDocuments({ role: 'user', createdAt: { $gte: startDate } });
    
    // Get revenue data
    const revenueData = await Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: startDate } } },
      { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 } } }
    ]);
    
    const totalRevenue = revenueData[0]?.total || 0;
    const averageOrderValue = revenueData[0]?.count > 0 ? totalRevenue / revenueData[0].count : 0;

    // Get growth data (compare with previous period)
    const previousPeriodStart = new Date(startDate);
    const periodDiff = new Date() - startDate;
    previousPeriodStart.setTime(previousPeriodStart.getTime() - periodDiff);
    
    const previousRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: previousPeriodStart, $lt: startDate } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    
    const previousOrders = await Order.countDocuments({ 
      createdAt: { $gte: previousPeriodStart, $lt: startDate } 
    });
    
    const previousUsers = await User.countDocuments({ 
      role: 'user', 
      createdAt: { $gte: previousPeriodStart, $lt: startDate } 
    });

    // Calculate growth percentages
    const revenueGrowth = previousRevenue[0]?.total > 0 
      ? ((totalRevenue - previousRevenue[0].total) / previousRevenue[0].total) * 100 
      : 0;
    const ordersGrowth = previousOrders > 0 
      ? ((totalOrders - previousOrders) / previousOrders) * 100 
      : 0;
    const usersGrowth = previousUsers > 0 
      ? ((totalUsers - previousUsers) / previousUsers) * 100 
      : 0;

    // Get monthly revenue trend
    const monthlyRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Get top selling products
    const topSellingProducts = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' }
    ]);

    // Get order status distribution
    const ordersByStatus = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate percentages for order status
    const totalOrdersForStatus = ordersByStatus.reduce((sum, item) => sum + item.count, 0);
    const orderStatusWithPercentage = ordersByStatus.map(item => ({
      status: item._id,
      count: item.count,
      percentage: totalOrdersForStatus > 0 ? (item.count / totalOrdersForStatus) * 100 : 0
    }));

    // Get top categories
    const topCategories = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $lookup: {
          from: 'categories',
          localField: 'product.category',
          foreignField: '_id',
          as: 'category'
        }
      },
      { $unwind: '$category' },
      {
        $group: {
          _id: '$category.name',
          sales: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]);

    // Get low stock alerts
    const lowStockProducts = await Product.find({
      stockQuantity: { $lt: 10, $gt: 0 }
    }).select('name stockQuantity').limit(10);

    const outOfStockProducts = await Product.find({
      $or: [{ inStock: false }, { stockQuantity: 0 }]
    }).select('name').limit(10);

    // Calculate conversion rate (assuming we track website visits)
    const conversionRate = totalUsers > 0 ? (totalOrders / totalUsers) * 100 : 0;

    res.json({
      success: true,
      data: {
        totalRevenue,
        revenueGrowth,
        totalOrders,
        ordersGrowth,
        totalCustomers: totalUsers,
        customersGrowth: usersGrowth,
        totalProducts,
        productsGrowth: 0, // Products don't have historical growth in this timeframe
        averageOrderValue,
        conversionRate,
        topSellingProducts: topSellingProducts.map(item => ({
          id: item._id,
          name: item.product.name,
          sales: item.totalSold,
          revenue: item.totalRevenue
        })),
        revenueByMonth: monthlyRevenue.map(item => ({
          month: new Date(item._id.year, item._id.month - 1).toLocaleDateString('en-US', { month: 'short' }),
          revenue: item.revenue,
          orders: item.orders
        })),
        ordersByStatus: orderStatusWithPercentage,
        topCategories: topCategories.map(item => ({
          category: item._id,
          sales: item.sales,
          revenue: item.revenue
        })),
        lowStockProducts,
        outOfStockProducts
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get product analytics
// @route   GET /api/admin/products/analytics
// @access  Private/Admin
router.get('/products/analytics', async (req, res) => {
  try {
    // Get low stock products
    const lowStockProducts = await Product.find({
      stockQuantity: { $lt: 10 }
    }).select('name stockQuantity category');

    // Get out of stock products
    const outOfStockProducts = await Product.find({
      inStock: false
    }).select('name category');

    // Get top selling products
    const topSellingProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' }
    ]);

    // Get category distribution
    const categoryDistribution = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalValue: { $sum: '$price' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        lowStockProducts,
        outOfStockProducts,
        topSellingProducts,
        categoryDistribution
      }
    });
  } catch (error) {
    console.error('Get product analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Bulk update product stock
// @route   PUT /api/admin/products/bulk-stock
// @access  Private/Admin
router.put('/products/bulk-stock', [
  body('updates')
    .isArray()
    .withMessage('Updates must be an array'),
  body('updates.*.productId')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('updates.*.stockQuantity')
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { updates } = req.body;

    const bulkOps = updates.map(update => ({
      updateOne: {
        filter: { _id: update.productId },
        update: {
          $set: {
            stockQuantity: update.stockQuantity,
            inStock: update.stockQuantity > 0
          }
        }
      }
    }));

    const result = await Product.bulkWrite(bulkOps);

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: {
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Bulk update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Bulk update product featured status
// @route   PUT /api/admin/products/bulk-featured
// @access  Private/Admin
router.put('/products/bulk-featured', [
  body('updates')
    .isArray()
    .withMessage('Updates must be an array'),
  body('updates.*.productId')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('updates.*.featured')
    .isBoolean()
    .withMessage('Featured must be a boolean value')
], adminBulkController.bulkUpdateFeatured);

// @desc    Product routes (admin)
// @route   /api/admin/products
// @access  Private/Admin

// Get all products
router.get('/products', adminProductController.getProducts);

// Get single product
router.get('/products/:id', adminProductController.getProduct);

// Create new product
router.post('/products', upload.array('images', 5), [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Category must be between 1 and 50 characters'),
  body('brand')
    .trim()
    .notEmpty()
    .withMessage('Brand is required'),
  body('stockQuantity')
    .notEmpty()
    .withMessage('Stock quantity is required')
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer'),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  body('bestSeller')
    .optional()
    .isBoolean()
    .withMessage('Best seller must be a boolean'),
  body('newArrival')
    .optional()
    .isBoolean()
    .withMessage('New arrival must be a boolean'),
  body('todaysDeals')
    .optional()
    .isBoolean()
    .withMessage('Todays deals must be a boolean'),
  body('discount')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Discount must be between 0 and 100')
], adminProductController.createProduct);

// Update product
router.put('/products/:id', upload.array('images', 5), [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('stockQuantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer'),
  body('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
  body('bestSeller')
    .optional()
    .isBoolean()
    .withMessage('Best seller must be a boolean'),
  body('newArrival')
    .optional()
    .isBoolean()
    .withMessage('New arrival must be a boolean'),
  body('todaysDeals')
    .optional()
    .isBoolean()
    .withMessage('Todays deals must be a boolean'),
  body('discount')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Discount must be between 0 and 100')
], adminProductController.updateProduct);

// Delete product
router.delete('/products/:id', adminProductController.deleteProduct);

// Bulk operations

// @desc    Bulk update product stock
// @route   PUT /api/admin/products/bulk-stock
// @access  Private/Admin
router.put('/products/bulk-stock', [
  body('updates')
    .isArray()
    .withMessage('Updates must be an array'),
  body('updates.*.productId')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('updates.*.stockQuantity')
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer')
], adminBulkController.bulkUpdateStock);

// @desc    Bulk update product featured status
// @route   PUT /api/admin/products/bulk-featured
// @access  Private/Admin
router.put('/products/bulk-featured', [
  body('updates')
    .isArray()
    .withMessage('Updates must be an array'),
  body('updates.*.productId')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('updates.*.featured')
    .isBoolean()
    .withMessage('Featured must be a boolean')
], adminBulkController.bulkUpdateFeatured);

// @desc    Bulk delete products
// @route   DELETE /api/admin/products/bulk
// @access  Private/Admin
router.delete('/products/bulk', [
  body('productIds')
    .isArray()
    .withMessage('Product IDs must be an array'),
  body('productIds.*')
    .isMongoId()
    .withMessage('Invalid product ID')
], adminBulkController.bulkDeleteProducts);

// @desc    Category routes (admin)
// @route   /api/admin/categories
// @access  Private/Admin

// Create category
router.post('/categories', [
  body('name')
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ max: 50 })
    .withMessage('Category name cannot be more than 50 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot be more than 500 characters'),
  body('parentId')
    .optional()
    .isMongoId()
    .withMessage('Invalid parent category ID')
], categoryController.createCategory);

// Update category
router.put('/categories/:id', [
  body('name')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Category name cannot be more than 50 characters'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot be more than 500 characters'),
  body('parentId')
    .optional()
    .custom((value) => {
      if (value === null) return true; // Allow null to remove parent
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid parent category ID');
      }
      return true;
    })
], categoryController.updateCategory);

// Delete category
router.delete('/categories/:id', categoryController.deleteCategory);

module.exports = router;