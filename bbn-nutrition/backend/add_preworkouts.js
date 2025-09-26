const axios = require('axios');

const preworkoutProducts = [
  {
    name: 'MuscleBlaze WrathX Pre-Workout',
    description: 'High-stimulant pre-workout with 300mg caffeine and performance enhancers. Explosive energy, focus, and pump for intense training sessions.',
    price: 1899,
    category: 'Pre-Workout',
    brand: 'MuscleBlaze',
    images: ['https://res.cloudinary.com/duscymcfc/image/upload/v1/products/product-8-featured_image-MuscleBlaze_Wrathx_PreWorkout.jpg.jpeg'],
    tags: ['best sellers', 'pre-workout', 'energy', 'focus', 'pump'],
    nutritionFacts: {
      servingSize: '10g',
      servingsPerContainer: 25,
      calories: 5,
      protein: '0g',
      carbohydrates: '1g',
      fat: '0g',
      fiber: '0g',
      sugar: '0g',
      sodium: '25mg',
      additionalInfo: '300mg Caffeine, 3g L-Citrulline, 2g Beta-Alanine, 1g Taurine, Tyrosine'
    },
    inStock: true,
    stockQuantity: 60
  },
  {
    name: 'Nutrabay Gold Spark Pre-Workout',
    description: 'Advanced pre-workout formula with clinically dosed ingredients. Enhanced focus, energy, and endurance for peak performance.',
    price: 1699,
    category: 'Pre-Workout',
    brand: 'Nutrabay',
    images: ['https://res.cloudinary.com/duscymcfc/image/upload/v1/products/product-1775-featured_image-Nutrabay_Gold_Spark_PreWorkout.jpg.jpeg'],
    tags: ['best sellers', 'pre-workout', 'clinically dosed', 'performance'],
    nutritionFacts: {
      servingSize: '12g',
      servingsPerContainer: 25,
      calories: 8,
      protein: '0g',
      carbohydrates: '2g',
      fat: '0g',
      fiber: '0g',
      sugar: '1g',
      sodium: '30mg',
      additionalInfo: '250mg Caffeine, 6g L-Citrulline Malate, 3.2g Beta-Alanine, 2g Creatine'
    },
    inStock: true,
    stockQuantity: 45
  },
  {
    name: 'MuscleTech Vapor X5 Next Gen',
    description: 'Next-generation pre-workout with explosive energy and enhanced pump. Advanced formula for serious athletes and bodybuilders.',
    price: 2299,
    category: 'Pre-Workout',
    brand: 'MuscleTech',
    images: ['https://res.cloudinary.com/duscymcfc/image/upload/v1/products/product-3284-featured_image-MuscleTech_Vapor_X5_Next_Gen.jpg.jpeg'],
    tags: ['pre-workout', 'premium', 'explosive energy', 'pump'],
    nutritionFacts: {
      servingSize: '15g',
      servingsPerContainer: 20,
      calories: 10,
      protein: '0g',
      carbohydrates: '2g',
      fat: '0g',
      fiber: '0g',
      sugar: '0g',
      sodium: '40mg',
      additionalInfo: '400mg Caffeine, 8g L-Citrulline, 3.2g Beta-Alanine, Nitrosigine'
    },
    inStock: true,
    stockQuantity: 35
  },
  {
    name: 'ProSupps Hyde Xtreme Hard-Hitting Energy',
    description: 'Extreme pre-workout with maximum stimulants and focus enhancers. For experienced users seeking intense energy and performance.',
    price: 2599,
    category: 'Pre-Workout',
    brand: 'ProSupps',
    images: ['https://res.cloudinary.com/duscymcfc/image/upload/v1/products/product-3506-featured_image-ProSupps_Hyde_Xtreme_HardHitting_Energy_Pre_Workout.jpg.jpeg'],
    tags: ['pre-workout', 'extreme', 'high stimulant', 'focus'],
    nutritionFacts: {
      servingSize: '7.5g',
      servingsPerContainer: 30,
      calories: 0,
      protein: '0g',
      carbohydrates: '0g',
      fat: '0g',
      fiber: '0g',
      sugar: '0g',
      sodium: '15mg',
      additionalInfo: '420mg Caffeine Matrix, 4g L-Citrulline, 2.5g Beta-Alanine, Yohimbe'
    },
    inStock: true,
    stockQuantity: 25
  },
  {
    name: 'Naturaltein Pure 07 Pre-Workout',
    description: 'Clean pre-workout formula with natural ingredients. Sustained energy without crash, perfect for daily training.',
    price: 1499,
    category: 'Pre-Workout',
    brand: 'Naturaltein',
    images: ['https://res.cloudinary.com/duscymcfc/image/upload/v1/products/product-353-featured_image-Naturaltein_Pure_07_Preworkout.jpg.jpeg'],
    tags: ['pre-workout', 'natural', 'clean formula', 'no crash'],
    nutritionFacts: {
      servingSize: '8g',
      servingsPerContainer: 31,
      calories: 5,
      protein: '0g',
      carbohydrates: '1g',
      fat: '0g',
      fiber: '0g',
      sugar: '0g',
      sodium: '20mg',
      additionalInfo: '200mg Natural Caffeine, 3g L-Citrulline, 2g Beta-Alanine, Green Tea Extract'
    },
    inStock: true,
    stockQuantity: 50
  }
];

async function addPreworkoutProducts() {
  console.log('🚀 Starting to add pre-workout products...');
  
  for (let i = 0; i < preworkoutProducts.length; i++) {
    const product = preworkoutProducts[i];
    try {
      console.log(`📦 Adding product ${i + 1}/${preworkoutProducts.length}: ${product.name}`);
      
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
  
  console.log('🎉 Finished adding pre-workout products!');
}

// Run the script
addPreworkoutProducts().catch(console.error);