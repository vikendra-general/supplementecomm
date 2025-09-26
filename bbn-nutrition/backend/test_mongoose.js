const mongoose = require('mongoose');
const TempRegistration = require('./models/TempRegistration');

async function testTempRegistration() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/bbn_nutrition');
    console.log('✅ Connected to MongoDB');

    console.log('🔍 Creating TempRegistration...');
    const tempReg = new TempRegistration({
      name: 'Mongoose Test User',
      email: 'mongoosetest@example.com',
      password: 'MongooseTest123!',
      isEmailVerified: false
    });

    console.log('💾 Saving TempRegistration...');
    const savedTempReg = await tempReg.save();
    console.log('✅ TempRegistration saved:', savedTempReg);

    console.log('🔍 Searching for saved TempRegistration...');
    const foundTempReg = await TempRegistration.findOne({ email: 'mongoosetest@example.com' });
    console.log('🔍 Found TempRegistration:', foundTempReg);

    console.log('🔍 Listing all TempRegistrations...');
    const allTempRegs = await TempRegistration.find({});
    console.log('📋 All TempRegistrations:', allTempRegs);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testTempRegistration();