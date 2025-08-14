// Script to fix database connectivity issues
import mongoose from 'mongoose';
import { exec } from 'child_process';
import dotenv from 'dotenv';

// Configure dotenv
dotenv.config({ path: './backend/config.env' });

// Function to check if MongoDB is running
function checkMongoDBStatus() {
  return new Promise((resolve, reject) => {
    exec('pgrep mongod', (error, stdout, stderr) => {
      if (error) {
        console.log('❌ MongoDB is not running');
        resolve(false);
        return;
      }
      
      if (stdout) {
        console.log('✅ MongoDB is running');
        resolve(true);
        return;
      }
      
      console.log('❌ MongoDB is not running');
      resolve(false);
    });
  });
}

// Function to start MongoDB
function startMongoDB() {
  return new Promise((resolve, reject) => {
    console.log('🔄 Attempting to start MongoDB...');
    
    exec('mongod --dbpath ~/data/db --fork --logpath ~/data/db/mongodb.log', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Failed to start MongoDB:', error);
        console.log('💡 Try starting MongoDB manually with: brew services start mongodb-community');
        resolve(false);
        return;
      }
      
      console.log('✅ MongoDB started successfully');
      resolve(true);
    });
  });
}

// Function to test database connection
async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing connection to MongoDB...');
    console.log(`🔗 Connection URI: ${process.env.MONGODB_URI}`);
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('✅ Successfully connected to MongoDB');
    
    // Check database collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📊 Available collections:');
    collections.forEach(collection => {
      console.log(`   - ${collection.name}`);
    });
    
    // Check if users collection exists and has data
    const usersCount = await mongoose.connection.db.collection('users').countDocuments();
    console.log(`👤 Users in database: ${usersCount}`);
    
    if (usersCount === 0) {
      console.log('⚠️ No users found in database. You may need to run the seed script.');
    }
    
    await mongoose.connection.close();
    return true;
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    return false;
  }
}

// Main function
async function fixDatabaseIssues() {
  console.log('🔧 Database Connectivity Troubleshooter 🔧');
  console.log('==========================================');
  
  // Step 1: Check if MongoDB is running
  const isMongoRunning = await checkMongoDBStatus();
  
  // Step 2: If MongoDB is not running, try to start it
  if (!isMongoRunning) {
    const started = await startMongoDB();
    if (!started) {
      console.log('⚠️ Could not automatically start MongoDB');
      console.log('💡 Please ensure MongoDB is installed and try:');
      console.log('   1. brew services start mongodb-community');
      console.log('   2. Or start MongoDB manually using your system\'s method');
      return;
    }
  }
  
  // Step 3: Test database connection
  const connectionSuccessful = await testDatabaseConnection();
  
  if (connectionSuccessful) {
    console.log('\n✅ Database connection is working properly!');
    console.log('💡 If you\'re still having issues with the application:');
    console.log('   1. Check that your backend server is running (node backend/server.js)');
    console.log('   2. Verify that the PORT in config.env matches your application settings');
    console.log('   3. Run the verify-admin-login.js script to test admin authentication');
  } else {
    console.log('\n⚠️ Database connection issues detected!');
    console.log('💡 Troubleshooting steps:');
    console.log('   1. Verify MongoDB is installed and running');
    console.log('   2. Check the MONGODB_URI in backend/config.env');
    console.log('   3. Ensure the database name in the URI exists');
    console.log('   4. Check MongoDB logs for errors');
  }
}

fixDatabaseIssues();

// Export for ES modules
export default fixDatabaseIssues;