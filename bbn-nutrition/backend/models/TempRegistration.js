const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const tempRegistrationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  mobile: {
    type: String,
    required: false
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailOTPAttempts: {
    type: Number,
    default: 0
  },
  lastEmailOTPSent: {
    type: Date
  },
  emailOTP: {
    type: String
  },
  emailOTPExpire: {
    type: Date
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 3600000) // Expires after 1 hour (3600000 milliseconds)
  }
}, {
  timestamps: true
});

// Hash password before saving
tempRegistrationSchema.pre('save', async function(next) {
  console.log('🔍 TempRegistration pre-save hook triggered');
  console.log('📧 Email:', this.email);
  console.log('👤 Name:', this.name);
  console.log('🔒 Password modified:', this.isModified('password'));
  console.log('📅 ExpiresAt:', this.expiresAt);
  console.log('✅ IsEmailVerified:', this.isEmailVerified);
  
  if (!this.isModified('password')) {
    console.log('⏭️ Password not modified, skipping hash');
    return next();
  }

  try {
    console.log('🔐 Hashing password...');
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('✅ Password hashed successfully');
    next();
  } catch (error) {
    console.error('❌ Error hashing password:', error);
    next(error);
  }
});

// Add post-save hook for debugging
tempRegistrationSchema.post('save', function(doc, next) {
  console.log('✅ TempRegistration saved successfully');
  console.log('📄 Saved document ID:', doc._id);
  console.log('📧 Saved email:', doc.email);
  console.log('📅 Saved expiresAt:', doc.expiresAt);
  next();
});

// Add error handling for save operations
tempRegistrationSchema.post('save', function(error, doc, next) {
  if (error) {
    console.error('❌ TempRegistration save error:', error);
    console.error('📄 Failed document:', doc);
  }
  next(error);
});

// Method to check if registration is complete (email verified)
tempRegistrationSchema.methods.isRegistrationComplete = function() {
  return this.isEmailVerified;
};

// Method to get user data for final account creation
tempRegistrationSchema.methods.getUserData = function() {
  return {
    name: this.name,
    email: this.email,
    mobile: this.mobile,
    password: this.password, // Already hashed
    isEmailVerified: this.isEmailVerified
  };
};

module.exports = mongoose.model('TempRegistration', tempRegistrationSchema);