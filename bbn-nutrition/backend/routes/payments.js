const express = require('express');
const { body, validationResult } = require('express-validator');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { protect } = require('../middleware/auth');
const Order = require('../models/Order');
const User = require('../models/User'); // Added missing import for User

const router = express.Router();

// @desc    Create payment intent
// @route   POST /api/payments/create-payment-intent
// @access  Private
router.post('/create-payment-intent', protect, [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('currency')
    .optional()
    .isIn(['usd', 'inr', 'eur'])
    .withMessage('Invalid currency'),
  body('orderId')
    .optional()
    .isMongoId()
    .withMessage('Invalid order ID')
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

    const { amount, currency = 'usd', orderId, items } = req.body;

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency,
      metadata: {
        userId: req.user.id,
        orderId: orderId || '',
        integration_check: 'accept_a_payment'
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment intent'
    });
  }
});

// @desc    Confirm payment
// @route   POST /api/payments/confirm
// @access  Private
router.post('/confirm', protect, [
  body('paymentIntentId')
    .notEmpty()
    .withMessage('Payment intent ID is required'),
  body('orderId')
    .isMongoId()
    .withMessage('Valid order ID is required')
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

    const { paymentIntentId, orderId } = req.body;

    // Retrieve payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update order status
      const order = await Order.findByIdAndUpdate(
        orderId,
        {
          paymentStatus: 'paid',
          status: 'confirmed',
          $push: {
            statusHistory: {
              status: 'confirmed',
              timestamp: new Date(),
              note: 'Payment confirmed'
            }
          }
        },
        { new: true }
      );

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      res.json({
        success: true,
        message: 'Payment confirmed successfully',
        order: order
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment not completed'
      });
    }
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirming payment'
    });
  }
});

// @desc    Stripe webhook handler
// @route   POST /api/payments/webhook
// @access  Public
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful!');
      
      // Update order status
      if (paymentIntent.metadata.orderId) {
        try {
          await Order.findByIdAndUpdate(
            paymentIntent.metadata.orderId,
            {
              paymentStatus: 'paid',
              status: 'confirmed',
              $push: {
                statusHistory: {
                  status: 'confirmed',
                  timestamp: new Date(),
                  note: 'Payment confirmed via webhook'
                }
              }
            }
          );
        } catch (error) {
          console.error('Error updating order from webhook:', error);
        }
      }
      break;
      
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('PaymentIntent failed!');
      
      // Update order status
      if (failedPayment.metadata.orderId) {
        try {
          await Order.findByIdAndUpdate(
            failedPayment.metadata.orderId,
            {
              paymentStatus: 'failed',
              status: 'pending',
              $push: {
                statusHistory: {
                  status: 'pending',
                  timestamp: new Date(),
                  note: 'Payment failed'
                }
              }
            }
          );
        } catch (error) {
          console.error('Error updating order from webhook:', error);
        }
      }
      break;
      
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// @desc    Get payment methods
// @route   GET /api/payments/methods
// @access  Private
router.get('/methods', protect, async (req, res) => {
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: req.user.stripeCustomerId,
      type: 'card',
    });

    res.json({
      success: true,
      data: paymentMethods.data
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving payment methods'
    });
  }
});

// @desc    Create customer
// @route   POST /api/payments/create-customer
// @access  Private
router.post('/create-customer', protect, async (req, res) => {
  try {
    const customer = await stripe.customers.create({
      email: req.user.email,
      name: req.user.name,
      metadata: {
        userId: req.user.id
      }
    });

    // Update user with Stripe customer ID
    await User.findByIdAndUpdate(req.user.id, {
      stripeCustomerId: customer.id
    });

    res.json({
      success: true,
      customerId: customer.id
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating customer'
    });
  }
});

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('items.product', 'name images');

    const total = await Order.countDocuments({ user: req.user.id });

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving payment history'
    });
  }
});

module.exports = router; 