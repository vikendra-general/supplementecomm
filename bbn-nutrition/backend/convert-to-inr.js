const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config({ path: './config.env' });

// Conversion rate: 1 USD = 83 INR (approximate)
const USD_TO_INR_RATE = 83;

// Indian product pricing (more realistic for Indian market)
const indianProductPrices = {
  'BBN Whey Protein Isolate': { price: 4999, originalPrice: 6499 },
  'BBN Pre-Workout Elite': { price: 3499, originalPrice: 4299 },
  'BBN Creatine Monohydrate': { price: 1999, originalPrice: 2499 },
  'BBN BCAA Amino Acids': { price: 2799, originalPrice: 3299 },
  'BBN Multivitamin Complete': { price: 2399, originalPrice: 2899 },
  'BBN Mass Gainer': { price: 5999, originalPrice: 7499 },
  'BBN Fat Burner': { price: 3299, originalPrice: 3999 },
  'BBN Omega-3': { price: 1899, originalPrice: 2299 },
  'BBN Glutamine': { price: 2199, originalPrice: 2699 },
  'BBN Casein Protein': { price: 5499, originalPrice: 6999 }
};

const convertToINR = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB');
    
    // Get all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products to convert`);
    
    for (const product of products) {
      let newPrice, newOriginalPrice;
      
      // Check if we have predefined Indian pricing for this product
      if (indianProductPrices[product.name]) {
        newPrice = indianProductPrices[product.name].price;
        newOriginalPrice = indianProductPrices[product.name].originalPrice;
      } else {
        // Fallback to conversion if no predefined price
        newPrice = Math.round(product.price * USD_TO_INR_RATE);
        newOriginalPrice = product.originalPrice ? Math.round(product.originalPrice * USD_TO_INR_RATE) : null;
      }
      
      // Update product prices
      const updateData = { price: newPrice };
      if (newOriginalPrice) {
        updateData.originalPrice = newOriginalPrice;
      }
      
      // Update variant prices
      if (product.variants && product.variants.length > 0) {
        updateData.variants = product.variants.map(variant => ({
          ...variant.toObject(),
          price: indianProductPrices[product.name] ? 
            indianProductPrices[product.name].price : 
            Math.round(variant.price * USD_TO_INR_RATE)
        }));
      }
      
      await Product.findByIdAndUpdate(product._id, updateData);
      
      console.log(`✅ Updated ${product.name}: $${product.price} → ₹${newPrice}`);
    }
    
    console.log('\n🎉 All products successfully converted to INR!');
    console.log('💰 Prices are now in Indian Rupees with market-appropriate pricing');
    
  } catch (error) {
    console.error('❌ Error converting prices:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📤 Disconnected from MongoDB');
  }
};

// Run the conversion
convertToINR();