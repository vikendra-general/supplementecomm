const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const cartService = require('../services/cartService');

const router = express.Router();

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const cart = await cartService.getCart(req.user.id);
    
    res.json({
      success: true,
      cart: cart
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
router.post('/add', protect, [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required'),
  body('quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer')
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

    const { productId, quantity, variant } = req.body;
    
    const cart = await cartService.addItemToCart(
      req.user.id,
      productId,
      quantity,
      variant
    );
    
    res.json({
      success: true,
      message: 'Item added to cart',
      cart: cart
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Update item quantity in cart
// @route   PUT /api/cart/update
// @access  Private
router.put('/update', protect, [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required'),
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer')
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

    const { productId, quantity, variant } = req.body;
    
    let cart;
    if (quantity === 0) {
      // Remove item if quantity is 0
      cart = await cartService.removeItemFromCart(
        req.user.id,
        productId,
        variant
      );
    } else {
      // Update quantity
      cart = await cartService.updateItemQuantity(
        req.user.id,
        productId,
        quantity,
        variant
      );
    }
    
    res.json({
      success: true,
      message: 'Cart updated',
      cart: cart
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove
// @access  Private
router.delete('/remove', protect, [
  body('productId')
    .notEmpty()
    .withMessage('Product ID is required')
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

    const { productId, variant } = req.body;
    
    const cart = await cartService.removeItemFromCart(
      req.user.id,
      productId,
      variant
    );
    
    res.json({
      success: true,
      message: 'Item removed from cart',
      cart: cart
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
router.delete('/clear', protect, async (req, res) => {
  try {
    await cartService.clearCart(req.user.id);
    
    res.json({
      success: true,
      message: 'Cart cleared'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Sync local cart with server cart
// @route   POST /api/cart/sync
// @access  Private
router.post('/sync', protect, [
  body('items')
    .isArray()
    .withMessage('Items must be an array')
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

    const { items } = req.body;
    
    // Clear existing cart
    cartService.clearCart(req.user.id);
    
    // Add all items from local cart
    const results = {
      success: [],
      failed: []
    };
    
    for (const item of items) {
      try {
        await cartService.addItemToCart(
          req.user.id,
          item.productId,
          item.quantity,
          item.variant
        );
        results.success.push(item);
      } catch (error) {
        results.failed.push({
          ...item,
          error: error.message
        });
      }
    }
    
    const cart = cartService.getCart(req.user.id);
    
    res.json({
      success: true,
      message: 'Cart synced',
      cart: cart,
      syncResults: results
    });
  } catch (error) {
    console.error('Sync cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get cart statistics
// @route   GET /api/cart/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const stats = cartService.getCartStats(req.user.id);
    
    res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    console.error('Get cart stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;