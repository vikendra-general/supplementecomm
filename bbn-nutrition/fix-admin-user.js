// Script to fix admin user issues
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Configure dotenv
dotenv.config({ path: './backend/config.env' });

async function fixAdminUser() {
  try {
    console.log('🔧 Admin User Troubleshooter 🔧');
    console.log('===============================');
    
    // Connect to database
    console.log('🔍 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    console.log('✅ Connected to database');
    
    // Check if admin user exists
    console.log('🔍 Checking for admin user...');
    const adminUser = await mongoose.connection.db.collection('users').findOne({ email: 'admin@bbn-nutrition.com' });
    
    if (adminUser) {
      console.log('✅ Admin user found!');
      console.log('🔍 Verifying admin user role and credentials...');
      
      let needsUpdate = false;
      let updateData = {};
      
      // Check if user has admin role
      if (adminUser.role !== 'admin') {
        console.log('⚠️ Admin user does not have admin role. Fixing...');
        updateData.role = 'admin';
        needsUpdate = true;
      }
      
      // Reset admin password
      console.log('🔄 Resetting admin password to default (Admin123!)...');
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash('Admin123!', salt);
      updateData.password = hashedPassword;
      needsUpdate = true;
      
      if (needsUpdate) {
        await mongoose.connection.db.collection('users').updateOne(
          { _id: adminUser._id },
          { $set: { ...updateData, updatedAt: new Date() } }
        );
        console.log('✅ Admin user updated successfully!');
      } else {
        console.log('✅ Admin user is properly configured!');
      }
    } else {
      console.log('⚠️ Admin user not found. Creating new admin user...');
      
      // Create admin user
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash('Admin123!', salt);
      
      await mongoose.connection.db.collection('users').insertOne({
        name: 'Admin User',
        email: 'admin@bbn-nutrition.com',
        password: hashedPassword,
        role: 'admin',
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date()
      });
      
      console.log('✅ Admin user created successfully!');
    }
    
    console.log('\n📝 Admin Login Information:');
    console.log('   Email: admin@bbn-nutrition.com');
    console.log('   Password: Admin123!');
    console.log('\n💡 You can now log in to the admin panel with these credentials.');
    
    // Close database connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    
  } catch (error) {
    console.error('❌ Error:', error);
    if (mongoose.connection) {
      await mongoose.connection.close();
    }
  }
}

fixAdminUser();

// Export for ES modules
export { fixAdminUser };
export default fixAdminUser;