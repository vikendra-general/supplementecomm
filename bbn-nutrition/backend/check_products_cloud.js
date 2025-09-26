const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

const productSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.model('Product', productSchema);

async function checkProducts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');
    
    const products = await Product.find({}).select('name category brand price tags createdAt');
    
    console.log(`\n📦 Total Products in Cloud Database: ${products.length}\n`);
    
    if (products.length > 0) {
      console.log('🛍️ Products List:');
      console.log('================');
      
      products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`);
        console.log(`   Category: ${product.category || 'N/A'}`);
        console.log(`   Brand: ${product.brand || 'N/A'}`);
        console.log(`   Price: ₹${product.price || 'N/A'}`);
        console.log(`   Tags: ${product.tags ? product.tags.join(', ') : 'N/A'}`);
        console.log(`   Added: ${product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}`);
        console.log('   ---');
      });
      
      // Group by category
      const categories = {};
      products.forEach(product => {
        const cat = product.category || 'Uncategorized';
        categories[cat] = (categories[cat] || 0) + 1;
      });
      
      console.log('\n📊 Products by Category:');
      console.log('========================');
      Object.entries(categories).forEach(([category, count]) => {
        console.log(`${category}: ${count} products`);
      });
    } else {
      console.log('❌ No products found in the database');
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkProducts();