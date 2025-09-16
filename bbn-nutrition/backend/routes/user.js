const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get user addresses
// @route   GET /api/user/addresses
// @access  Private
router.get('/addresses', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      addresses: user.addresses
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Add new address
// @route   POST /api/user/addresses
// @access  Private
router.post('/addresses', protect, [
  body('type')
    .isIn(['home', 'work', 'other'])
    .withMessage('Type must be home, work, or other'),
  body('address')
    .notEmpty()
    .withMessage('Address is required'),
  body('city')
    .notEmpty()
    .withMessage('City is required'),
  body('state')
    .notEmpty()
    .withMessage('State is required'),
  body('pinCode')
    .notEmpty()
    .withMessage('PIN code is required'),
  body('country')
    .optional()
    .isString()
    .withMessage('Country must be a string')
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

    const { type, address, city, state, pinCode, country = 'India', isDefault = false } = req.body;

    const user = await User.findById(req.user.id);

    // If this is the first address or isDefault is true, set all other addresses to not default
    if (isDefault || user.addresses.length === 0) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    // Add new address
    user.addresses.push({
      type,
      address,
      city,
      state,
      pinCode,
      country,
      isDefault: isDefault || user.addresses.length === 0
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      addresses: user.addresses
    });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during address addition'
    });
  }
});

// @desc    Update address
// @route   PUT /api/user/addresses/:id
// @access  Private
router.put('/addresses/:id', protect, [
  body('type')
    .optional()
    .isIn(['home', 'work', 'other'])
    .withMessage('Type must be home, work, or other'),
  body('address')
    .optional()
    .notEmpty()
    .withMessage('Address cannot be empty'),
  body('city')
    .optional()
    .notEmpty()
    .withMessage('City cannot be empty'),
  body('state')
    .optional()
    .notEmpty()
    .withMessage('State cannot be empty'),
  body('pinCode')
    .optional()
    .notEmpty()
    .withMessage('PIN code cannot be empty')
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

    const { id } = req.params;
    const { type, address, city, state, pinCode, country, isDefault } = req.body;

    const user = await User.findById(req.user.id);
    
    // Find the address to update
    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === id);
    
    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Update address fields
    if (type) user.addresses[addressIndex].type = type;
    if (address) user.addresses[addressIndex].address = address;
    if (city) user.addresses[addressIndex].city = city;
    if (state) user.addresses[addressIndex].state = state;
    if (pinCode) user.addresses[addressIndex].pinCode = pinCode;
    if (country) user.addresses[addressIndex].country = country;

    // If setting as default, update other addresses
    if (isDefault) {
      user.addresses.forEach((addr, index) => {
        addr.isDefault = index === addressIndex;
      });
    }

    await user.save();

    res.json({
      success: true,
      message: 'Address updated successfully',
      addresses: user.addresses
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during address update'
    });
  }
});

// @desc    Delete address
// @route   DELETE /api/user/addresses/:id
// @access  Private
router.delete('/addresses/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(req.user.id);
    
    // Find the address to delete
    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === id);
    
    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Remove the address
    user.addresses.splice(addressIndex, 1);

    // If we deleted the default address and there are other addresses, set the first one as default
    if (user.addresses.length > 0 && !user.addresses.some(addr => addr.isDefault)) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Address deleted successfully',
      addresses: user.addresses
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during address deletion'
    });
  }
});

// @desc    Get user wishlist
// @route   GET /api/user/wishlist
// @access  Private
router.get('/wishlist', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist.product');
    
    res.json({
      success: true,
      wishlist: user.wishlist
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Add product to wishlist
// @route   POST /api/user/wishlist/:productId
// @access  Private
router.post('/wishlist/:productId', protect, [
  body('autoAddToCart').optional().isBoolean().withMessage('autoAddToCart must be a boolean'),
  body('notifyOnRestock').optional().isBoolean().withMessage('notifyOnRestock must be a boolean'),
  body('variant').optional().isObject().withMessage('variant must be an object')
], async (req, res) => {
  try {
    const { productId } = req.params;
    const { autoAddToCart, notifyOnRestock, variant } = req.body;

    const user = await User.findById(req.user.id);
    
    // Check if product exists
    const Product = require('../models/Product');
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if product is out of stock
    const isOutOfStock = !product.inStock || product.stockQuantity === 0;
    
    // Add to wishlist with options
    await user.addToWishlist(productId, {
      autoAddToCart: autoAddToCart || false,
      notifyOnRestock: notifyOnRestock !== false,
      variant: variant || null,
      wasOutOfStock: isOutOfStock
    });

    // Populate the wishlist for response
    await user.populate('wishlist.product');

    res.json({
      success: true,
      message: 'Product added to wishlist',
      wishlist: user.wishlist
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during wishlist addition'
    });
  }
});

// @desc    Remove product from wishlist
// @route   DELETE /api/user/wishlist/:productId
// @access  Private
router.delete('/wishlist/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;
    const { variantId } = req.query;

    const user = await User.findById(req.user.id);

    // Remove from wishlist
    await user.removeFromWishlist(productId, variantId);
    
    // Populate the wishlist for response
    await user.populate('wishlist.product');

    res.json({
      success: true,
      message: 'Product removed from wishlist',
      wishlist: user.wishlist
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during wishlist removal'
    });
  }
});

// @desc    Update wishlist item preferences
// @route   PUT /api/user/wishlist/:productId
// @access  Private
router.put('/wishlist/:productId', protect, [
  body('autoAddToCart').optional().isBoolean().withMessage('autoAddToCart must be a boolean'),
  body('notifyOnRestock').optional().isBoolean().withMessage('notifyOnRestock must be a boolean')
], async (req, res) => {
  try {
    const { productId } = req.params;
    const { variantId } = req.query;
    const { autoAddToCart, notifyOnRestock } = req.body;

    const user = await User.findById(req.user.id);
    
    const updates = {};
    if (autoAddToCart !== undefined) updates.autoAddToCart = autoAddToCart;
    if (notifyOnRestock !== undefined) updates.notifyOnRestock = notifyOnRestock;

    await user.updateWishlistItem(productId, updates, variantId);
    
    // Populate the wishlist for response
    await user.populate('wishlist.product');

    res.json({
      success: true,
      message: 'Wishlist item updated',
      wishlist: user.wishlist
    });
  } catch (error) {
    console.error('Update wishlist item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during wishlist update'
    });
  }
});

// @desc    Verify user phone number
// @route   PUT /api/user/verify-phone
// @access  Private
router.put('/verify-phone', protect, [
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/)
    .withMessage('Please provide a valid Indian phone number')
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

    const { phone } = req.body;

    // Update user's phone and mark as verified
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        phone: phone,
        phoneVerified: true 
      },
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
      message: 'Phone number verified successfully',
      user: user
    });
  } catch (error) {
    console.error('Verify phone error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;