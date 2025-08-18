const axios = require('axios');
require('dotenv').config({ path: './config.env' });

// Configuration
const API_URL = process.env.NODE_ENV === 'production' 
  ? process.env.API_URL 
  : 'http://localhost:5001';

console.log('Using API URL:', API_URL);

let token = null;
let productId = null;
let categoryId = null;

// Helper function for API requests
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Set auth token for subsequent requests
const setAuthToken = (newToken) => {
  token = newToken;
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

// Login as admin
async function loginAsAdmin() {
  try {
    console.log('Logging in as admin...');
    const response = await api.post('/api/auth/login', {
      email: 'admin@bbn-nutrition.com',
      password: 'Admin123!'
    });

    setAuthToken(response.data.token);
    console.log('Admin login successful');
    return true;
  } catch (error) {
    console.error('Admin login failed:', error.response?.data || error.message);
    return false;
  }
}

// Test creating a category
async function testCreateCategory() {
  try {
    console.log('\nCreating test category...');
    const timestamp = Date.now();
    const categoryData = {
      name: `Test Category ${timestamp}`,
      description: 'This is a test category'
    };

    const response = await api.post('/api/admin/categories', categoryData);
    categoryId = response.data.data._id;
    console.log('Category created successfully:', response.data.data);
    return true;
  } catch (error) {
    console.error('Create category failed:', error.response?.data || error.message);
    return false;
  }
}

// Test creating a product
async function testCreateProduct() {
  try {
    console.log('\nCreating test product...');
    const productData = {
      name: 'Test Product',
      description: 'This is a test product',
      price: 29.99,
      category: categoryId,
      brand: 'Test Brand',
      stockQuantity: 100,
      nutritionFacts: JSON.stringify({
        servingSize: '1 scoop (30g)',
        servingsPerContainer: 30,
        calories: 120,
        protein: 24,
        carbs: 3,
        fat: 1
      }),
      variants: JSON.stringify([
        {
          id: 'chocolate',
          name: 'Chocolate',
          price: 29.99,
          inStock: true,
          stockQuantity: 50
        },
        {
          id: 'vanilla',
          name: 'Vanilla',
          price: 29.99,
          inStock: true,
          stockQuantity: 50
        }
      ]),
      tags: JSON.stringify(['protein', 'supplement', 'test']),
      images: JSON.stringify(['https://example.com/image1.jpg']),
      featured: true,
      bestSeller: false,
      newArrival: true,
      discount: 10,
      weight: 2.5,
      dimensions: JSON.stringify({
        length: 10,
        width: 5,
        height: 15
      }),
      shippingWeight: 3.0,
      metaTitle: 'Test Product | BBN Nutrition',
      metaDescription: 'High-quality test product for testing purposes'
    };

    const response = await api.post('/api/admin/products', productData);

    productId = response.data.data._id;
    console.log('Product created successfully:', response.data.data);
    return true;
  } catch (error) {
    console.error('Create product failed:', error.response?.data || error.message);
    return false;
  }
}

// Test getting all products
async function testGetProducts() {
  try {
    console.log('\nGetting all products...');
    const response = await api.get('/api/admin/products');

    console.log(`Retrieved ${response.data.count} products`);
    console.log('Pagination info:', {
      page: response.data.pagination.page,
      limit: response.data.pagination.limit,
      totalPages: response.data.pagination.totalPages,
      totalProducts: response.data.pagination.total
    });
    return true;
  } catch (error) {
    console.error('Get products failed:', error.response?.data || error.message);
    return false;
  }
}

// Test getting a single product
async function testGetProduct() {
  try {
    console.log('\nGetting single product...');
    if (!productId) {
      console.error('No product ID available to get');
      return false;
    }
    const response = await api.get(`/api/admin/products/${productId}`);

    console.log('Retrieved product:', response.data.data.name);
    return true;
  } catch (error) {
    console.error('Get product failed:', error.response?.data || error.message);
    return false;
  }
}

// Test updating a product
async function testUpdateProduct() {
  try {
    console.log('\nUpdating product...');
    if (!productId) {
      console.error('No product ID available for update');
      return false;
    }
    const updateData = {
      name: 'Updated Test Product',
      price: 34.99,
      featured: false,
      bestSeller: true,
      stockQuantity: 150
    };

    const response = await api.put(`/api/admin/products/${productId}`, updateData);

    console.log('Product updated successfully:', response.data.data.name);
    return true;
  } catch (error) {
    console.error('Update product failed:', error.response?.data || error.message);
    return false;
  }
}

// Test bulk update product stock
async function testBulkUpdateStock() {
  try {
    console.log('\nBulk updating product stock...');
    if (!productId) {
      console.error('No product ID available for bulk stock update');
      return false;
    }
    const updateData = {
      updates: [
        {
          productId: productId,
          stockQuantity: 200
        }
      ]
    };

    const response = await api.put('/api/admin/products/bulk-stock', updateData);

    console.log('Bulk stock update successful:', response.data);
    return true;
  } catch (error) {
    console.error('Bulk update stock failed:', error.response?.data || error.message);
    return false;
  }
}

// Test bulk update featured status
async function testBulkUpdateFeatured() {
  try {
    console.log('\nBulk updating featured status...');
    if (!productId) {
      console.error('No product ID available for bulk featured update');
      return false;
    }
    const updateData = {
      updates: [
        {
          productId: productId,
          featured: true
        }
      ]
    };

    const response = await api.put('/api/admin/products/bulk-featured', updateData);

    console.log('Bulk featured update successful:', response.data);
    return true;
  } catch (error) {
    console.error('Bulk update featured failed:', error.response?.data || error.message);
    return false;
  }
}

// Test updating a category
async function testUpdateCategory() {
  try {
    console.log('\nUpdating category...');
    if (!categoryId) {
      console.error('No category ID available for update');
      return false;
    }
    const timestamp = Date.now();
    const updateData = {
      name: `Updated Test Category ${timestamp}`,
      description: 'This is an updated test category'
    };

    const response = await api.put(`/api/admin/categories/${categoryId}`, updateData);

    console.log('Category updated successfully:', response.data.data);
    return true;
  } catch (error) {
    console.error('Update category failed:', error.response?.data || error.message);
    return false;
  }
}

// Test getting all categories
async function testGetCategories() {
  try {
    console.log('\nGetting all categories...');
    const response = await api.get('/api/categories');

    console.log(`Retrieved ${response.data.count} categories`);
    return true;
  } catch (error) {
    console.error('Get categories failed:', error.response?.data || error.message);
    return false;
  }
}

// Test deleting a product
async function testDeleteProduct() {
  try {
    console.log('\nDeleting product...');
    if (!productId) {
      console.error('No product ID available for deletion');
      return false;
    }
    const response = await api.delete(`/api/admin/products/${productId}`);

    console.log('Product deleted successfully');
    return true;
  } catch (error) {
    console.error('Delete product failed:', error.response?.data || error.message);
    return false;
  }
}

// Test deleting a category
async function testDeleteCategory() {
  try {
    console.log('\nDeleting category...');
    if (!categoryId) {
      console.error('No category ID available for deletion');
      return false;
    }
    const response = await api.delete(`/api/admin/categories/${categoryId}`);

    console.log('Category deleted successfully');
    return true;
  } catch (error) {
    console.error('Delete category failed:', error.response?.data || error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('Starting admin product management tests...');
  console.log('API URL:', API_URL);

  // Login first
  const loggedIn = await loginAsAdmin();
  if (!loggedIn) {
    console.error('Cannot proceed with tests without admin login');
    return;
  }

  // Run tests in sequence
  const tests = [
    { name: 'Create Category', fn: testCreateCategory },
    { name: 'Create Product', fn: testCreateProduct },
    { name: 'Get Products', fn: testGetProducts },
    { name: 'Get Single Product', fn: testGetProduct },
    { name: 'Update Product', fn: testUpdateProduct },
    { name: 'Bulk Update Stock', fn: testBulkUpdateStock },
    { name: 'Bulk Update Featured', fn: testBulkUpdateFeatured },
    { name: 'Update Category', fn: testUpdateCategory },
    { name: 'Get Categories', fn: testGetCategories },
    { name: 'Delete Product', fn: testDeleteProduct },
    { name: 'Delete Category', fn: testDeleteCategory }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    console.log(`\n----- Running Test: ${test.name} -----`);
    const success = await test.fn();
    if (success) {
      console.log(`✅ ${test.name} - PASSED`);
      passed++;
    } else {
      console.log(`❌ ${test.name} - FAILED`);
      failed++;
    }
  }

  // Print summary
  console.log('\n----- Test Summary -----');
  console.log(`Total Tests: ${tests.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success Rate: ${Math.round((passed / tests.length) * 100)}%`);
}

// Run the tests
runTests().catch(error => {
  console.error('Test execution error:', error);
});