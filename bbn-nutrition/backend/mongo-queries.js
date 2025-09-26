const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

console.log('🔍 MongoDB Query Examples for Viva Demonstration\n');

async function runMongoQueries() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    
    const db = mongoose.connection.db;
    console.log('✅ Connected to Database:', db.databaseName);
    console.log('=' + '='.repeat(60) + '\n');
    
    // 1. Basic Find Operations
    console.log('📋 1. BASIC FIND OPERATIONS');
    console.log('-'.repeat(40));
    
    // Find all admin users
    console.log('\n🔍 db.collection("users").find({role: "admin"}):');
    const adminUsers = await db.collection('users').find(
      { role: 'admin' },
      { projection: { name: 1, email: 1, role: 1, _id: 0 } }
    ).toArray();
    adminUsers.forEach(user => {
      console.log(`   👑 ${user.name} (${user.email})`);
    });
    
    // Find products by category
    console.log('\n🔍 db.collection("products").find({category: "Protein"}):');
    const proteinProducts = await db.collection('products').find(
      { category: 'Protein' },
      { projection: { name: 1, price: 1, _id: 0 } }
    ).toArray();
    proteinProducts.forEach(product => {
      console.log(`   💪 ${product.name} - ₹${product.price}`);
    });
    
    // 2. Advanced Query Operations
    console.log('\n\n📊 2. ADVANCED QUERY OPERATIONS');
    console.log('-'.repeat(40));
    
    // Find products with price greater than 2000
    console.log('\n🔍 db.collection("products").find({price: {$gte: 2000}}):');
    const expensiveProducts = await db.collection('products').find(
      { price: { $gte: 2000 } },
      { projection: { name: 1, price: 1, category: 1, _id: 0 } }
    ).toArray();
    expensiveProducts.forEach(product => {
      console.log(`   💰 ${product.name} - ₹${product.price} (${product.category})`);
    });
    
    // Find orders with specific status
    console.log('\n🔍 db.collection("orders").find({status: "pending"}):');
    const pendingOrders = await db.collection('orders').find(
      { status: 'pending' },
      { projection: { _id: 1, totalAmount: 1, status: 1, createdAt: 1 } }
    ).toArray();
    pendingOrders.forEach(order => {
      const date = new Date(order.createdAt).toLocaleDateString();
      console.log(`   📦 Order ${order._id.toString().slice(-6)} - ₹${order.totalAmount} (${date})`);
    });
    
    // 3. Aggregation Operations
    console.log('\n\n📈 3. AGGREGATION OPERATIONS');
    console.log('-'.repeat(40));
    
    // Count products by category
    console.log('\n🔍 db.collection("products").aggregate([{$group: {_id: "$category", count: {$sum: 1}}}]):');
    const categoryStats = await db.collection('products').aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();
    categoryStats.forEach(stat => {
      console.log(`   📊 ${stat._id}: ${stat.count} products`);
    });
    
    // Average product price
    console.log('\n🔍 db.collection("products").aggregate([{$group: {_id: null, avgPrice: {$avg: "$price"}}}]):');
    const avgPrice = await db.collection('products').aggregate([
      { $group: { _id: null, avgPrice: { $avg: '$price' } } }
    ]).toArray();
    if (avgPrice.length > 0) {
      console.log(`   💵 Average Product Price: ₹${Math.round(avgPrice[0].avgPrice)}`);
    }
    
    // 4. Update Operations (Demo - not actually updating)
    console.log('\n\n✏️ 4. UPDATE OPERATIONS (Demo)');
    console.log('-'.repeat(40));
    
    console.log('\n🔍 Example Update Commands:');
    console.log('   📝 db.collection("products").updateOne({name: "Product Name"}, {$set: {price: 2500}})');
    console.log('   📝 db.collection("users").updateMany({role: "user"}, {$set: {status: "active"}})');
    
    // 5. Delete Operations (Demo - not actually deleting)
    console.log('\n\n🗑️ 5. DELETE OPERATIONS (Demo)');
    console.log('-'.repeat(40));
    
    console.log('\n🔍 Example Delete Commands:');
    console.log('   🗑️ db.collection("products").deleteOne({_id: ObjectId("...")})');
    console.log('   🗑️ db.collection("orders").deleteMany({status: "cancelled"})');
    
    // 6. Index Operations
    console.log('\n\n🔍 6. INDEX INFORMATION');
    console.log('-'.repeat(40));
    
    const userIndexes = await db.collection('users').indexes();
    console.log('\n📋 Users Collection Indexes:');
    userIndexes.forEach((index, i) => {
      const keys = Object.keys(index.key).join(', ');
      console.log(`   ${i + 1}. ${index.name}: {${keys}}`);
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ MongoDB Query Demonstration Complete!');
    console.log('📚 All queries executed successfully using Node.js + Mongoose');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

runMongoQueries();