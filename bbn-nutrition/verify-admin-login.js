// Script to verify admin login and database connectivity
import fetch from 'node-fetch';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Configure dotenv
dotenv.config({ path: './backend/config.env' });

async function verifyAdminLogin() {
  try {
    console.log('🔍 Testing admin login...');
    
    const response = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@bbn-nutrition.com',
        password: 'Admin123!'
      }),
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Admin login successful!');
      
      // Test admin access
      console.log('🔍 Testing admin dashboard access...');
      const dashboardResponse = await fetch('http://localhost:5001/api/admin/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.token}`
        },
      });
      
      const dashboardData = await dashboardResponse.json();
      console.log('Dashboard response status:', dashboardResponse.status);
      
      if (dashboardResponse.status === 200) {
        console.log('✅ Admin dashboard access successful!');
      } else {
        console.log('❌ Admin dashboard access failed:', dashboardData.message);
      }
    } else {
      console.log('❌ Admin login failed:', data.message);
    }
  } catch (error) {
    console.error('Error during admin login test:', error);
  }
}

async function verifyDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('✅ Database connection successful!');
    
    // Check if admin user exists
    const adminUser = await mongoose.connection.db.collection('users').findOne({ email: 'admin@bbn-nutrition.com' });
    
    if (adminUser) {
      console.log('✅ Admin user found in database!');
    } else {
      console.log('❌ Admin user not found in database!');
      console.log('Creating admin user...');
      
      // Create admin user if it doesn't exist
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash('Admin123!', salt);
      
      await mongoose.connection.db.collection('users').insertOne({
        name: 'Admin User',
        email: 'admin@bbn-nutrition.com',
        password: hashedPassword,
        role: 'admin',
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('✅ Admin user created successfully!');
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Database connection error:', error);
  }
}

async function runTests() {
  await verifyDatabaseConnection();
  await verifyAdminLogin();
  console.log('🏁 All tests completed!');
}

runTests();

// Export functions for ES modules
export { verifyAdminLogin, verifyDatabaseConnection, runTests };
export default runTests;