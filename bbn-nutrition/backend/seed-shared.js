const mongoose = require('mongoose');
const Product = require('./models/Product');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './config.env' });

const seedData = {
  products: [
    {
      name: "BBN Whey Protein Isolate",
      description: "High-quality whey protein isolate for muscle building and recovery. Perfect for post-workout nutrition.",
      price: 2999,
      originalPrice: 3499,
      category: "Protein",
      brand: "BBN",
      stockQuantity: 100,
      inStock: true,
      images: ["/uploads/whey-protein.jpg"],
      tags: ["protein", "muscle building", "recovery", "whey isolate"],
      featured: true,
      bestSeller: true,
      todaysDeals: false
    },
    {
      name: "BBN Pre-Workout Elite",
      description: "Advanced pre-workout formula for enhanced performance, energy, and focus during intense training sessions.",
      price: 1999,
      originalPrice: 2499,
      category: "Pre-Workout",
      brand: "BBN",
      stockQuantity: 75,
      inStock: true,
      images: ["/uploads/pre-workout.jpg"],
      tags: ["pre-workout", "energy", "performance", "focus"],
      featured: false,
      bestSeller: false,
      todaysDeals: true
    },
    {
      name: "BBN Creatine Monohydrate",
      description: "Pure creatine monohydrate for increased strength, power, and muscle mass. Clinically proven formula.",
      price: 1499,
      category: "Creatine",
      brand: "BBN",
      stockQuantity: 150,
      inStock: true,
      images: ["/uploads/creatine.jpg"],
      tags: ["creatine", "strength", "power", "muscle mass"],
      featured: true,
      bestSeller: true,
      todaysDeals: false
    },
    {
      name: "BBN BCAA Amino Acids",
      description: "Essential branched-chain amino acids for muscle recovery, reduced fatigue, and improved endurance.",
      price: 1799,
      originalPrice: 2199,
      category: "Amino Acids",
      brand: "BBN",
      stockQuantity: 80,
      inStock: true,
      images: ["/uploads/bcaa.jpg"],
      tags: ["bcaa", "amino acids", "recovery", "endurance"],
      featured: false,
      bestSeller: true,
      todaysDeals: false
    },
    {
      name: "BBN Multivitamin Complete",
      description: "Comprehensive multivitamin and mineral complex to support overall health and athletic performance.",
      price: 1299,
      category: "Vitamins",
      brand: "BBN",
      stockQuantity: 200,
      inStock: true,
      images: ["/uploads/multivitamin.jpg"],
      tags: ["vitamins", "minerals", "health", "performance"],
      featured: false,
      bestSeller: false,
      todaysDeals: true
    },
    {
      name: "BBN Omega-3 Fish Oil",
      description: "High-potency omega-3 fatty acids for heart health, brain function, and anti-inflammatory support.",
      price: 1599,
      category: "Omega-3",
      brand: "BBN",
      stockQuantity: 120,
      inStock: true,
      images: ["/uploads/omega3.jpg"],
      tags: ["omega-3", "fish oil", "heart health", "brain function"],
      featured: true,
      bestSeller: false,
      todaysDeals: false
    },
    {
      name: "BBN Mass Gainer",
      description: "High-calorie mass gainer with quality proteins and carbohydrates for lean muscle mass development.",
      price: 3499,
      originalPrice: 3999,
      category: "Mass Gainer",
      brand: "BBN",
      stockQuantity: 60,
      inStock: true,
      images: ["/uploads/mass-gainer.jpg"],
      tags: ["mass gainer", "weight gain", "muscle mass", "calories"],
      featured: false,
      bestSeller: true,
      todaysDeals: false
    },
    {
      name: "BBN Fat Burner Elite",
      description: "Advanced thermogenic fat burner to support weight loss, metabolism, and energy levels.",
      price: 2199,
      category: "Fat Burners",
      brand: "BBN",
      stockQuantity: 0,
      inStock: false,
      images: ["/uploads/fat-burner.jpg"],
      tags: ["fat burner", "weight loss", "metabolism", "thermogenic"],
      featured: false,
      bestSeller: false,
      todaysDeals: false
    }
  ],
  users: [
    {
      name: "Admin User",
      email: "admin@bbn-nutrition.com",
      password: "Admin123!",
      role: "admin",
      emailVerified: true,
      isActive: true
    },
    {
      name: "Test Customer",
      email: "customer@test.com",
      password: "Test123!",
      role: "user",
      emailVerified: true,
      isActive: true
    },
    {
      name: "John Doe",
      email: "john.doe@example.com",
      password: "User123!",
      role: "user",
      emailVerified: true,
      isActive: true
    }
  ]
};

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');
    console.log('📡 Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await Product.deleteMany({});
    await User.deleteMany({});
    console.log('✅ Existing data cleared');
    
    // Hash passwords for users
    console.log('🔐 Hashing user passwords...');
    for (let user of seedData.users) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
    
    // Insert seed data
    console.log('📦 Inserting products...');
    const insertedProducts = await Product.insertMany(seedData.products);
    console.log(`✅ Inserted ${insertedProducts.length} products`);
    
    console.log('👥 Inserting users...');
    const insertedUsers = await User.insertMany(seedData.users);
    console.log(`✅ Inserted ${insertedUsers.length} users`);
    
    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Login credentials for testing:');
    console.log('👨‍💼 Admin: admin@bbn-nutrition.com / Admin123!');
    console.log('👤 Customer: customer@test.com / Test123!');
    console.log('👤 User: john.doe@example.com / User123!');
    
    console.log('\n📊 Seeded data summary:');
    console.log(`• ${insertedProducts.length} products (${insertedProducts.filter(p => p.inStock).length} in stock, ${insertedProducts.filter(p => !p.inStock).length} out of stock)`);
    console.log(`• ${insertedUsers.filter(u => u.role === 'admin').length} admin user(s)`);
    console.log(`• ${insertedUsers.filter(u => u.role === 'user').length} regular user(s)`);
    console.log(`• ${insertedProducts.filter(p => p.featured).length} featured products`);
    console.log(`• ${insertedProducts.filter(p => p.bestSeller).length} best seller products`);
    console.log(`• ${insertedProducts.filter(p => p.todaysDeals).length} today's deals`);
    
    console.log('\n🚀 Both developers can now use the same data!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();