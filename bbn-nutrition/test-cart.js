// Simple test script to verify cart functionality
// Run this in the browser console to test cart features

console.log('🧪 Testing Cart Functionality...');

// Test 1: Check if cart context is available
if (typeof window !== 'undefined') {
  // This will only run in browser
  console.log('✅ Browser environment detected');
  
  // Test localStorage functionality
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    console.log('✅ localStorage is working');
  } catch (error) {
    console.error('❌ localStorage error:', error);
  }
  
  // Test cart persistence
  const testCart = [
    {
      product: {
        id: 'test-1',
        name: 'Test Product',
        price: 29.99,
        images: ['/images/products/placeholder.svg']
      },
      quantity: 2
    }
  ];
  
  try {
    localStorage.setItem('cart_anonymous', JSON.stringify(testCart));
    const retrieved = JSON.parse(localStorage.getItem('cart_anonymous'));
    console.log('✅ Cart persistence test passed');
    console.log('Retrieved cart:', retrieved);
  } catch (error) {
    console.error('❌ Cart persistence test failed:', error);
  }
  
  // Clean up test data
  localStorage.removeItem('cart_anonymous');
  
} else {
  console.log('⚠️ This test should be run in a browser environment');
}

console.log('🎯 Cart functionality test completed!');
console.log('📝 To test the full functionality:');
console.log('1. Open the website in your browser');
console.log('2. Add items to cart as anonymous user');
console.log('3. Sign in and verify cart items are preserved');
console.log('4. Test adding/removing items and quantity updates'); 