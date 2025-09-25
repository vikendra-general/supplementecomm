const nodemailer = require('nodemailer');
const twilio = require('twilio');
const crypto = require('crypto');

// In-memory storage for OTPs (in production, use Redis or database)
const otpStorage = new Map();

// Email configuration using Gmail (free)
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_APP_PASSWORD // Gmail App Password (not regular password)
    }
  });
};

// Twilio configuration (free tier: $15 credit)
let twilioClient = null;
try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
} catch (error) {
  console.warn('Twilio configuration failed:', error.message);
  twilioClient = null;
}

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTP with expiration (5 minutes)
const storeOTP = (identifier, otp) => {
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
  otpStorage.set(identifier, { otp, expiresAt });
  
  // Auto cleanup expired OTPs
  setTimeout(() => {
    otpStorage.delete(identifier);
  }, 5 * 60 * 1000);
};

// Verify OTP
const verifyOTP = (identifier, providedOTP) => {
  const stored = otpStorage.get(identifier);
  
  if (!stored) {
    return { success: false, message: 'OTP not found or expired' };
  }
  
  if (Date.now() > stored.expiresAt) {
    otpStorage.delete(identifier);
    return { success: false, message: 'OTP has expired' };
  }
  
  if (stored.otp !== providedOTP) {
    return { success: false, message: 'Invalid OTP' };
  }
  
  // OTP is valid, remove it
  otpStorage.delete(identifier);
  return { success: true, message: 'OTP verified successfully' };
};

// Send Email OTP
const sendEmailOTP = async (email, name) => {
  try {
    const otp = generateOTP();
    const transporter = createEmailTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'BBN Nutrition - Email Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">BBN Nutrition - Email Verification</h2>
          <p>Hello ${name},</p>
          <p>Thank you for registering with BBN Nutrition. Please use the following OTP to verify your email address:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #16a34a; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p>This OTP will expire in 5 minutes.</p>
          <p>If you didn't request this verification, please ignore this email.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #6b7280; font-size: 12px;">BBN Nutrition - Your Health, Our Priority</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    storeOTP(email, otp);
    
    return { success: true, message: 'OTP sent to email successfully' };
  } catch (error) {
    console.error('Email OTP error:', error);
    return { success: false, message: 'Failed to send email OTP' };
  }
};

// Send SMS OTP (requires Twilio setup)
const sendSMSOTP = async (phone, name) => {
  try {
    if (!twilioClient) {
      return { success: false, message: 'SMS service not configured' };
    }
    
    const otp = generateOTP();
    
    await twilioClient.messages.create({
      body: `BBN Nutrition: Your verification code is ${otp}. Valid for 5 minutes. Don't share this code with anyone.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    
    storeOTP(phone, otp);
    
    return { success: true, message: 'OTP sent to phone successfully' };
  } catch (error) {
    console.error('SMS OTP error:', error);
    return { success: false, message: 'Failed to send SMS OTP' };
  }
};

// Alternative free SMS services (you can implement these)
const sendFreeSMSOTP = async (phone, name) => {
  // For completely free SMS, you can use services like:
  // 1. TextBelt (free tier: 1 SMS per day per IP)
  // 2. Fast2SMS (India - free tier available)
  // 3. MSG91 (India - free tier available)
  
  // Example with TextBelt (US numbers only, 1 free SMS per day)
  try {
    const otp = generateOTP();
    
    const response = await fetch('https://textbelt.com/text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: phone,
        message: `BBN Nutrition: Your verification code is ${otp}. Valid for 5 minutes.`,
        key: 'textbelt' // Free tier key
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      storeOTP(phone, otp);
      return { success: true, message: 'OTP sent to phone successfully' };
    } else {
      return { success: false, message: result.error || 'Failed to send SMS OTP' };
    }
  } catch (error) {
    console.error('Free SMS OTP error:', error);
    return { success: false, message: 'Failed to send SMS OTP' };
  }
};

module.exports = {
  sendEmailOTP,
  sendSMSOTP,
  sendFreeSMSOTP,
  verifyOTP,
  generateOTP
};