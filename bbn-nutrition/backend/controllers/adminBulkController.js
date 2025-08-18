const Product = require('../models/Product');
const { validationResult } = require('express-validator');

// @desc    Bulk update product stock
// @route   PUT /api/admin/products/bulk-stock
// @access  Private/Admin
exports.bulkUpdateStock = async (req, res) => {
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
};

// @desc    Bulk update product featured status
// @route   PUT /api/admin/products/bulk-featured
// @access  Private/Admin
exports.bulkUpdateFeatured = async (req, res) => {
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
            featured: update.featured
          }
        }
      }
    }));

    const result = await Product.bulkWrite(bulkOps);

    res.json({
      success: true,
      message: 'Featured status updated successfully',
      data: {
        modifiedCount: result.modifiedCount
      }
    });
  } catch (error) {
    console.error('Bulk update featured error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Bulk delete products
// @route   DELETE /api/admin/products/bulk
// @access  Private/Admin
exports.bulkDeleteProducts = async (req, res) => {
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

    const { productIds } = req.body;

    const result = await Product.deleteMany({
      _id: { $in: productIds }
    });

    res.json({
      success: true,
      message: 'Products deleted successfully',
      data: {
        deletedCount: result.deletedCount
      }
    });
  } catch (error) {
    console.error('Bulk delete products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};