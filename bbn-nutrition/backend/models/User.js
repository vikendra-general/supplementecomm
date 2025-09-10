const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be at least 8 characters'],
    validate: {
      validator: function(password) {
        // Skip validation if password is already hashed (starts with $2a$ or $2b$)
        if (password.startsWith('$2a$') || password.startsWith('$2b$')) {
          return true;
        }
        // Check for at least one uppercase letter, one lowercase letter, one number, and one special character
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
      },
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    },
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  addresses: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      auto: true
    },
    type: {
      type: String,
      enum: ['home', 'work', 'other'],
      default: 'home'
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pinCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      default: 'United States'
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      default: ''
    }
  }],
  wishlist: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    autoAddToCart: {
      type: Boolean,
      default: false
    },
    notifyOnRestock: {
      type: Boolean,
      default: true
    },
    variant: {
      id: String,
      name: String,
      price: Number
    },
    wasOutOfStock: {
      type: Boolean,
      default: false
    }
  }],
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  lastLogin: {
    type: Date,
    default: Date.now
  },
  stripeCustomerId: {
    type: String,
    sparse: true
  },
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    smsNotifications: {
      type: Boolean,
      default: false
    },
    marketingEmails: {
      type: Boolean,
      default: true
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'INR', 'EUR']
    },
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'es', 'fr']
    }
  },
  stats: {
    totalOrders: {
      type: Number,
      default: 0
    },
    totalSpent: {
      type: Number,
      default: 0
    },
    lastOrderDate: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Encrypt password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(12); // Increased salt rounds for better security
  this.password = await bcrypt.hash(this.password, salt);
});

// Ensure only one default address per type
userSchema.pre('save', function(next) {
  if (this.isModified('addresses')) {
    const addressTypes = {};
    this.addresses.forEach(address => {
      if (address.isDefault) {
        if (addressTypes[address.type]) {
          address.isDefault = false;
        } else {
          addressTypes[address.type] = true;
        }
      }
    });
  }
  next();
});

// Sign JWT and return
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, email: this.email, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

// Generate email verification token
userSchema.methods.getEmailVerificationToken = function() {
  const verificationToken = crypto.randomBytes(20).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
    
  this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return verificationToken;
};

// Add address
userSchema.methods.addAddress = function(addressData) {
  // If this is the first address or marked as default, make it default
  if (this.addresses.length === 0 || addressData.isDefault) {
    this.addresses.forEach(addr => {
      if (addr.type === addressData.type) {
        addr.isDefault = false;
      }
    });
  }
  
  this.addresses.push(addressData);
  return this.save();
};

// Update address
userSchema.methods.updateAddress = function(addressId, addressData) {
  const addressIndex = this.addresses.findIndex(addr => addr._id.toString() === addressId);
  
  if (addressIndex === -1) {
    throw new Error('Address not found');
  }
  
  // If making this address default, unset others of same type
  if (addressData.isDefault) {
    this.addresses.forEach(addr => {
      if (addr.type === addressData.type && addr._id.toString() !== addressId) {
        addr.isDefault = false;
      }
    });
  }
  
  this.addresses[addressIndex] = { ...this.addresses[addressIndex], ...addressData };
  return this.save();
};

// Remove address
userSchema.methods.removeAddress = function(addressId) {
  this.addresses = this.addresses.filter(addr => addr._id.toString() !== addressId);
  return this.save();
};

// Add to wishlist
userSchema.methods.addToWishlist = function(productId, options = {}) {
  const existingItem = this.wishlist.find(item => 
    item.product.toString() === productId && 
    (!options.variant || item.variant?.id === options.variant?.id)
  );
  
  if (!existingItem) {
    const wishlistItem = {
      product: productId,
      autoAddToCart: options.autoAddToCart || false,
      notifyOnRestock: options.notifyOnRestock !== false,
      variant: options.variant || null,
      wasOutOfStock: options.wasOutOfStock || false
    };
    this.wishlist.push(wishlistItem);
  } else {
    // Update existing item
    if (options.autoAddToCart !== undefined) existingItem.autoAddToCart = options.autoAddToCart;
    if (options.notifyOnRestock !== undefined) existingItem.notifyOnRestock = options.notifyOnRestock;
    if (options.wasOutOfStock !== undefined) existingItem.wasOutOfStock = options.wasOutOfStock;
  }
  return this.save();
};

// Remove from wishlist
userSchema.methods.removeFromWishlist = function(productId, variantId = null) {
  this.wishlist = this.wishlist.filter(item => {
    const productMatch = item.product.toString() !== productId;
    const variantMatch = !variantId || item.variant?.id !== variantId;
    return productMatch || !variantMatch;
  });
  return this.save();
};

userSchema.methods.updateWishlistItem = function(productId, updates, variantId = null) {
  const item = this.wishlist.find(item => 
    item.product.toString() === productId && 
    (!variantId || item.variant?.id === variantId)
  );
  
  if (item) {
    Object.assign(item, updates);
    return this.save();
  }
  return Promise.resolve(this);
};

userSchema.methods.getWishlistItemsForAutoCart = function() {
  return this.wishlist.filter(item => item.autoAddToCart && item.wasOutOfStock);
};

userSchema.methods.getWishlistItemsForNotification = function() {
  return this.wishlist.filter(item => item.notifyOnRestock && item.wasOutOfStock);
};

// Update user stats
userSchema.methods.updateStats = function(orderTotal) {
  this.stats.totalOrders += 1;
  this.stats.totalSpent += orderTotal;
  this.stats.lastOrderDate = new Date();
  return this.save();
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// Virtual for default address
userSchema.virtual('defaultAddress').get(function() {
  if (!this.addresses || this.addresses.length === 0) {
    return null;
  }
  return this.addresses.find(addr => addr.isDefault) || this.addresses[0];
});

// Indexes
// Note: email index is automatically created by unique: true
userSchema.index({ role: 1 });
userSchema.index({ 'addresses.isDefault': 1 });
userSchema.index({ deletedAt: 1 });

module.exports = mongoose.model('User', userSchema);