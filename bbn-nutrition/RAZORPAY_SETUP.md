# Razorpay Payment Gateway Setup Guide

## Overview
This guide will help you set up Razorpay payment integration for the BBN Nutrition e-commerce application.

## Prerequisites
- A Razorpay account (sign up at https://razorpay.com/)
- Access to Razorpay Dashboard

## Step 1: Generate API Keys

### For Test Mode (Development)
1. Log in to your Razorpay Dashboard
2. Navigate to **Account & Settings** → **API Keys**
3. Under **Test Mode**, click **Generate Test Key**
4. Copy both:
   - **Key ID** (starts with `rzp_test_`)
   - **Key Secret** (starts with `rzp_test_`)

### For Live Mode (Production)
1. Complete KYC verification in your Razorpay account
2. Navigate to **Account & Settings** → **API Keys**
3. Under **Live Mode**, click **Generate Live Key**
4. Copy both:
   - **Key ID** (starts with `rzp_live_`)
   - **Key Secret** (starts with `rzp_live_`)

## Step 2: Configure Environment Variables

1. Open `backend/.env` file
2. Replace the placeholder values:

```env
# Razorpay Configuration
# Get these from Razorpay Dashboard → Account & Settings → API Keys
RAZORPAY_KEY_ID=your_actual_key_id_here
RAZORPAY_KEY_SECRET=your_actual_key_secret_here
```

**Example with test credentials:**
```env
RAZORPAY_KEY_ID=rzp_test_1234567890abcd
RAZORPAY_KEY_SECRET=rzp_test_abcdefghijklmnop1234567890
```

## Step 3: Restart the Backend Server

After updating the credentials:
1. Stop the backend server (Ctrl+C)
2. Restart it: `npm run dev`
3. Verify the server starts without errors

## Step 4: Test the Integration

### Using API Testing
1. Get an authentication token by logging in:
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bbn-nutrition.com","password":"Admin123!"}'
```

2. Test order creation:
```bash
curl -X POST http://localhost:5001/api/payments/razorpay/create-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"amount":100,"currency":"INR"}'
```

### Using the Frontend
1. Start the frontend: `npm run dev` (in the main project directory)
2. Navigate to the checkout page
3. Add items to cart and proceed to checkout
4. The Razorpay payment form should load properly

## Troubleshooting

### Common Error Messages

#### "Razorpay authentication failed. Please check API credentials."
- **Cause**: Invalid or missing API credentials
- **Solution**: Verify your `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in `.env`

#### "Razorpay payment gateway is not configured"
- **Cause**: Credentials are set to placeholder values
- **Solution**: Replace placeholder values with actual Razorpay credentials

#### "Invalid request parameters"
- **Cause**: Incorrect amount format or missing required fields
- **Solution**: Ensure amount is in paise (multiply by 100) and currency is valid

### Verification Steps

1. **Check credentials format**:
   - Key ID should start with `rzp_test_` or `rzp_live_`
   - Key Secret should start with `rzp_test_` or `rzp_live_`

2. **Verify environment loading**:
   - Check server logs for any environment variable errors
   - Ensure `.env` file is in the `backend` directory

3. **Test with minimal amount**:
   - Use small amounts like ₹1 (100 paise) for testing
   - Verify currency is set to "INR"

## Security Notes

- **Never commit real credentials** to version control
- Use **test credentials** for development
- Use **live credentials** only in production
- Store credentials securely in environment variables
- Regularly rotate your API keys

## Support

- **Razorpay Documentation**: https://razorpay.com/docs/
- **API Reference**: https://razorpay.com/docs/api/
- **Test Cards**: https://razorpay.com/docs/payments/payments/test-card-upi-details/

## Current Status

✅ **Authentication flow**: Working  
✅ **Error handling**: Implemented  
⚠️ **Razorpay credentials**: Need to be configured  
⚠️ **Payment testing**: Pending credential setup  

Once you configure valid Razorpay credentials, the entire checkout flow should work seamlessly.