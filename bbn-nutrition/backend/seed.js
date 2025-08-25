const mongoose = require('mongoose');
const Product = require('./models/Product');
const Order = require('./models/Order');
const User = require('./models/User');
require('dotenv').config({ path: './config.env' });

const sampleProducts = [
  {
    name: 'BBN Whey Protein Isolate',
    description: 'Premium whey protein isolate with 25g protein per serving. Perfect for muscle building and recovery.',
    price: 4999,
    originalPrice: 6499,
    category: 'Protein',
    brand: 'BBN',
    images: ['/images/products/protien.jpg'],
    rating: 4.8,
    reviewCount: 1247,
    reviews: [],
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
      { id: 'whey-chocolate', name: 'Chocolate', price: 4999, inStock: true, stockQuantity: 50 },
      { id: 'whey-vanilla', name: 'Vanilla', price: 4999, inStock: true, stockQuantity: 50 },
      { id: 'whey-strawberry', name: 'Strawberry', price: 4999, inStock: false, stockQuantity: 0 }
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
    price: 3499,
    originalPrice: 4299,
    category: 'Pre-Workout',
    brand: 'BBN',
    images: ['/images/products/creatine.jpg'],
    rating: 4.6,
    reviewCount: 892,
    reviews: [],
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
      { id: 'pre-fruit-punch', name: 'Fruit Punch', price: 3499, inStock: true, stockQuantity: 25 },
      { id: 'pre-blue-raspberry', name: 'Blue Raspberry', price: 3499, inStock: true, stockQuantity: 25 },
      { id: 'pre-orange', name: 'Orange', price: 3499, inStock: true, stockQuantity: 25 }
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
    price: 1999,
    originalPrice: 2499,
    category: 'Creatine',
    brand: 'BBN',
    images: ['/images/products/creatine.jpg'],
    rating: 4.7,
    reviewCount: 634,
    reviews: [],
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
      { id: 'creatine-unflavored', name: 'Unflavored', price: 1999, inStock: true, stockQuantity: 100 },
      { id: 'creatine-citrus', name: 'Citrus', price: 1999, inStock: true, stockQuantity: 100 }
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
    price: 2799,
    originalPrice: 3299,
    category: 'Amino Acids',
    brand: 'BBN',
    images: ['/images/products/aminoacids.jpg'],
    rating: 4.5,
    reviewCount: 456,
    reviews: [],
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
      { id: 'bcaa-tropical', name: 'Tropical Punch', price: 2799, inStock: true, stockQuantity: 60 },
      { id: 'bcaa-watermelon', name: 'Watermelon', price: 2799, inStock: true, stockQuantity: 60 }
    ],
    tags: ['bcaa', 'amino acids', 'recovery', 'muscle'],
    weight: 0.8,
    dimensions: { length: 5, width: 4, height: 7 },
    shippingWeight: 1.0
  },
  {
    name: 'BBN Multivitamin Complete',
    description: 'Comprehensive multivitamin with essential vitamins and minerals for overall health.',
    price: 2399,
    originalPrice: 2899,
    category: 'Vitamins',
    brand: 'BBN',
    images: ['/images/products/vitamins.jpg'],
    rating: 4.4,
    reviewCount: 789,
    reviews: [],
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
      { id: 'multi-men', name: 'Men\'s Formula', price: 2399, inStock: true, stockQuantity: 90 },
      { id: 'multi-women', name: 'Women\'s Formula', price: 2399, inStock: true, stockQuantity: 90 }
    ],
    tags: ['multivitamin', 'vitamins', 'health', 'wellness'],
    weight: 0.3,
    dimensions: { length: 3, width: 2, height: 5 },
    shippingWeight: 0.5
  },
  {
    name: 'BBN Omega-3 Fish Oil',
    description: 'High-quality fish oil with EPA and DHA for heart and brain health.',
    price: 1999,
    originalPrice: 2499,
    category: 'Omega-3',
    brand: 'BBN',
    images: ['/images/products/fishoil.jpg'],
    rating: 4.6,
    reviewCount: 623,
    reviews: [],
    inStock: true,
    stockQuantity: 100,
    nutritionFacts: {
      servingSize: '2 softgels',
      calories: 20,
      protein: 0,
      carbs: 0,
      fat: 2,
      sugar: 0,
      sodium: 0,
      ingredients: ['Fish Oil', 'EPA', 'DHA', 'Vitamin E']
    },
    variants: [
      { id: 'omega3-1000mg', name: '1000mg', price: 1999, inStock: true, stockQuantity: 50 },
      { id: 'omega3-2000mg', name: '2000mg', price: 2499, inStock: true, stockQuantity: 50 }
    ],
    tags: ['omega-3', 'fish oil', 'heart health', 'brain health'],
    weight: 0.4,
    dimensions: { length: 4, width: 3, height: 6 },
    shippingWeight: 0.6
  },
  {
    name: 'BBN Mass Gainer',
    description: 'High-calorie mass gainer with protein and carbs for weight gain and muscle building.',
    price: 6999,
    originalPrice: 8999,
    category: 'Mass Gainer',
    brand: 'BBN',
    images: ['/images/products/protien.jpg'],
    rating: 4.3,
    reviewCount: 387,
    reviews: [],
    inStock: true,
    stockQuantity: 80,
    nutritionFacts: {
      servingSize: '150g',
      calories: 600,
      protein: 50,
      carbs: 80,
      fat: 8,
      sugar: 15,
      sodium: 300,
      ingredients: ['Whey Protein', 'Maltodextrin', 'Oats', 'Natural Flavors', 'Vitamins', 'Minerals']
    },
    variants: [
      { id: 'mass-chocolate', name: 'Chocolate', price: 6999, inStock: true, stockQuantity: 40 },
      { id: 'mass-vanilla', name: 'Vanilla', price: 6999, inStock: true, stockQuantity: 40 }
    ],
    tags: ['mass gainer', 'weight gain', 'muscle building', 'calories'],
    weight: 5.0,
    dimensions: { length: 10, width: 8, height: 14 },
    shippingWeight: 5.5
  },
  {
    name: 'BBN L-Carnitine',
    description: 'L-Carnitine supplement for fat burning and energy production.',
    price: 3999,
    category: 'Fat Burners',
    brand: 'BBN',
    images: ['/images/products/fatburner.jpg'],
    rating: 4.2,
    reviewCount: 298,
    reviews: [],
    inStock: false,
    stockQuantity: 0,
    nutritionFacts: {
      servingSize: '1 capsule',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      sugar: 0,
      sodium: 0,
      ingredients: ['L-Carnitine L-Tartrate']
    },
    variants: [
      { id: 'carnitine-500mg', name: '500mg', price: 3999, inStock: false, stockQuantity: 0 }
    ],
    tags: ['l-carnitine', 'fat burning', 'energy', 'weight loss'],
    weight: 0.2,
    dimensions: { length: 3, width: 2, height: 4 },
    shippingWeight: 0.3
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

    // Create admin user
    const adminExists = await User.findOne({ email: 'admin@bbn-nutrition.com' });
    if (!adminExists) {
      const adminUser = new User({
        name: 'Admin User',
        email: 'admin@bbn-nutrition.com',
        password: 'Admin123!',
        role: 'admin',
        emailVerified: true
      });
      await adminUser.save();
      console.log('Created admin user: admin@bbn-nutrition.com / Admin123!');
    } else {
      console.log('Admin user already exists');
    }

    // Create products
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`Created ${createdProducts.length} products`);

    // Get existing users or create a test user
    let users = await User.find();
    if (users.length === 1) { // Only admin user exists
      console.log('Creating a test user...');
      const testUser = new User({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'Test123!',
        emailVerified: true
      });
      await testUser.save();
      users = [testUser];
      console.log('Created test user: testuser@example.com / Test123!');
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
    console.log('\n=== LOGIN CREDENTIALS ===');
    console.log('Admin: admin@bbn-nutrition.com / Admin123!');
    console.log('User: testuser@example.com / Test123!');
    console.log('========================\n');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();