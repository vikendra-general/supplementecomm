const axios = require('axios');
const FormData = require('form-data');

const API_BASE_URL = 'http://localhost:5001/api';
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

// Simple product data with only required fields
const products = [
  {
    name: 'Nutrabay Gold 100% Whey Protein Concentrate',
    description: 'Premium whey protein concentrate with 24g protein per serving. Perfect for muscle building and recovery.',
    price: 1299,
    category: 'Protein',
    brand: 'Nutrabay',
    stockQuantity: 50,
    images: ['/images/products/Gold-Whey-1753207699.png']
  },
  {
    name: 'Gold Whey Premium Protein Powder',
    description: 'High-quality whey protein powder with excellent mixability and taste. 25g protein per serving.',
    price: 1499,
    category: 'Protein',
    brand: 'Gold Standard',
    stockQuantity: 30,
    images: ['/images/products/NB-NUT-1006-01-01.jpg.jpeg']
  },
  {
    name: 'MuscleBlaze Mass Gainer XXL',
    description: 'High-calorie mass gainer with 60g protein and complex carbs. Perfect for weight gain.',
    price: 2299,
    category: 'Mass Gainer',
    brand: 'MuscleBlaze',
    stockQuantity: 25,
    images: ['/images/products/NB-MBZ-1070-01-01.jpg.jpeg']
  },
  {
    name: 'Kevin Levrone Anabolic Mass Gainer',
    description: 'Premium mass gainer with 40g protein and fast-acting carbs for muscle growth.',
    price: 3299,
    category: 'Mass Gainer',
    brand: 'Kevin Levrone',
    stockQuantity: 15,
    images: ['/images/products/NB-KEV-1003-01-01.jpg.jpeg']
  },
  {
    name: 'MuscleBlaze WrathX Pre-Workout',
    description: 'Intense pre-workout formula with caffeine, creatine, and beta-alanine for explosive energy.',
    price: 1799,
    category: 'Pre-Workout',
    brand: 'MuscleBlaze',
    stockQuantity: 40,
    images: ['/images/products/NB-MBZ-1057-01-01.jpg.jpeg']
  },
  {
    name: 'Nutrabay Pure Creatine Monohydrate',
    description: 'Pure creatine monohydrate for increased strength, power, and muscle mass.',
    price: 899,
    category: 'Creatine',
    brand: 'Nutrabay',
    stockQuantity: 60,
    images: ['/images/products/NB-NUT-1033-01-01.jpg.jpeg']
  },
  {
    name: 'Neuherbs Deep Sea Omega 3 Fish Oil',
    description: 'Premium fish oil with EPA and DHA for heart health and brain function.',
    price: 1299,
    category: 'Health',
    brand: 'Neuherbs',
    stockQuantity: 35,
    images: ['/images/products/NB-NEH-1017-01-01.jpg.jpeg']
  },
  {
    name: 'CaliBar 20g Protein Bar',
    description: 'Delicious protein bar with 20g protein and natural ingredients. Perfect on-the-go snack.',
    price: 199,
    category: 'Protein Bars',
    brand: 'CaliBar',
    stockQuantity: 100,
    images: ['/images/products/product-3772-featured_image-CaliBar_20g_Protein_Bar_Cookie_Crunch_Crispy.jpg.jpeg']
  }
];

async function addProduct(productData) {
  try {
    const formData = new FormData();
    
    // Add only required fields
    formData.append('name', productData.name);
    formData.append('description', productData.description);
    formData.append('price', productData.price.toString());
    formData.append('category', productData.category);
    formData.append('brand', productData.brand);
    formData.append('stockQuantity', productData.stockQuantity.toString());
    
    // Add images
    productData.images.forEach(image => {
      formData.append('images', image);
    });
    
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
    } catch (error) {
      console.error(`Failed to add product: ${product.name}`);
    }
  }
  
  console.log('\n🎉 Finished adding all products!');
}

// Run the script
addAllProducts().catch(console.error);