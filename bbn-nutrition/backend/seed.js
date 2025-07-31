const mongoose = require('mongoose');
const Product = require('./models/Product');
const Order = require('./models/Order');
const User = require('./models/User');
require('dotenv').config({ path: './config.env' });

const sampleProducts = [
  {
    name: 'BBN Whey Protein Isolate',
    description: 'Premium whey protein isolate with 25g protein per serving. Perfect for muscle building and recovery.',
    price: 59.99,
    originalPrice: 79.99,
    category: 'protein',
    brand: 'BBN',
    images: ['/images/products/whey-protein-1.jpg', '/images/products/whey-protein-2.jpg'],
    rating: 4.8,
    reviews: 1247,
    inStock: true,
    stockQuantity: 150,
    nutritionFacts: {
      servingSize: '30g',
      calories: 120,
      protein: 25,
      carbs: 3,
      fat: 1,
      sugar: 1,
      sodium: 140,
      ingredients: ['Whey Protein Isolate', 'Natural Flavors', 'Sweeteners', 'Emulsifiers']
    },
    variants: [
      { id: 'whey-chocolate', name: 'Chocolate', price: 59.99, inStock: true, stockQuantity: 50 },
      { id: 'whey-vanilla', name: 'Vanilla', price: 59.99, inStock: true, stockQuantity: 50 },
      { id: 'whey-strawberry', name: 'Strawberry', price: 59.99, inStock: false, stockQuantity: 0 }
    ],
    tags: ['whey', 'protein', 'muscle-building', 'recovery'],
    featured: true,
    bestSeller: true,
    weight: 2.2,
    dimensions: { length: 8, width: 6, height: 12 },
    shippingWeight: 2.5
  },
  {
    name: 'BBN Pre-Workout Elite',
    description: 'Advanced pre-workout formula with creatine, beta-alanine, and caffeine for maximum performance.',
    price: 44.99,
    originalPrice: 54.99,
    category: 'pre-workout',
    brand: 'BBN',
    images: ['/images/products/pre-workout-1.jpg', '/images/products/pre-workout-2.jpg'],
    rating: 4.6,
    reviews: 892,
    inStock: true,
    stockQuantity: 75,
    nutritionFacts: {
      servingSize: '15g',
      calories: 45,
      protein: 0,
      carbs: 11,
      fat: 0,
      sugar: 0,
      sodium: 200,
      ingredients: ['Creatine Monohydrate', 'Beta-Alanine', 'Caffeine', 'L-Citrulline', 'BCAAs']
    },
    variants: [
      { id: 'pre-fruit-punch', name: 'Fruit Punch', price: 44.99, inStock: true, stockQuantity: 25 },
      { id: 'pre-blue-raspberry', name: 'Blue Raspberry', price: 44.99, inStock: true, stockQuantity: 25 },
      { id: 'pre-orange', name: 'Orange', price: 44.99, inStock: true, stockQuantity: 25 }
    ],
    tags: ['pre-workout', 'energy', 'performance', 'creatine'],
    featured: true,
    weight: 1.1,
    dimensions: { length: 6, width: 4, height: 8 },
    shippingWeight: 1.3
  },
  {
    name: 'BBN Creatine Monohydrate',
    description: 'Pure creatine monohydrate powder for strength and power gains.',
    price: 24.99,
    originalPrice: 29.99,
    category: 'creatine',
    brand: 'BBN',
    images: ['/images/products/creatine-1.jpg'],
    rating: 4.7,
    reviews: 634,
    inStock: true,
    stockQuantity: 200,
    nutritionFacts: {
      servingSize: '5g',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      sugar: 0,
      sodium: 0,
      ingredients: ['Creatine Monohydrate']
    },
    variants: [
      { id: 'creatine-unflavored', name: 'Unflavored', price: 24.99, inStock: true, stockQuantity: 100 },
      { id: 'creatine-citrus', name: 'Citrus', price: 24.99, inStock: true, stockQuantity: 100 }
    ],
    tags: ['creatine', 'strength', 'power', 'muscle'],
    bestSeller: true,
    weight: 0.5,
    dimensions: { length: 4, width: 3, height: 6 },
    shippingWeight: 0.7
  },
  {
    name: 'BBN BCAA Amino Acids',
    description: 'Essential branched-chain amino acids for muscle recovery and growth.',
    price: 34.99,
    originalPrice: 39.99,
    category: 'amino acids',
    brand: 'BBN',
    images: ['/images/products/bcaa-1.jpg'],
    rating: 4.5,
    reviews: 456,
    inStock: true,
    stockQuantity: 120,
    nutritionFacts: {
      servingSize: '10g',
      calories: 40,
      protein: 10,
      carbs: 0,
      fat: 0,
      sugar: 0,
      sodium: 50,
      ingredients: ['L-Leucine', 'L-Isoleucine', 'L-Valine', 'Natural Flavors']
    },
    variants: [
      { id: 'bcaa-tropical', name: 'Tropical Punch', price: 34.99, inStock: true, stockQuantity: 60 },
      { id: 'bcaa-watermelon', name: 'Watermelon', price: 34.99, inStock: true, stockQuantity: 60 }
    ],
    tags: ['bcaa', 'amino acids', 'recovery', 'muscle'],
    weight: 0.8,
    dimensions: { length: 5, width: 4, height: 7 },
    shippingWeight: 1.0
  },
  {
    name: 'BBN Multivitamin Complete',
    description: 'Comprehensive multivitamin with essential vitamins and minerals for overall health.',
    price: 29.99,
    originalPrice: 34.99,
    category: 'vitamins',
    brand: 'BBN',
    images: ['/images/products/multivitamin-1.jpg'],
    rating: 4.4,
    reviews: 789,
    inStock: true,
    stockQuantity: 180,
    nutritionFacts: {
      servingSize: '1 tablet',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      sugar: 0,
      sodium: 0,
      ingredients: ['Vitamin A', 'Vitamin C', 'Vitamin D', 'Vitamin E', 'B Vitamins', 'Minerals']
    },
    variants: [
      { id: 'multi-men', name: 'Men\'s Formula', price: 29.99, inStock: true, stockQuantity: 90 },
      { id: 'multi-women', name: 'Women\'s Formula', price: 29.99, inStock: true, stockQuantity: 90 }
    ],
    tags: ['multivitamin', 'vitamins', 'health', 'wellness'],
    weight: 0.3,
    dimensions: { length: 3, width: 2, height: 5 },
    shippingWeight: 0.5
  }
];

const createSampleOrders = async (users) => {
  const products = await Product.find();
  
  const sampleOrders = [
    {
      user: users[0]._id,
      items: [
        {
          product: products[0]._id,
          name: products[0].name,
          price: products[0].price,
          quantity: 2,
          variant: { id: 'whey-chocolate', name: 'Chocolate', price: products[0].price }
        },
        {
          product: products[1]._id,
          name: products[1].name,
          price: products[1].price,
          quantity: 1,
          variant: { id: 'pre-fruit-punch', name: 'Fruit Punch', price: products[1].price }
        }
      ],
      subtotal: 164.97,
      tax: 13.20,
      shipping: 0,
      total: 178.17,
      status: 'delivered',
      paymentStatus: 'paid',
      paymentMethod: 'credit_card',
      shippingAddress: {
        type: 'home',
        address: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States'
      },
      billingAddress: {
        type: 'home',
        address: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States'
      },
      trackingNumber: '1Z999AA1234567890',
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      statusHistory: [
        { status: 'pending', timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), note: 'Order created' },
        { status: 'confirmed', timestamp: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000), note: 'Payment confirmed' },
        { status: 'processing', timestamp: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), note: 'Order processing' },
        { status: 'shipped', timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), note: 'Order shipped' },
        { status: 'delivered', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), note: 'Order delivered' }
      ]
    },
    {
      user: users[0]._id,
      items: [
        {
          product: products[2]._id,
          name: products[2].name,
          price: products[2].price,
          quantity: 1,
          variant: { id: 'creatine-unflavored', name: 'Unflavored', price: products[2].price }
        }
      ],
      subtotal: 24.99,
      tax: 2.00,
      shipping: 5.99,
      total: 32.98,
      status: 'shipped',
      paymentStatus: 'paid',
      paymentMethod: 'paypal',
      shippingAddress: {
        type: 'home',
        address: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States'
      },
      billingAddress: {
        type: 'home',
        address: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States'
      },
      trackingNumber: '1Z999AA1234567891',
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      statusHistory: [
        { status: 'pending', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), note: 'Order created' },
        { status: 'confirmed', timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), note: 'Payment confirmed' },
        { status: 'processing', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), note: 'Order processing' },
        { status: 'shipped', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), note: 'Order shipped' }
      ]
    },
    {
      user: users[0]._id,
      items: [
        {
          product: products[3]._id,
          name: products[3].name,
          price: products[3].price,
          quantity: 1,
          variant: { id: 'bcaa-tropical', name: 'Tropical Punch', price: products[3].price }
        }
      ],
      subtotal: 34.99,
      tax: 2.80,
      shipping: 0,
      total: 37.79,
      status: 'processing',
      paymentStatus: 'paid',
      paymentMethod: 'credit_card',
      shippingAddress: {
        type: 'home',
        address: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States'
      },
      billingAddress: {
        type: 'home',
        address: '123 Main Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States'
      },
      statusHistory: [
        { status: 'pending', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), note: 'Order created' },
        { status: 'confirmed', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), note: 'Payment confirmed' },
        { status: 'processing', timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), note: 'Order processing' }
      ]
    }
  ];

  return sampleOrders;
};

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    await Order.deleteMany({});
    console.log('Cleared existing data');

    // Create products
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`Created ${createdProducts.length} products`);

    // Get existing users or create a test user
    let users = await User.find();
    if (users.length === 0) {
      console.log('No users found. Creating a test user...');
      const testUser = new User({
        name: 'Test User',
        email: 'testuser@example.com',
        password: '123456'
      });
      await testUser.save();
      users = [testUser];
      console.log('Created test user');
    }

    // Create sample orders
    const sampleOrders = await createSampleOrders(users);
    const createdOrders = [];
    for (const orderData of sampleOrders) {
      const order = new Order(orderData);
      await order.save();
      createdOrders.push(order);
    }
    console.log(`Created ${createdOrders.length} orders`);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase(); 