const axios = require('axios');

const wheyProducts = [
  {
    name: 'Nutrabay Gold 100% Whey Protein Concentrate',
    description: 'Premium whey protein concentrate with 24g protein per serving. Enhanced with digestive enzymes for better absorption. Perfect for muscle building and recovery.',
    price: 2499,
    category: 'Protein',
    brand: 'Nutrabay',
    images: ['https://res.cloudinary.com/duscymcfc/image/upload/v1/products/product-1229-featured_image-Nutrabay_Gold_100_Whey_Protein_Concentrate.jpg.jpeg'],
    tags: ['best sellers', 'protein', 'whey', 'muscle building'],
    nutritionFacts: {
      servingSize: '30g',
      servingsPerContainer: 33,
      calories: 120,
      protein: '24g',
      carbohydrates: '2g',
      fat: '1.5g',
      fiber: '0g',
      sugar: '1g',
      sodium: '50mg',
      additionalInfo: 'Contains all 9 essential amino acids, 5.5g BCAAs per serving'
    },
    inStock: true,
    stockQuantity: 50
  },
  {
    name: 'MuscleBlaze Whey Gold 100% Whey Protein',
    description: 'Ultra-premium whey protein isolate and concentrate blend. 25g protein per serving with enhanced amino acid profile for superior muscle growth.',
    price: 3299,
    category: 'Protein',
    brand: 'MuscleBlaze',
    images: ['https://res.cloudinary.com/duscymcfc/image/upload/v1/products/NB-MBZ-1010-04-01-800x800.jpg.jpeg'],
    tags: ['best sellers', 'protein', 'whey', 'premium'],
    nutritionFacts: {
      servingSize: '33g',
      servingsPerContainer: 30,
      calories: 132,
      protein: '25g',
      carbohydrates: '2.7g',
      fat: '1.9g',
      fiber: '0g',
      sugar: '1.5g',
      sodium: '45mg',
      additionalInfo: 'Whey isolate and concentrate blend, 5.9g BCAAs, 4.3g glutamic acid'
    },
    inStock: true,
    stockQuantity: 45
  },
  {
    name: 'Optimum Nutrition Gold Standard 100% Whey',
    description: 'The world\'s best-selling whey protein. 24g of high-quality whey protein per serving with 5.5g naturally occurring BCAAs.',
    price: 4199,
    category: 'Protein',
    brand: 'Optimum Nutrition',
    images: ['https://res.cloudinary.com/duscymcfc/image/upload/v1/products/NB-OPT-1012-04-01-800x800.jpg.jpeg'],
    tags: ['best sellers', 'protein', 'whey', 'international'],
    nutritionFacts: {
      servingSize: '30.4g',
      servingsPerContainer: 29,
      calories: 120,
      protein: '24g',
      carbohydrates: '3g',
      fat: '1g',
      fiber: '1g',
      sugar: '1g',
      sodium: '130mg',
      additionalInfo: '5.5g BCAAs, 4g glutamine and glutamic acid, instantized for easy mixing'
    },
    inStock: true,
    stockQuantity: 35
  },
  {
    name: 'Nutrabay Pure 100% Whey Protein Isolate',
    description: 'Ultra-pure whey protein isolate with 27g protein per serving. Zero carbs, zero fat, lactose-free formula for lean muscle building.',
    price: 3799,
    category: 'Protein',
    brand: 'Nutrabay',
    images: ['https://res.cloudinary.com/duscymcfc/image/upload/v1/products/NB-NUT-1040-01-01-800x800.jpg.jpeg'],
    tags: ['protein', 'whey', 'isolate', 'lactose-free'],
    nutritionFacts: {
      servingSize: '30g',
      servingsPerContainer: 33,
      calories: 110,
      protein: '27g',
      carbohydrates: '0g',
      fat: '0g',
      fiber: '0g',
      sugar: '0g',
      sodium: '40mg',
      additionalInfo: '90% protein content, fast absorption, ideal for cutting phase'
    },
    inStock: true,
    stockQuantity: 40
  },
  {
    name: 'MuscleBlaze Biozyme Performance Whey',
    description: 'Advanced whey protein with enhanced absorption technology. 25g protein with digestive enzymes for maximum bioavailability.',
    price: 2899,
    category: 'Protein',
    brand: 'MuscleBlaze',
    images: ['https://res.cloudinary.com/duscymcfc/image/upload/v1/products/NB-MBZ-1031-01-01-800x800.jpg.jpeg'],
    tags: ['protein', 'whey', 'digestive enzymes', 'performance'],
    nutritionFacts: {
      servingSize: '33g',
      servingsPerContainer: 30,
      calories: 130,
      protein: '25g',
      carbohydrates: '2.5g',
      fat: '1.8g',
      fiber: '0g',
      sugar: '1.2g',
      sodium: '55mg',
      additionalInfo: 'Enhanced with digestive enzymes, 5.8g BCAAs, clinically tested'
    },
    inStock: true,
    stockQuantity: 55
  }
];

async function addWheyProducts() {
  console.log('🚀 Starting to add whey protein products...');
  
  for (let i = 0; i < wheyProducts.length; i++) {
    const product = wheyProducts[i];
    try {
      console.log(`📦 Adding product ${i + 1}/${wheyProducts.length}: ${product.name}`);
      
      const response = await axios.post('http://localhost:3000/api/products', product, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ Successfully added: ${product.name}`);
      console.log(`   Product ID: ${response.data._id}`);
      
    } catch (error) {
      console.error(`❌ Error adding product: ${product.name}`);
      if (error.response) {
        console.error(`   Status: ${error.response.status}`);
        console.error(`   Error: ${JSON.stringify(error.response.data, null, 2)}`);
      } else {
        console.error(`   Error: ${error.message}`);
      }
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('🎉 Finished adding whey protein products!');
}

// Run the script
addWheyProducts().catch(console.error);