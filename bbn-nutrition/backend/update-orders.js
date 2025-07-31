const mongoose = require('mongoose');
const Order = require('./models/Order');
const User = require('./models/User');
require('dotenv').config({ path: './config.env' });

const updateOrders = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get the test user
    const user = await User.findOne({ email: 'testuser@example.com' });
    if (!user) {
      console.log('Test user not found');
      return;
    }

    console.log('Found user:', user._id);

    // Update all orders to belong to this user
    const result = await Order.updateMany({}, { user: user._id });
    console.log(`Updated ${result.modifiedCount} orders`);

    // Verify the orders
    const orders = await Order.find({ user: user._id });
    console.log(`Found ${orders.length} orders for user`);

    console.log('Orders updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating orders:', error);
    process.exit(1);
  }
};

updateOrders(); 