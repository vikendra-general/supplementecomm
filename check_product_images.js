const mongoose = require('mongoose');
const path = require('path');

// Add the backend directory to the path so we can require the Product model
process.chdir('./bbn-nutrition/backend');
const Product = require('./models/Product');

async function checkProductImages() {
  try {
    await mongoose.connect('mongodb://localhost:27017/bbn-nutrition');
    console.log('Connected to MongoDB');
    
    const products = await Product.find({});
    console.log(`Found ${products.length} products`);
    
    products.forEach((product, index) => {
      console.log(`\n${index + 1}. Product: ${product.name}`);
      console.log(`   Images: ${JSON.stringify(product.images)}`);
      
      // Check for invalid URLs
      if (product.images && product.images.length > 0) {
        product.images.forEach((img, imgIndex) => {
          if (!img || img === '' || img === 'undefined' || img === 'null') {
            console.log(`   ⚠️  Invalid image at index ${imgIndex}: "${img}"`);
          } else if (!img.startsWith('/') && !img.startsWith('http')) {
            console.log(`   ⚠️  Potentially invalid image URL at index ${imgIndex}: "${img}"`);
          }
        });
      } else {
        console.log('   ⚠️  No images found');
      }
    });
    
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkProductImages();