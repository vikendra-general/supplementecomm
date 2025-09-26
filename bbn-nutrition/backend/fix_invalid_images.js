const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/bbn-nutrition', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const productSchema = new mongoose.Schema({
  name: String,
  images: [String],
  price: Number,
  description: String,
  category: String,
  brand: String,
  stock: Number,
  rating: Number,
  reviews: Number,
  features: [String],
  nutritionalInfo: Object,
  servingSize: String,
  flavors: [String],
  tags: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

const publicImagesPath = path.join(__dirname, '../public/images/products');

async function fixInvalidImages() {
  try {
    console.log('Connecting to MongoDB...');
    
    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products`);
    
    let fixedCount = 0;
    
    for (const product of products) {
      let needsUpdate = false;
      const updatedImages = [];
      
      for (const imagePath of product.images) {
        // Remove leading slash and check if file exists
        const relativePath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
        const fullPath = path.join(__dirname, '../public', relativePath);
        
        if (fs.existsSync(fullPath)) {
          updatedImages.push(imagePath);
        } else {
          console.log(`Invalid image path for ${product.name}: ${imagePath}`);
          // Use a placeholder image
          updatedImages.push('/images/products/alternative.png');
          needsUpdate = true;
        }
      }
      
      if (needsUpdate) {
        await Product.findByIdAndUpdate(product._id, {
          images: updatedImages,
          updatedAt: new Date()
        });
        fixedCount++;
        console.log(`Fixed images for: ${product.name}`);
      }
    }
    
    console.log(`\nFixed ${fixedCount} products with invalid images`);
    console.log('All products now have valid image paths!');
    
  } catch (error) {
    console.error('Error fixing images:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixInvalidImages();