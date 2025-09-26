const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

console.log('🔍 MongoDB db.collection() Commands Demonstration\n');

async function demonstrateCollections() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    
    const db = mongoose.connection.db;
    console.log('✅ Connected to Database:', db.databaseName);
    console.log('=' + '='.repeat(50) + '\n');
    
    // 1. List all collections using db.listCollections()
    console.log('📋 1. db.listCollections().toArray():');
    const collections = await db.listCollections().toArray();
    collections.forEach((col, index) => {
      console.log(`   ${index + 1}. ${col.name}`);
    });
    
    console.log('\n' + '-'.repeat(60) + '\n');
    
    // 2. Count documents using db.collection().countDocuments()
    console.log('📊 2. db.collection().countDocuments():');
    const userCount = await db.collection('users').countDocuments();
    console.log(`   👥 db.collection("users").countDocuments(): ${userCount}`);
    
    const productCount = await db.collection('products').countDocuments();
    console.log(`   📦 db.collection("products").countDocuments(): ${productCount}`);
    
    const orderCount = await db.collection('orders').countDocuments();
    console.log(`   🛒 db.collection("orders").countDocuments(): ${orderCount}`);
    
    const categoryCount = await db.collection('categories').countDocuments();
    console.log(`   🏷️ db.collection("categories").countDocuments(): ${categoryCount}`);
    
    console.log('\n' + '-'.repeat(60) + '\n');
    
    // 3. Find documents using db.collection().find()
    console.log('📄 3. db.collection().find():');
    
    // Users
    console.log('\n   👥 db.collection("users").find().limit(2):');
    const users = await db.collection('users').find({}, {
      projection: { name: 1, email: 1, role: 1, _id: 0 }
    }).limit(2).toArray();
    
    users.forEach((user, index) => {
      console.log(`      ${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
    });
    
    // Products
    console.log('\n   📦 db.collection("products").find().limit(3):');
    const products = await db.collection('products').find({}, {
      projection: { name: 1, price: 1, category: 1, _id: 0 }
    }).limit(3).toArray();
    
    products.forEach((product, index) => {
      console.log(`      ${index + 1}. ${product.name} - ₹${product.price} (${product.category})`);
    });
    
    // Categories
    console.log('\n   🏷️ db.collection("categories").find():');
    const categories = await db.collection('categories').find({}, {
      projection: { name: 1, slug: 1, _id: 0 }
    }).toArray();
    
    categories.forEach((category, index) => {
      console.log(`      ${index + 1}. ${category.name} (slug: ${category.slug})`);
    });
    
    console.log('\n' + '-'.repeat(60) + '\n');
    
    // 4. Find specific documents using db.collection().findOne()
    console.log('🔍 4. db.collection().findOne():');
    
    // Find admin user
    const adminUser = await db.collection('users').findOne(
      { role: 'admin' },
      { projection: { name: 1, email: 1, _id: 0 } }
    );
    
    if (adminUser) {
      console.log(`\n   👑 db.collection("users").findOne({role: "admin"}):`);
      console.log(`      Admin: ${adminUser.name} (${adminUser.email})`);
    }
    
    // Find expensive product
    const expensiveProduct = await db.collection('products').findOne(
      { price: { $gte: 2000 } },
      { projection: { name: 1, price: 1, _id: 0 } }
    );
    
    if (expensiveProduct) {
      console.log(`\n   💰 db.collection("products").findOne({price: {$gte: 2000}}):`);
      console.log(`      Product: ${expensiveProduct.name} - ₹${expensiveProduct.price}`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ db.collection() commands demonstration complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

demonstrateCollections();