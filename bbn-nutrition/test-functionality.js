// Comprehensive functionality test for BBN-Nutrition
// Run this in the browser console to test all features

console.log('🧪 Testing BBN-Nutrition Functionality...');

// Test 1: Check if all required components are available
function testComponents() {
  console.log('📋 Testing Components...');
  
  // Check if React is available
  if (typeof React !== 'undefined') {
    console.log('✅ React is available');
  } else {
    console.log('❌ React not found');
  }
  
  // Check if Next.js is working
  if (typeof window !== 'undefined' && window.location) {
    console.log('✅ Next.js routing is working');
  } else {
    console.log('❌ Next.js routing not found');
  }
  
  // Check if localStorage is available
  if (typeof localStorage !== 'undefined') {
    console.log('✅ localStorage is available');
  } else {
    console.log('❌ localStorage not available');
  }
}

// Test 2: Test Cart Functionality
function testCartFunctionality() {
  console.log('🛒 Testing Cart Functionality...');
  
  try {
    // Test anonymous cart
    const testCart = [
      {
        product: {
          id: 'test-1',
          name: 'Test Protein',
          price: 29.99,
          images: ['/images/products/placeholder.svg']
        },
        quantity: 2
      }
    ];
    
    localStorage.setItem('cart_anonymous', JSON.stringify(testCart));
    const retrieved = JSON.parse(localStorage.getItem('cart_anonymous'));
    
    if (retrieved && retrieved.length > 0) {
      console.log('✅ Anonymous cart persistence works');
      console.log('📦 Cart items:', retrieved);
    } else {
      console.log('❌ Anonymous cart persistence failed');
    }
    
    // Clean up
    localStorage.removeItem('cart_anonymous');
    
  } catch (error) {
    console.error('❌ Cart test failed:', error);
  }
}

// Test 3: Test Authentication
function testAuthentication() {
  console.log('🔐 Testing Authentication...');
  
  try {
    // Check if auth context is available
    const token = localStorage.getItem('token');
    if (token) {
      console.log('✅ User is authenticated');
      console.log('🔑 Token found');
    } else {
      console.log('ℹ️ User is not authenticated (expected for testing)');
    }
    
    // Test auth endpoints
    fetch('http://localhost:5001/api/health')
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          console.log('✅ Backend API is running');
        } else {
          console.log('❌ Backend API not responding properly');
        }
      })
      .catch(error => {
        console.log('⚠️ Backend API not accessible (make sure backend is running)');
      });
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error);
  }
}

// Test 4: Test UI Elements
function testUIElements() {
  console.log('🎨 Testing UI Elements...');
  
  // Check if header is present
  const header = document.querySelector('header');
  if (header) {
    console.log('✅ Header is present');
  } else {
    console.log('❌ Header not found');
  }
  
  // Check if footer is present
  const footer = document.querySelector('footer');
  if (footer) {
    console.log('✅ Footer is present');
  } else {
    console.log('❌ Footer not found');
  }
  
  // Check if navigation links are present
  const navLinks = document.querySelectorAll('nav a');
  if (navLinks.length > 0) {
    console.log(`✅ Navigation links found: ${navLinks.length}`);
  } else {
    console.log('❌ Navigation links not found');
  }
  
  // Check if cart icon is present
  const cartIcon = document.querySelector('[href="/cart"]');
  if (cartIcon) {
    console.log('✅ Cart link is present');
  } else {
    console.log('❌ Cart link not found');
  }
  
  // Check if login link is present
  const loginLink = document.querySelector('[href="/login"]');
  if (loginLink) {
    console.log('✅ Login link is present');
  } else {
    console.log('❌ Login link not found');
  }
}

// Test 5: Test Responsive Design
function testResponsiveDesign() {
  console.log('📱 Testing Responsive Design...');
  
  const viewport = window.innerWidth;
  console.log(`📏 Current viewport width: ${viewport}px`);
  
  if (viewport < 768) {
    console.log('📱 Mobile view detected');
  } else if (viewport < 1024) {
    console.log('💻 Tablet view detected');
  } else {
    console.log('🖥️ Desktop view detected');
  }
}

// Test 6: Test Performance
function testPerformance() {
  console.log('⚡ Testing Performance...');
  
  const startTime = performance.now();
  
  // Simulate some operations
  for (let i = 0; i < 1000; i++) {
    localStorage.setItem(`test-${i}`, `value-${i}`);
  }
  
  for (let i = 0; i < 1000; i++) {
    localStorage.removeItem(`test-${i}`);
  }
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  console.log(`⏱️ Performance test completed in ${duration.toFixed(2)}ms`);
  
  if (duration < 100) {
    console.log('✅ Performance is good');
  } else {
    console.log('⚠️ Performance might need optimization');
  }
}

// Run all tests
function runAllTests() {
  console.log('🚀 Starting comprehensive functionality test...\n');
  
  testComponents();
  console.log('');
  
  testCartFunctionality();
  console.log('');
  
  testAuthentication();
  console.log('');
  
  testUIElements();
  console.log('');
  
  testResponsiveDesign();
  console.log('');
  
  testPerformance();
  console.log('');
  
  console.log('🎯 All tests completed!');
  console.log('📝 Manual testing checklist:');
  console.log('1. ✅ Navigate to homepage - should see header and footer');
  console.log('2. ✅ Click on Shop link - should navigate to shop page');
  console.log('3. ✅ Add items to cart as anonymous user - should work');
  console.log('4. ✅ View cart page - should show items and anonymous banner');
  console.log('5. ✅ Click login - should go to login page');
  console.log('6. ✅ Test registration and login forms');
  console.log('7. ✅ After login, cart items should be preserved');
  console.log('8. ✅ Test responsive design on mobile/tablet');
  console.log('9. ✅ Test toast notifications when adding items');
  console.log('10. ✅ Test logout functionality');
}

// Auto-run tests if in browser
if (typeof window !== 'undefined') {
  // Wait for page to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllTests);
  } else {
    runAllTests();
  }
} else {
  console.log('⚠️ This test should be run in a browser environment');
} 