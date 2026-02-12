const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('../models/User');
const TempRegistration = require('../models/TempRegistration');

// Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD
    }
  });
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send Email OTP
const sendEmailOTP = async (email, userName) => {
  try {
    const otp = generateOTP();
    const otpExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Check if it's for registration or password reset
    let tempUser = await TempRegistration.findOne({ email });
    let user = await User.findOne({ email });

    if (tempUser) {
      // Registration OTP
      tempUser.emailOTP = otp;
      tempUser.emailOTPExpire = otpExpire;
      tempUser.emailOTPAttempts = (tempUser.emailOTPAttempts || 0) + 1;
      tempUser.lastEmailOTPSent = new Date();
      await tempUser.save();
    } else if (user) {
      // Password reset OTP
      user.resetPasswordOTP = otp;
      user.resetPasswordOTPExpire = otpExpire;
      user.resetPasswordOTPAttempts = (user.resetPasswordOTPAttempts || 0) + 1;
      user.lastResetPasswordOTPSent = new Date();
      await user.save();
    } else {
      return {
        success: false,
        message: 'User not found'
      };
    }

    // Send email
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: tempUser ? 'Email Verification OTP' : 'Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Hello ${userName}!</h2>
          <p>Your ${tempUser ? 'email verification' : 'password reset'} OTP is:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return {
      success: true,
      message: 'OTP sent successfully'
    };
  } catch (error) {
    console.error('Error sending email OTP:', error);
    return {
      success: false,
      message: 'Failed to send OTP'
    };
  }
};

// Verify OTP
const verifyOTP = async (email, otp) => {
  try {
    // Check in TempRegistration first (for email verification)
    let tempUser = await TempRegistration.findOne({ email });
    
    if (tempUser && tempUser.emailOTP === otp && new Date(tempUser.emailOTPExpire) > new Date()) {
      tempUser.isEmailVerified = true;
      tempUser.emailOTP = undefined;
      tempUser.emailOTPExpire = undefined;
      await tempUser.save();
      
      return {
        success: true,
        message: 'Email verified successfully',
        type: 'registration'
      };
    }

    // Check in User model (for password reset)
    let user = await User.findOne({ email });
    if (user && user.resetPasswordOTP === otp && new Date(user.resetPasswordOTPExpire) > new Date()) {
      // Don't clear the OTP yet - it will be cleared when password is actually reset
      return {
        success: true,
        message: 'OTP verified successfully',
        type: 'password_reset',
        resetToken: user.resetPasswordToken
      };
    }

    return {
      success: false,
      message: 'Invalid or expired OTP'
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return {
      success: false,
      message: 'Failed to verify OTP'
    };
  }
};

module.exports = {
  sendEmailOTP,
  verifyOTP
};