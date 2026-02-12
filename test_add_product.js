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

// Simple test product
const testProduct = {
  name: 'Test Whey Protein',
  description: 'Test product description',
  price: 1299,
  category: 'Protein',
  brand: 'Test Brand',
  stockQuantity: 10,
  images: ['/images/products/Gold-Whey-1753207699.png']
};

async function addTestProduct() {
  try {
    console.log('🚀 Adding test product...');
    
    // Login first
    await loginAdmin();
    
    const formData = new FormData();
    
    // Add basic required fields
    formData.append('name', testProduct.name);
    formData.append('description', testProduct.description);
    formData.append('price', testProduct.price.toString());
    formData.append('category', testProduct.category);
    formData.append('brand', testProduct.brand);
    formData.append('stockQuantity', testProduct.stockQuantity.toString());
    formData.append('images', JSON.stringify(testProduct.images));
    
    console.log('📤 Sending request...');
    
    const response = await axios.post(`${API_BASE_URL}/admin/products`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✅ Product added successfully:', response.data);
    
  } catch (error) {
    console.error('❌ Error details:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
    
    if (error.response?.data?.errors) {
      console.error('Validation errors:', error.response.data.errors);
    }
  }
}

// Run the test
addTestProduct();