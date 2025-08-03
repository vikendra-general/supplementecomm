import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { orderData, customerPhone, customerName } = await request.json();

    // For demo purposes, we'll simulate SMS sending
    // In production, you would use Twilio or another SMS service
    console.log('SMS Notification:', {
      to: customerPhone,
      message: `Hi ${customerName}, your order of ₹${orderData.total} has been confirmed. Order ID: ${Date.now()}. Track at boosterboxnutrition.com/track-order/${Date.now()}`,
    });

    // Example Twilio implementation (uncomment and configure):
    /*
    const twilio = require('twilio');
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    await client.messages.create({
      body: `Hi ${customerName}, your order of ₹${orderData.total} has been confirmed. Order ID: ${Date.now()}. Track at boosterboxnutrition.com/track-order/${Date.now()}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: customerPhone,
    });
    */

    return NextResponse.json({ success: true, message: 'SMS sent successfully' });
  } catch (error) {
    console.error('Error sending SMS:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send SMS' },
      { status: 500 }
    );
  }
} 