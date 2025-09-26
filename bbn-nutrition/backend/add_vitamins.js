const axios = require('axios');

const vitaminProducts = [
  {
    name: 'Neuherbs Deep Sea Omega 3 Fish Oil',
    description: 'Premium omega-3 fish oil with high EPA and DHA content. Supports heart health, brain function, and joint mobility. Triple strength formula.',
    price: 1299,
    category: 'Vitamins & Supplements',
    brand: 'Neuherbs',
    images: ['https://res.cloudinary.com/duscymcfc/image/upload/v1/products/product-746-featured_image-Neuherbs_Deep_Sea_Omega_3_Fish_Oil__Omega_3_Supplement_Triple_Strength_2500_Mg__for_Men_and_Women.jpg.jpeg'],
    tags: ['best sellers', 'omega-3', 'heart health', 'brain health', 'fish oil'],
    nutritionFacts: {
      servingSize: '2 softgels',
      servingsPerContainer: 30,
      calories: 20,
      protein: '0g',
      carbohydrates: '0g',
      fat: '2g',
      fiber: '0g',
      sugar: '0g',
      sodium: '0mg',
      additionalInfo: '2500mg Fish Oil, 1800mg Omega-3, 1200mg EPA, 600mg DHA per serving'
    },
    inStock: true,
    stockQuantity: 75
  },
  {
    name: 'HealthAid Omega 3 750mg EPA 425mg DHA 325mg',
    description: 'High-potency omega-3 supplement with optimal EPA to DHA ratio. Molecularly distilled for purity and potency.',
    price: 1599,
    category: 'Vitamins & Supplements',
    brand: 'HealthAid',
    images: ['https://res.cloudinary.com/duscymcfc/image/upload/v1/products/product-2938-featured_image-HealthAid_Omega_3_750mg_EPA_425mg_DHA_325mg.jpg.jpeg'],
    tags: ['omega-3', 'high potency', 'EPA', 'DHA', 'heart health'],
    nutritionFacts: {
      servingSize: '1 softgel',
      servingsPerContainer: 60,
      calories: 10,
      protein: '0g',
      carbohydrates: '0g',
      fat: '1g',
      fiber: '0g',
      sugar: '0g',
      sodium: '0mg',
      additionalInfo: '750mg Omega-3, 425mg EPA, 325mg DHA, molecularly distilled'
    },
    inStock: true,
    stockQuantity: 50
  },
  {
    name: 'GNC Creatine Monohydrate',
    description: 'Pure creatine monohydrate for enhanced strength, power, and muscle growth. Micronized for better absorption and mixing.',
    price: 1199,
    category: 'Vitamins & Supplements',
    brand: 'GNC',
    images: ['https://res.cloudinary.com/duscymcfc/image/upload/v1/products/product-2595-featured_image-GNC_Creatine_Monohydrate.jpg.jpeg'],
    tags: ['best sellers', 'creatine', 'strength', 'power', 'muscle growth'],
    nutritionFacts: {
      servingSize: '5g',
      servingsPerContainer: 60,
      calories: 0,
      protein: '0g',
      carbohydrates: '0g',
      fat: '0g',
      fiber: '0g',
      sugar: '0g',
      sodium: '0mg',
      additionalInfo: '5g Pure Creatine Monohydrate, micronized for better absorption'
    },
    inStock: true,
    stockQuantity: 80
  },
  {
    name: 'Nutrabay Pure Creatine Monohydrate Micronized',
    description: 'Ultra-pure micronized creatine monohydrate. Enhances athletic performance, strength, and muscle volume. Unflavored and easy to mix.',
    price: 899,
    category: 'Vitamins & Supplements',
    brand: 'Nutrabay',
    images: ['https://res.cloudinary.com/duscymcfc/image/upload/v1/products/product-3063-featured_image-Nutrabay_Pure_Creatine_Monohydrate_Micronized.jpg.jpeg'],
    tags: ['creatine', 'micronized', 'performance', 'strength', 'unflavored'],
    nutritionFacts: {
      servingSize: '3g',
      servingsPerContainer: 100,
      calories: 0,
      protein: '0g',
      carbohydrates: '0g',
      fat: '0g',
      fiber: '0g',
      sugar: '0g',
      sodium: '0mg',
      additionalInfo: '3g Pure Creatine Monohydrate, 200 mesh micronized powder'
    },
    inStock: true,
    stockQuantity: 90
  },
  {
    name: 'MuscleBlaze Creatine Monohydrate CreAMP',
    description: 'Advanced creatine formula with enhanced absorption technology. Supports explosive strength, power, and muscle growth.',
    price: 1399,
    category: 'Vitamins & Supplements',
    brand: 'MuscleBlaze',
    images: ['https://res.cloudinary.com/duscymcfc/image/upload/v1/products/product-3743-featured_image-MuscleBlaze_Creatine_Monohydrate_Cre_AMP.jpg.jpeg'],
    tags: ['creatine', 'enhanced absorption', 'strength', 'power', 'muscle growth'],
    nutritionFacts: {
      servingSize: '5g',
      servingsPerContainer: 50,
      calories: 0,
      protein: '0g',
      carbohydrates: '0g',
      fat: '0g',
      fiber: '0g',
      sugar: '0g',
      sodium: '0mg',
      additionalInfo: '5g Creatine Monohydrate with CreAMP technology for enhanced uptake'
    },
    inStock: true,
    stockQuantity: 65
  },
  {
    name: 'Naturaltein Vitamin D3K2',
    description: 'Synergistic combination of Vitamin D3 and K2 for optimal bone health and calcium absorption. Essential for immune function.',
    price: 799,
    category: 'Vitamins & Supplements',
    brand: 'Naturaltein',
    images: ['https://res.cloudinary.com/duscymcfc/image/upload/v1/products/product-3976-featured_image-Naturaltein_Vitamin_D3K2.jpg.jpeg'],
    tags: ['vitamin D3', 'vitamin K2', 'bone health', 'immune support', 'calcium absorption'],
    nutritionFacts: {
      servingSize: '1 tablet',
      servingsPerContainer: 60,
      calories: 0,
      protein: '0g',
      carbohydrates: '0g',
      fat: '0g',
      fiber: '0g',
      sugar: '0g',
      sodium: '0mg',
      additionalInfo: '2000 IU Vitamin D3, 100mcg Vitamin K2 (MK-7) per tablet'
    },
    inStock: true,
    stockQuantity: 70
  }
];

async function addVitaminProducts() {
  console.log('🚀 Starting to add vitamin and supplement products...');
  
  for (let i = 0; i < vitaminProducts.length; i++) {
    const product = vitaminProducts[i];
    try {
      console.log(`📦 Adding product ${i + 1}/${vitaminProducts.length}: ${product.name}`);
      
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
  
  console.log('🎉 Finished adding vitamin and supplement products!');
}

// Run the script
addVitaminProducts().catch(console.error);