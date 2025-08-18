import { NextRequest, NextResponse } from 'next/server';

// Twilio SMS service implementation
const sendSMS = async (to: string, message: string) => {
  // Check if Twilio credentials are configured
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    console.log('Twilio not configured. SMS simulation:', { to, message });
    return { success: true, simulation: true };
  }

  try {
    // Dynamic import to avoid issues if twilio is not installed
    const { default: twilio } = await import('twilio');
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to,
    });

    return { success: true, messageId: result.sid };
  } catch (error) {
    console.error('Twilio SMS error:', error);
    throw error;
  }
};

export async function POST(request: NextRequest) {
  try {
    const { orderData, customerPhone, customerName } = await request.json();

    // Validate required fields
    if (!orderData || !customerPhone || !customerName) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Format phone number (ensure it includes country code)
    let formattedPhone = customerPhone;
    if (!formattedPhone.startsWith('+')) {
      // Assume Indian number if no country code
      formattedPhone = formattedPhone.startsWith('91') ? `+${formattedPhone}` : `+91${formattedPhone}`;
    }

    // Create SMS message
    const orderId = orderData.orderId || Date.now();
    const message = `🎉 Hi ${customerName}! Your BBN Nutrition order of ₹${orderData.total} has been confirmed! 📦 Order ID: ${orderId}. Track your order at: ${process.env.FRONTEND_URL || 'https://boosterboxnutrition.com'}/track-order/${orderId}. Thank you for choosing BBN! 💪`;

    // Send SMS
    const result = await sendSMS(formattedPhone, message);

    return NextResponse.json({ 
      success: true, 
      message: 'SMS sent successfully',
      simulation: result.simulation || false,
      messageId: result.messageId
    });
  } catch (error) {
    console.error('Error sending SMS:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send SMS', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}