const express = require('express');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const TempRegistration = require('../models/TempRegistration');
const { protect } = require('../middleware/auth');
const { sendEmailOTP, verifyOTP } = require('../services/otpService');

const router = express.Router();

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
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

    const { name, email, password } = req.body;

    // Check if user already exists with email (in both User and TempRegistration collections)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists. Please sign in instead.'
      });
    }

    // Check if username (name) already exists in User collection
    const existingUserByName = await User.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
    });
    if (existingUserByName) {
      return res.status(400).json({
        success: false,
        message: 'This username is already taken. Please choose a different username.'
      });
    }

    // Check if there's already a temporary registration for this email
    let tempRegistration = await TempRegistration.findOne({ email });
    
    if (tempRegistration) {
      // Update existing temporary registration
      tempRegistration.name = name;
      tempRegistration.password = password;
      tempRegistration.isEmailVerified = false;
      tempRegistration.emailOTPAttempts = 0;
      tempRegistration.expiresAt = new Date(Date.now() + 3600000); // Reset expiry to 1 hour from now
      await tempRegistration.save();
      
      return res.status(200).json({
        success: true,
        message: 'Registration data updated. Please verify your email to complete registration.',
        tempRegistration: {
          id: tempRegistration._id,
          name: tempRegistration.name,
          email: tempRegistration.email,
          isEmailVerified: tempRegistration.isEmailVerified
        }
      });
    }

    // Create new temporary registration
    console.log('🔍 Creating new TempRegistration with data:', { name, email, password: '[PRESENT]' });
    tempRegistration = await TempRegistration.create({
      name,
      email,
      password,
      isEmailVerified: false
    });
    console.log('✅ TempRegistration created successfully:', {
      id: tempRegistration._id,
      name: tempRegistration.name,
      email: tempRegistration.email,
      isEmailVerified: tempRegistration.isEmailVerified
    });

    res.status(201).json({
      success: true,
      message: 'Registration initiated. Please verify your email to complete registration.',
      tempRegistration: {
        id: tempRegistration._id,
        name: tempRegistration.name,
        email: tempRegistration.email,
        isEmailVerified: tempRegistration.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @desc    Send OTP for email verification
// @route   POST /api/auth/send-email-otp
// @access  Public
router.post('/send-email-otp', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { email, name } = req.body;

    // Check if user exists in User collection (for existing users)
    let user = await User.findOne({ email });
    let tempRegistration = null;
    
    if (!user) {
      // Check if user exists in TempRegistration collection (for new registrations)
      tempRegistration = await TempRegistration.findOne({ email });
      if (!tempRegistration) {
        return res.status(404).json({
          success: false,
          message: 'No registration found with this email address. Please register first.'
        });
      }
    }

    // If user exists and email is already verified, don't send OTP
    if (user && user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified for this account'
      });
    }

    // If temp registration exists and email is already verified, don't send OTP
    if (tempRegistration && tempRegistration.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified for this registration'
      });
    }

    // Use provided name or user's name if available
    const userName = name || (user ? user.name : (tempRegistration ? tempRegistration.name : 'User'));

    // Send OTP
    const result = await sendEmailOTP(email, userName);
    
    if (result.success) {
      // Update last OTP sent time and attempts for temp registration
      if (tempRegistration) {
        tempRegistration.lastEmailOTPSent = new Date();
        tempRegistration.emailOTPAttempts += 1;
        await tempRegistration.save();
      }
      
      res.status(200).json({
        success: true,
        message: result.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Send email OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending OTP'
    });
  }
});

// @desc    Complete registration after email verification
// @route   POST /api/auth/verify-email-otp
// @access  Public
router.post('/verify-email-otp', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be a 6-digit number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { email, otp } = req.body;

    // Verify OTP first
    const otpResult = await verifyOTP(email, otp);
    
    if (!otpResult.success) {
      return res.status(400).json({
        success: false,
        message: otpResult.message || 'Invalid OTP'
      });
    }

    // Check if user exists in User collection (for existing users)
    let user = await User.findOne({ email });
    let tempRegistration = null;
    
    if (!user) {
      // Check if user exists in TempRegistration collection (for new registrations)
      // Need to explicitly select password field since it's set to select: false
      tempRegistration = await TempRegistration.findOne({ email }).select('+password');
      if (!tempRegistration) {
        return res.status(404).json({
          success: false,
          message: 'No registration found with this email address'
        });
      }
    }

    // For existing users, update email verification status
    if (user) {
      user.emailVerified = true;
      await user.save();

      // Generate token if email is verified (OR logic - either email OR phone verification is sufficient)
      let token = null;
      if (user.emailVerified) {
        token = user.getSignedJwtToken();
        user.lastLogin = new Date();
        await user.save();
      }

      res.status(200).json({
        success: true,
        message: 'Email verified successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar,
          emailVerified: user.emailVerified,
          isPhoneVerified: user.isPhoneVerified
        }
      });
    } else {
      // For temporary registrations, automatically complete registration after email verification
      tempRegistration.isEmailVerified = true;
      await tempRegistration.save();

      // Check if user already exists (double-check)
      const existingUser = await User.findOne({ email: tempRegistration.email });
      if (existingUser) {
        // Delete temp registration and return error
        await TempRegistration.findByIdAndDelete(tempRegistration._id);
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Create the actual user account
      const newUser = new User({
        name: tempRegistration.name,
        email: tempRegistration.email,
        password: tempRegistration.password, // This is already hashed from TempRegistration
        isEmailVerified: true,
        role: 'user'
      });
      
      // Save without triggering password hashing middleware since it's already hashed
      await newUser.save({ validateBeforeSave: false });

      // Delete the temporary registration
      await TempRegistration.findByIdAndDelete(tempRegistration._id);

      // Generate JWT token and log the user in
      const token = newUser.getSignedJwtToken();
      newUser.lastLogin = new Date();
      await newUser.save();

      res.status(200).json({
        success: true,
        message: 'Email verified and registration completed successfully! You are now logged in.',
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          avatar: newUser.avatar,
          isEmailVerified: newUser.isEmailVerified,
          isPhoneVerified: newUser.isPhoneVerified
        }
      });
    }
  } catch (error) {
    console.error('Verify email OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while verifying OTP'
    });
  }
});



// @desc    Complete registration after OTP verification
// @route   POST /api/auth/complete-registration
// @access  Public
router.post('/complete-registration', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    // Find temporary registration (explicitly select password field)
    const tempRegistration = await TempRegistration.findOne({ email }).select('+password');
    if (!tempRegistration) {
      return res.status(404).json({
        success: false,
        message: 'No temporary registration found with this email address'
      });
    }

    // Check if email is verified
    if (!tempRegistration.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Please verify your email before completing registration',
        isEmailVerified: tempRegistration.isEmailVerified
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email address'
      });
    }

    // Create the actual user account
    const userData = tempRegistration.getUserData();
    console.log('🔍 User data from temp registration:', userData);
    
    const user = new User({
      ...userData,
      emailVerified: true
    });
    
    console.log('🔍 User object before save:', {
      name: user.name,
      email: user.email,
      password: user.password ? '[PRESENT]' : '[MISSING]',
      emailVerified: user.emailVerified
    });

    await user.save();
    console.log('✅ User saved successfully with ID:', user._id);

    // Delete temporary registration
    await TempRegistration.findByIdAndDelete(tempRegistration._id);
    console.log('🗑️ Temporary registration deleted');

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration completed successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Complete registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while completing registration'
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
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

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Skip verification for admin users and existing users (created before verification was implemented)
    // Only require verification for new regular users
    const isAdmin = user.role === 'admin';
    const isExistingUser = user.createdAt < new Date('2024-01-01'); // Users created before verification system
    const requiresVerification = !isAdmin && !isExistingUser && !user.isEmailVerified;
    
    if (requiresVerification) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email address before logging in',
        requiresVerification: true,
        user: {
          id: user._id,
          email: user.email,
          phone: user.phone,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: true // Default to true since phone verification is not implemented
        }
      });
    }

    // Create token
    const token = user.getSignedJwtToken();

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: true // Default to true since phone verification is not implemented
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        phoneVerified: user.phoneVerified,
        addresses: user.addresses,
        wishlist: user.wishlist,
        emailVerified: user.emailVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
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

    const fieldsToUpdate = {};
    const { name, email, phone, avatar } = req.body;

    if (name) fieldsToUpdate.name = name;
    if (email) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ 
        email: email,
        _id: { $ne: req.user.id }
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email is already registered with another account'
        });
      }
      
      fieldsToUpdate.email = email;
      // If email is changed, mark as unverified
      if (email !== req.user.email) {
        fieldsToUpdate.emailVerified = false;
      }
    }
    if (phone) fieldsToUpdate.phone = phone;
    if (avatar) fieldsToUpdate.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        addresses: user.addresses,
        wishlist: user.wishlist,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile update'
    });
  }
});

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
router.put('/password', protect, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
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

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during password change'
    });
  }
});

// @desc    Forgot password - Send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
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

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email address'
      });
    }

    // Send OTP to email
    const result = await sendEmailOTP(email, user.name);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Password reset OTP sent to your email'
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message || 'Failed to send OTP'
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset request'
    });
  }
});

// @desc    Verify forgot password OTP
// @route   POST /api/auth/verify-forgot-password-otp
// @access  Public
router.post('/verify-forgot-password-otp', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
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

    const { email, otp } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email address'
      });
    }

    // Verify OTP
    const result = await verifyOTP(email, otp);
    
    if (result.success) {
      // Generate a temporary reset token for password reset
      const resetToken = user.getResetPasswordToken();
      await user.save({ validateBeforeSave: false });

      res.json({
        success: true,
        message: 'OTP verified successfully',
        resetToken
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('Verify forgot password OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while verifying OTP'
    });
  }
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password', [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
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

    const { token, password } = req.body;

    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset'
    });
  }
});

// @desc    Verify email
// @route   POST /api/auth/verify-email
// @access  Public
router.post('/verify-email', [
  body('token')
    .notEmpty()
    .withMessage('Verification token is required')
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

    const { token } = req.body;

    // Get hashed token
    const emailVerificationToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken,
      emailVerificationExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Mark email as verified
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during email verification'
    });
  }
});

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
router.post('/resend-verification', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
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

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email address'
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Get verification token
    const verificationToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Create verification URL
    // const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/verify-email?token=${verificationToken}&email=${email}`;

    // Email service integration would go here
    // For development, the verification link is available in server logs
    console.log(`Verification link: ${process.env.FRONTEND_URL || 'http://localhost:3001'}/verify-email?token=${verificationToken}&email=${email}`);

    res.json({
      success: true,
      message: 'Verification email sent'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during verification email resend'
    });
  }
});

module.exports = router;