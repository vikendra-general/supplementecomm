const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE_URL = 'http://localhost:5001/api';

// Admin credentials
const ADMIN_EMAIL = 'admin@bbn-nutrition.com';
const ADMIN_PASSWORD = 'Admin123!';

let authToken = null;

// Function to login and get auth token
async function loginAdmin() {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    authToken = response.data.token;
    console.log('✅ Admin login successful');
    return authToken;
  } catch (error) {
    console.error('❌ Admin login failed:', error.response?.data || error.message);
    throw error;
  }
}

// Product data to add
const products = [
  {
    name: 'Nutrabay Gold 100% Whey Protein Concentrate',
    description: 'Premium quality whey protein concentrate with 24g protein per serving. Fast-absorbing protein ideal for muscle building and recovery. Contains all essential amino acids and BCAAs for optimal muscle protein synthesis.',
    price: 2499,
    originalPrice: 3499,
    category: 'Whey Protein',
    brand: 'Nutrabay',
    stockQuantity: 50,
    tags: 'whey protein,muscle building,post workout,protein powder,concentrate',
    featured: true,
    bestSeller: true,
    todaysDeals: false,
    existingImages: ['product-1229-featured_image-Nutrabay_Gold_100_Whey_Protein_Concentrate.jpg.jpeg', 'NB-NUT-1229-01-01.jpg.jpeg'],
    nutritionFacts: {
      servingSize: '30g',
      calories: 120,
      protein: '24g',
      carbs: '2g',
      fat: '1.5g',
      sugar: '1g',
      sodium: '50mg',
      ingredients: 'Whey Protein Concentrate (80%), Natural and Artificial Flavors, Lecithin, Sucralose, Acesulfame Potassium'
    }
  },
  {
    name: 'Gold Whey Premium Protein Powder',
    description: 'Ultra-premium whey protein blend with superior taste and mixability. Contains 25g of high-quality protein per serving with added digestive enzymes for better absorption.',
    price: 3299,
    originalPrice: 4199,
    category: 'Whey Protein',
    brand: 'Gold Standard',
    stockQuantity: 35,
    tags: 'premium whey,gold standard,digestive enzymes,muscle recovery',
    featured: true,
    bestSeller: false,
    todaysDeals: true,
    existingImages: ['Gold-Whey-1753207699.png'],
    nutritionFacts: {
      servingSize: '32g',
      calories: 130,
      protein: '25g',
      carbs: '3g',
      fat: '1g',
      sugar: '2g',
      sodium: '60mg',
      ingredients: 'Whey Protein Isolate, Whey Protein Concentrate, Natural Flavors, Digestive Enzymes (Protease, Lactase), Stevia Extract, Xanthan Gum'
    }
  },
  {
    name: 'MuscleBlaze Mass Gainer XXL',
    description: 'High-calorie mass gainer with 60g protein and complex carbohydrates. Perfect for hard gainers looking to build muscle mass and strength.',
    price: 3999,
    originalPrice: 4999,
    category: 'Mass Gainer',
    brand: 'MuscleBlaze',
    stockQuantity: 25,
    tags: 'mass gainer,weight gain,muscle building,high calorie',
    featured: true,
    bestSeller: true,
    todaysDeals: false,
    images: ['/images/products/NB-MBZ-1070-01-01.jpg.jpeg'],
    existingImages: ['product-2661-featured_image-MuscleBlaze_Mass_Gainer_XXL.jpg.jpeg', 'NB-MBZ-1070-01-01.jpg.jpeg'],
    nutritionFacts: {
      servingSize: '75g',
      calories: 350,
      protein: '60g',
      carbs: '85g',
      fat: '6g',
      sugar: '12g',
      sodium: '180mg',
      ingredients: 'Whey Protein Concentrate, Maltodextrin, Oat Flour, Cocoa Powder, Natural Flavors, Digestive Enzymes'
    }
  },
  {
    name: 'Kevin Levrone Anabolic Mass Gainer',
    description: 'Professional-grade mass gainer formula with premium protein blend and fast-acting carbohydrates for maximum muscle growth.',
    price: 4299,
    originalPrice: 5499,
    category: 'Mass Gainer',
    brand: 'Kevin Levrone',
    stockQuantity: 20,
    tags: 'anabolic,mass gainer,professional,muscle growth',
    featured: false,
    bestSeller: false,
    todaysDeals: true,
    images: ['/images/products/NB-KEV-1003-01-01.jpg.jpeg'],
    existingImages: ['product-283-featured_image-Kevin_Levrone_Anabolic_Mass_Gainer.jpg.jpeg', 'NB-KEV-1003-01-01.jpg.jpeg'],
    nutritionFacts: {
      servingSize: '100g',
      calories: 380,
      protein: '50g',
      carbs: '75g',
      fat: '4g',
      sugar: '8g',
      sodium: '150mg',
      ingredients: 'Whey Protein Isolate, Dextrose, Waxy Maize Starch, Creatine Monohydrate, L-Glutamine, Natural Flavors'
    }
  },
  {
    name: 'MuscleBlaze WrathX Pre-Workout',
    description: 'High-stimulant pre-workout formula with caffeine, beta-alanine, and citrulline for explosive energy and enhanced performance.',
    price: 1899,
    originalPrice: 2299,
    category: 'Pre-Workout',
    brand: 'MuscleBlaze',
    stockQuantity: 40,
    tags: 'pre workout,energy,performance,caffeine,beta alanine',
    featured: true,
    bestSeller: true,
    todaysDeals: false,
    images: ['/images/products/NB-MBZ-1057-01-01.jpg.jpeg'],
    existingImages: ['product-8-featured_image-MuscleBlaze_Wrathx_PreWorkout.jpg.jpeg', 'NB-MBZ-1057-01-01.jpg.jpeg'],
    nutritionFacts: {
      servingSize: '10g',
      calories: 5,
      protein: '0g',
      carbs: '1g',
      fat: '0g',
      sugar: '0g',
      sodium: '25mg',
      ingredients: 'Caffeine Anhydrous (300mg), Beta-Alanine, L-Citrulline, Creatine Monohydrate, Taurine, Natural Flavors'
    }
  },
  {
    name: 'Nutrabay Pure Creatine Monohydrate',
    description: 'Pure micronized creatine monohydrate for increased strength, power, and muscle volume. Unflavored and easily mixable.',
    price: 899,
    originalPrice: 1199,
    category: 'Creatine',
    brand: 'Nutrabay',
    stockQuantity: 60,
    tags: 'creatine,strength,power,muscle volume,unflavored',
    featured: false,
    bestSeller: true,
    todaysDeals: true,
    images: ['/images/products/NB-NUT-1033-01-01.jpg.jpeg'],
    existingImages: ['product-3063-featured_image-Nutrabay_Pure_Creatine_Monohydrate_Micronized.jpg.jpeg', 'NB-NUT-1033-01-01.jpg.jpeg'],
    nutritionFacts: {
      servingSize: '3g',
      calories: 0,
      protein: '0g',
      carbs: '0g',
      fat: '0g',
      sugar: '0g',
      sodium: '0mg',
      ingredients: '100% Pure Creatine Monohydrate (Micronized)'
    }
  },
  {
    name: 'Neuherbs Deep Sea Omega 3 Fish Oil',
    description: 'Premium quality fish oil with high EPA and DHA content for heart health, brain function, and joint support.',
    price: 1299,
    originalPrice: 1699,
    category: 'Fish Oil',
    brand: 'Neuherbs',
    stockQuantity: 45,
    tags: 'fish oil,omega 3,EPA,DHA,heart health,brain function',
    featured: false,
    bestSeller: false,
    todaysDeals: false,
    images: ['/images/products/NB-NEH-1017-01-01.jpg.jpeg'],
    existingImages: ['product-746-featured_image-Neuherbs_Deep_Sea_Omega_3_Fish_Oil__Omega_3_Supplement_Triple_Strength_2500_Mg__for_Men_and_Women.jpg.jpeg', 'NB-NEH-1017-01-01.jpg.jpeg'],
    nutritionFacts: {
      servingSize: '2 capsules',
      calories: 20,
      protein: '0g',
      carbs: '0g',
      fat: '2g',
      sugar: '0g',
      sodium: '0mg',
      ingredients: 'Fish Oil (2500mg), EPA (1200mg), DHA (900mg), Vitamin E, Gelatin Capsule'
    }
  },
  {
    name: 'CaliBar 20g Protein Bar',
    description: 'Delicious high-protein bar with 20g protein and minimal sugar. Perfect on-the-go snack for active individuals.',
    price: 199,
    originalPrice: 249,
    category: 'Protein Bars',
    brand: 'CaliBar',
    stockQuantity: 100,
    tags: 'protein bar,high protein,low sugar,convenient,snack',
    featured: false,
    bestSeller: true,
    todaysDeals: false,
    images: ['/images/products/product-3772-featured_image-CaliBar_20g_Protein_Bar_Cookie_Crunch_Crispy.jpg.jpeg'],
    existingImages: ['product-3772-featured_image-CaliBar_20g_Protein_Bar_Cookie_Crunch_Crispy.jpg.jpeg'],
    nutritionFacts: {
      servingSize: '1 bar (60g)',
      calories: 220,
      protein: '20g',
      carbs: '15g',
      fat: '8g',
      sugar: '3g',
      sodium: '120mg',
      ingredients: 'Whey Protein Isolate, Almonds, Dates, Dark Chocolate, Natural Flavors, Stevia Extract'
    }
  }
];

async function addProduct(productData) {
  try {
    const formData = new FormData();
    
    // Add basic product information
    formData.append('name', productData.name);
    formData.append('description', productData.description);
    formData.append('price', productData.price.toString());
    formData.append('originalPrice', productData.originalPrice.toString());
    formData.append('category', productData.category);
    formData.append('brand', productData.brand);
    formData.append('stockQuantity', productData.stockQuantity.toString());
    formData.append('tags', productData.tags);
    
    // Add product flags
    formData.append('featured', productData.featured.toString());
    formData.append('bestSeller', productData.bestSeller.toString());
    formData.append('todaysDeals', productData.todaysDeals.toString());
    
    // Add nutrition facts
    formData.append('nutritionFacts', JSON.stringify(productData.nutritionFacts));
    
    // Add product images (required field)
    const productImages = productData.images || ['/images/products/Gold-Whey-1753207699.png'];
    productImages.forEach(image => {
      formData.append('images', image);
    });
    
    // Add existing images
    formData.append('existingImages', JSON.stringify(productData.existingImages));
    
    const response = await axios.post(`${API_BASE_URL}/admin/products`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log(`✅ Successfully added: ${productData.name}`);
    return response.data;
  } catch (error) {
    console.error(`❌ Failed to add ${productData.name}:`, error.response?.data || error.message);
    throw error;
  }
}

async function addAllProducts() {
  console.log('🚀 Starting to add products...');
  
  // First, login to get auth token
  await loginAdmin();
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    console.log(`\n📦 Adding product ${i + 1}/${products.length}: ${product.name}`);
    
    try {
      await addProduct(product);
      // Add a small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Failed to add product: ${product.name}`);
      // Continue with next product even if one fails
    }
  }
  
  console.log('\n🎉 Finished adding all products!');
}

// Run the script
if (require.main === module) {
  addAllProducts().catch(console.error);
}

module.exports = { addAllProducts, addProduct };