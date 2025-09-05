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
    console.log('🔄 Address update request received:');
    console.log('Address ID:', req.params.id);
    console.log('User ID:', req.user.id);
    console.log('Request body:', req.body);
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { type, address, city, state, pinCode, country, isDefault } = req.body;

    const user = await User.findById(req.user.id);
    console.log('👤 User found:', user ? 'Yes' : 'No');
    console.log('📍 User addresses count:', user ? user.addresses.length : 0);
    
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
    console.log('✅ Address updated successfully');
    console.log('📍 Updated addresses count:', user.addresses.length);

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
    const user = await User.findById(req.user.id).populate('wishlist');
    
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
router.post('/wishlist/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user.id);

    // Check if product is already in wishlist
    if (user.wishlist.includes(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }

    // Add to wishlist
    user.wishlist.push(productId);
    await user.save();

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

    const user = await User.findById(req.user.id);

    // Remove from wishlist
    user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    await user.save();

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

module.exports = router;