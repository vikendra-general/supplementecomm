const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

console.log('📚 Complete MongoDB Operations Guide\n');

async function mongoDBGuide() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    
    const db = mongoose.connection.db;
    console.log('✅ Connected to Database:', db.databaseName);
    console.log('=' + '='.repeat(70) + '\n');
    
    // 1. BASIC CRUD OPERATIONS
    console.log('🔥 1. BASIC CRUD OPERATIONS');
    console.log('-'.repeat(50));
    
    console.log('\n📖 CREATE (Insert) Operations:');
    console.log('   💡 db.collection("users").insertOne({name: "John", email: "john@test.com"})');
    console.log('   💡 db.collection("users").insertMany([{...}, {...}])');
    
    console.log('\n📖 READ (Find) Operations:');
    console.log('   💡 db.collection("users").find()                    // Find all');
    console.log('   💡 db.collection("users").findOne({email: "..."})   // Find one');
    console.log('   💡 db.collection("users").find({role: "admin"})     // Find with filter');
    
    // Demo actual read operations
    const totalUsers = await db.collection('users').countDocuments();
    console.log(`   ✅ Current users in database: ${totalUsers}`);
    
    const adminUser = await db.collection('users').findOne({role: 'admin'});
    if (adminUser) {
      console.log(`   ✅ Found admin: ${adminUser.name} (${adminUser.email})`);
    }
    
    console.log('\n📖 UPDATE Operations:');
    console.log('   💡 db.collection("users").updateOne({_id: ...}, {$set: {name: "New Name"}})');
    console.log('   💡 db.collection("users").updateMany({role: "user"}, {$set: {status: "active"}})');
    
    console.log('\n📖 DELETE Operations:');
    console.log('   💡 db.collection("users").deleteOne({_id: ...})');
    console.log('   💡 db.collection("users").deleteMany({status: "inactive"})');
    
    // 2. QUERY OPERATORS
    console.log('\n\n🔍 2. QUERY OPERATORS');
    console.log('-'.repeat(50));
    
    console.log('\n📖 Comparison Operators:');
    console.log('   💡 {price: {$gt: 1000}}        // Greater than');
    console.log('   💡 {price: {$gte: 1000}}       // Greater than or equal');
    console.log('   💡 {price: {$lt: 2000}}        // Less than');
    console.log('   💡 {price: {$lte: 2000}}       // Less than or equal');
    console.log('   💡 {price: {$ne: 1500}}        // Not equal');
    console.log('   💡 {category: {$in: ["Protein", "Creatine"]}}  // In array');
    
    // Demo comparison operators
    const expensiveProducts = await db.collection('products').find({price: {$gte: 2000}}).toArray();
    console.log(`   ✅ Products ≥ ₹2000: ${expensiveProducts.length} found`);
    
    console.log('\n📖 Logical Operators:');
    console.log('   💡 {$and: [{price: {$gte: 1000}}, {category: "Protein"}]}');
    console.log('   💡 {$or: [{role: "admin"}, {role: "manager"}]}');
    console.log('   💡 {$not: {price: {$lt: 1000}}}');
    
    // 3. AGGREGATION PIPELINE
    console.log('\n\n📊 3. AGGREGATION PIPELINE');
    console.log('-'.repeat(50));
    
    console.log('\n📖 Common Aggregation Stages:');
    console.log('   💡 $match    - Filter documents');
    console.log('   💡 $group    - Group by field and calculate');
    console.log('   💡 $sort     - Sort results');
    console.log('   💡 $limit    - Limit number of results');
    console.log('   💡 $project  - Select specific fields');
    
    // Demo aggregation
    console.log('\n✅ Live Aggregation Examples:');
    
    // Group products by category
    const categoryStats = await db.collection('products').aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, avgPrice: { $avg: '$price' } } },
      { $sort: { count: -1 } }
    ]).toArray();
    
    console.log('   📊 Products by Category:');
    categoryStats.forEach(stat => {
      console.log(`      ${stat._id}: ${stat.count} products, Avg: ₹${Math.round(stat.avgPrice)}`);
    });
    
    // 4. INDEXING
    console.log('\n\n🚀 4. INDEXING');
    console.log('-'.repeat(50));
    
    console.log('\n📖 Index Operations:');
    console.log('   💡 db.collection("users").createIndex({email: 1})        // Ascending');
    console.log('   💡 db.collection("users").createIndex({email: -1})       // Descending');
    console.log('   💡 db.collection("users").createIndex({email: 1, role: 1}) // Compound');
    console.log('   💡 db.collection("users").getIndexes()                   // List indexes');
    
    // Show current indexes
    const userIndexes = await db.collection('users').indexes();
    console.log('\n✅ Current User Collection Indexes:');
    userIndexes.forEach((index, i) => {
      const keys = Object.keys(index.key).map(k => `${k}: ${index.key[k]}`).join(', ');
      console.log(`   ${i + 1}. ${index.name}: {${keys}}`);
    });
    
    // 5. TEXT SEARCH
    console.log('\n\n🔎 5. TEXT SEARCH');
    console.log('-'.repeat(50));
    
    console.log('\n📖 Text Search Operations:');
    console.log('   💡 db.collection("products").createIndex({name: "text", description: "text"})');
    console.log('   💡 db.collection("products").find({$text: {$search: "protein whey"}})');
    
    // 6. GEOSPATIAL QUERIES
    console.log('\n\n🌍 6. GEOSPATIAL QUERIES');
    console.log('-'.repeat(50));
    
    console.log('\n📖 Geospatial Operations:');
    console.log('   💡 db.collection("stores").createIndex({location: "2dsphere"})');
    console.log('   💡 db.collection("stores").find({location: {$near: {$geometry: {...}}}})');
    
    // 7. TRANSACTIONS
    console.log('\n\n💳 7. TRANSACTIONS');
    console.log('-'.repeat(50));
    
    console.log('\n📖 Transaction Example:');
    console.log('   💡 const session = await mongoose.startSession();');
    console.log('   💡 session.startTransaction();');
    console.log('   💡 // Perform multiple operations...');
    console.log('   💡 await session.commitTransaction();');
    
    // 8. PERFORMANCE TIPS
    console.log('\n\n⚡ 8. PERFORMANCE TIPS');
    console.log('-'.repeat(50));
    
    console.log('\n📖 Best Practices:');
    console.log('   ✅ Use indexes for frequently queried fields');
    console.log('   ✅ Use projection to limit returned fields');
    console.log('   ✅ Use limit() for large result sets');
    console.log('   ✅ Use aggregation pipeline for complex queries');
    console.log('   ✅ Avoid $regex on large collections without indexes');
    console.log('   ✅ Use compound indexes for multi-field queries');
    
    // 9. COMMON PATTERNS
    console.log('\n\n🎯 9. COMMON PATTERNS');
    console.log('-'.repeat(50));
    
    console.log('\n📖 Pagination:');
    console.log('   💡 db.collection("products").find().skip(20).limit(10)');
    
    console.log('\n📖 Sorting:');
    console.log('   💡 db.collection("products").find().sort({price: -1})  // Desc');
    console.log('   💡 db.collection("products").find().sort({name: 1})    // Asc');
    
    console.log('\n📖 Field Selection:');
    console.log('   💡 db.collection("users").find({}, {name: 1, email: 1, _id: 0})');
    
    // Demo pagination and sorting
    console.log('\n✅ Live Examples:');
    const sortedProducts = await db.collection('products').find({}, {
      projection: { name: 1, price: 1, _id: 0 }
    }).sort({ price: -1 }).limit(3).toArray();
    
    console.log('   📊 Top 3 Most Expensive Products:');
    sortedProducts.forEach((product, i) => {
      console.log(`      ${i + 1}. ${product.name} - ₹${product.price}`);
    });
    
    console.log('\n' + '='.repeat(70));
    console.log('🎉 MongoDB Operations Guide Complete!');
    console.log('📚 Use these patterns in your applications for efficient database operations');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

mongoDBGuide();