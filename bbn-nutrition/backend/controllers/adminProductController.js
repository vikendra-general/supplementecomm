const Product = require('../models/Product');
const { validationResult } = require('express-validator');

// @desc    Get all products (admin)
// @access  Private/Admin
exports.getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      brand,
      inStock,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (brand) {
      filter.brand = { $regex: brand, $options: 'i' };
    }

    if (inStock !== undefined) {
      filter.inStock = inStock === 'true';
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get admin products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new product (admin)
// @access  Private/Admin
exports.createProduct = async (req, res) => {
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

    const productData = req.body;

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      productData.images = req.files.map(file => file.path);
    }

    // Handle variants if provided
    if (productData.variants && typeof productData.variants === 'string') {
      try {
        productData.variants = JSON.parse(productData.variants);
        // Ensure each variant has an id
        if (Array.isArray(productData.variants)) {
          productData.variants = productData.variants.map((variant, index) => {
            if (!variant.id) {
              variant.id = `variant-${index}`;
            }
            return variant;
          });
        }
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: 'Invalid variants format'
        });
      }
    }

    // Handle nutrition facts if provided
    if (productData.nutritionFacts && typeof productData.nutritionFacts === 'string') {
      try {
        productData.nutritionFacts = JSON.parse(productData.nutritionFacts);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: 'Invalid nutrition facts format'
        });
      }
    }

    // Handle tags if provided
    if (productData.tags && typeof productData.tags === 'string') {
      productData.tags = productData.tags.split(',').map(tag => tag.trim());
    }

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during product creation'
    });
  }
};

// @desc    Update product (admin)
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
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

    const productData = req.body;

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      productData.images = req.files.map(file => file.path);
    }

    // Handle variants if provided
    if (productData.variants && typeof productData.variants === 'string') {
      try {
        productData.variants = JSON.parse(productData.variants);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: 'Invalid variants format'
        });
      }
    }

    // Handle nutrition facts if provided
    if (productData.nutritionFacts && typeof productData.nutritionFacts === 'string') {
      try {
        productData.nutritionFacts = JSON.parse(productData.nutritionFacts);
      } catch (err) {
        return res.status(400).json({
          success: false,
          message: 'Invalid nutrition facts format'
        });
      }
    }

    // Handle tags if provided
    if (productData.tags && typeof productData.tags === 'string') {
      productData.tags = productData.tags.split(',').map(tag => tag.trim());
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      productData,
      {
        new: true,
        runValidators: true
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during product update'
    });
  }
};

// @desc    Delete product (admin)
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    await Product.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during product deletion'
    });
  }
};

// @desc    Get single product (admin)
// @access  Private/Admin
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Bulk update featured status (admin)
// @access  Private/Admin
exports.bulkUpdateFeatured = async (req, res) => {
  try {
    const { updates } = req.body;
    
    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid updates format'
      });
    }
    
    const updatePromises = updates.map(async (update) => {
      const { productId, featured } = update;
      
      if (!productId) {
        throw new Error('Product ID is required');
      }
      
      if (featured === undefined) {
        throw new Error('Featured status is required');
      }
      
      const product = await Product.findByIdAndUpdate(
        productId,
        { featured },
        { new: true, runValidators: true }
      );
      
      if (!product) {
        throw new Error(`Product with ID ${productId} not found`);
      }
      
      return product;
    });
    
    await Promise.all(updatePromises);
    
    res.json({
      success: true,
      message: 'Featured status updated successfully',
      data: { modifiedCount: updates.length }
    });
  } catch (error) {
    console.error('Bulk update featured error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during product update'
    });
  }
};