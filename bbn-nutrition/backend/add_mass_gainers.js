const axios = require('axios');

const massGainerProducts = [
  {
    name: 'Kevin Levrone Anabolic Mass Gainer',
    description: 'Premium mass gainer with 40g protein and fast-acting carbs for muscle growth. Enhanced with creatine and digestive enzymes for maximum results.',
    price: 3299,
    category: 'Mass Gainer',
    brand: 'Kevin Levrone',
    images: ['https://res.cloudinary.com/duscymcfc/image/upload/v1/products/product-283-featured_image-Kevin_Levrone_Anabolic_Mass_Gainer.jpg.jpeg'],
    tags: ['best sellers', 'mass gainer', 'muscle building', 'high calorie'],
    nutritionFacts: {
      servingSize: '100g',
      servingsPerContainer: 30,
      calories: 376,
      protein: '40g',
      carbohydrates: '50g',
      fat: '6g',
      fiber: '2g',
      sugar: '8g',
      sodium: '120mg',
      additionalInfo: 'Enhanced with creatine monohydrate, digestive enzymes, and vitamins'
    },
    inStock: true,
    stockQuantity: 25
  },
  {
    name: 'MuscleBlaze Mass Gainer XXL',
    description: 'High-calorie mass gainer with complex carbs and quality protein. Perfect for hard gainers looking to build serious muscle mass.',
    price: 2899,
    category: 'Mass Gainer',
    brand: 'MuscleBlaze',
    images: ['https://res.cloudinary.com/duscymcfc/image/upload/v1/products/product-2661-featured_image-MuscleBlaze_Mass_Gainer_XXL.jpg.jpeg'],
    tags: ['best sellers', 'mass gainer', 'high calorie', 'muscle building'],
    nutritionFacts: {
      servingSize: '75g',
      servingsPerContainer: 33,
      calories: 300,
      protein: '15g',
      carbohydrates: '55g',
      fat: '3g',
      fiber: '1g',
      sugar: '12g',
      sodium: '85mg',
      additionalInfo: 'Complex carbs blend, added vitamins and minerals, digestive enzymes'
    },
    inStock: true,
    stockQuantity: 40
  },
  {
    name: 'Labrada Muscle Mass Gainer',
    description: 'Premium mass gainer with high-quality protein and complex carbohydrates. Designed for serious athletes and bodybuilders.',
    price: 3599,
    category: 'Mass Gainer',
    brand: 'Labrada',
    images: ['https://res.cloudinary.com/duscymcfc/image/upload/v1/products/product-2643-featured_image-Labrada_Muscle_Mass_Gainer.jpg.jpeg'],
    tags: ['mass gainer', 'premium', 'muscle building', 'high protein'],
    nutritionFacts: {
      servingSize: '85g',
      servingsPerContainer: 29,
      calories: 340,
      protein: '20g',
      carbohydrates: '60g',
      fat: '4g',
      fiber: '2g',
      sugar: '10g',
      sodium: '95mg',
      additionalInfo: 'Lean lipids, complex carbs, added creatine and glutamine'
    },
    inStock: true,
    stockQuantity: 30
  },
  {
    name: 'Labrada Super Mass Gainer',
    description: 'Ultra-high calorie mass gainer for extreme muscle building. Perfect for hard gainers who need maximum caloric density.',
    price: 4199,
    category: 'Mass Gainer',
    brand: 'Labrada',
    images: ['https://res.cloudinary.com/duscymcfc/image/upload/v1/products/product-4293-featured_image-Labrada_Super_Mass_Gainer.jpg.jpeg'],
    tags: ['mass gainer', 'high calorie', 'extreme', 'hard gainers'],
    nutritionFacts: {
      servingSize: '120g',
      servingsPerContainer: 20,
      calories: 510,
      protein: '30g',
      carbohydrates: '85g',
      fat: '8g',
      fiber: '3g',
      sugar: '15g',
      sodium: '140mg',
      additionalInfo: 'Ultra-high calorie formula, premium protein blend, added BCAAs'
    },
    inStock: true,
    stockQuantity: 20
  }
];

async function addMassGainerProducts() {
  console.log('🚀 Starting to add mass gainer products...');
  
  for (let i = 0; i < massGainerProducts.length; i++) {
    const product = massGainerProducts[i];
    try {
      console.log(`📦 Adding product ${i + 1}/${massGainerProducts.length}: ${product.name}`);
      
      const response = await axios.post('http://localhost:3000/api/products', product, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });
      
      console.log(`✅ Successfully added: ${product.name}`);
      console.log(`   Product ID: ${response.data._id}`);
      
    } catch (error) {
      console.error(`❌ Error adding product: ${product.name}`);
      if (error.response) {
        console.error(`   Status: ${error.response.status}`);
        console.error(`   Error: ${JSON.stringify(error.response.data, null, 2)}`);
      } else if (error.code === 'ECONNREFUSED') {
        console.error('   Connection refused - is the server running on port 3000?');
      } else {
        console.error(`   Error: ${error.message}`);
      }
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('🎉 Finished adding mass gainer products!');
}

// Run the script
addMassGainerProducts().catch(console.error);