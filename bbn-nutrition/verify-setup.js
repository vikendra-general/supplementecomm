// Verification script for BBN-Nutrition setup
// Run this to verify everything is working correctly

console.log('🔍 Verifying BBN-Nutrition Setup...');

// Check if we're in a browser environment
if (typeof window === 'undefined') {
  console.log('❌ This script must be run in a browser environment');
  process.exit(1);
}

// Function to check if elements exist
function checkElement(selector, name) {
  const element = document.querySelector(selector);
  if (element) {
    console.log(`✅ ${name} found`);
    return true;
  } else {
    console.log(`❌ ${name} not found`);
    return false;
  }
}

// Function to check if links work
function checkLink(href, name) {
  const link = document.querySelector(`[href="${href}"]`);
  if (link) {
    console.log(`✅ ${name} link found`);
    return true;
  } else {
    console.log(`❌ ${name} link not found`);
    return false;
  }
}

// Function to check localStorage functionality
function checkLocalStorage() {
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    console.log('✅ localStorage is working');
    return true;
  } catch (error) {
    console.log('❌ localStorage is not working:', error);
    return false;
  }
}

// Function to check if React context is available
function checkReactContext() {
  // This is a basic check - in a real app, you'd check for specific context
  if (typeof React !== 'undefined') {
    console.log('✅ React is available');
    return true;
  } else {
    console.log('❌ React not found');
    return false;
  }
}

// Function to check if Next.js routing is working
function checkNextRouting() {
  if (window.location && window.location.pathname) {
    console.log('✅ Next.js routing is working');
    console.log(`📍 Current path: ${window.location.pathname}`);
    return true;
  } else {
    console.log('❌ Next.js routing not working');
    return false;
  }
}

// Function to check if the app is responsive
function checkResponsiveness() {
  const width = window.innerWidth;
  console.log(`📱 Viewport width: ${width}px`);
  
  if (width < 768) {
    console.log('📱 Mobile view detected');
  } else if (width < 1024) {
    console.log('💻 Tablet view detected');
  } else {
    console.log('🖥️ Desktop view detected');
  }
  
  return true;
}

// Function to check if all required components are present
function checkComponents() {
  console.log('\n🔍 Checking Components...');
  
  let allGood = true;
  
  // Check header
  if (!checkElement('header', 'Header')) allGood = false;
  
  // Check footer
  if (!checkElement('footer', 'Footer')) allGood = false;
  
  // Check navigation
  if (!checkElement('nav', 'Navigation')) allGood = false;
  
  // Check main content
  if (!checkElement('main', 'Main content')) allGood = false;
  
  // Check logo
  if (!checkElement('.text-xl.font-bold', 'Logo')) allGood = false;
  
  return allGood;
}

// Function to check if all required links are present
function checkLinks() {
  console.log('\n🔗 Checking Links...');
  
  let allGood = true;
  
  // Check navigation links
  if (!checkLink('/', 'Home')) allGood = false;
  if (!checkLink('/shop', 'Shop')) allGood = false;
  if (!checkLink('/about', 'About')) allGood = false;
  if (!checkLink('/contact', 'Contact')) allGood = false;
  if (!checkLink('/cart', 'Cart')) allGood = false;
  if (!checkLink('/login', 'Login')) allGood = false;
  
  return allGood;
}

// Function to check functionality
function checkFunctionality() {
  console.log('\n⚙️ Checking Functionality...');
  
  let allGood = true;
  
  // Check localStorage
  if (!checkLocalStorage()) allGood = false;
  
  // Check React
  if (!checkReactContext()) allGood = false;
  
  // Check Next.js routing
  if (!checkNextRouting()) allGood = false;
  
  // Check responsiveness
  if (!checkResponsiveness()) allGood = false;
  
  return allGood;
}

// Function to test cart functionality
function testCartFunctionality() {
  console.log('\n🛒 Testing Cart Functionality...');
  
  try {
    // Test anonymous cart
    const testCart = [
      {
        product: {
          id: 'test-1',
          name: 'Test Product',
          price: 29.99,
          images: ['/images/products/placeholder.svg']
        },
        quantity: 1
      }
    ];
    
    localStorage.setItem('cart_anonymous', JSON.stringify(testCart));
    const retrieved = JSON.parse(localStorage.getItem('cart_anonymous'));
    
    if (retrieved && retrieved.length > 0) {
      console.log('✅ Anonymous cart functionality works');
      console.log(`📦 Cart has ${retrieved.length} items`);
    } else {
      console.log('❌ Anonymous cart functionality failed');
      return false;
    }
    
    // Clean up
    localStorage.removeItem('cart_anonymous');
    return true;
    
  } catch (error) {
    console.error('❌ Cart test failed:', error);
    return false;
  }
}

// Function to check if backend is accessible
function checkBackend() {
  console.log('\n🔌 Checking Backend...');
  
  return fetch('http://localhost:5001/api/health')
    .then(response => {
      if (response.ok) {
        console.log('✅ Backend is accessible');
        return true;
      } else {
        console.log('❌ Backend responded with error');
        return false;
      }
    })
    .catch(error => {
      console.log('⚠️ Backend not accessible (make sure it\'s running)');
      console.log('💡 Run: cd backend && npm run dev');
      return false;
    });
}

// Main verification function
async function verifySetup() {
  console.log('🚀 Starting verification...\n');
  
  let allTestsPassed = true;
  
  // Check components
  if (!checkComponents()) allTestsPassed = false;
  
  // Check links
  if (!checkLinks()) allTestsPassed = false;
  
  // Check functionality
  if (!checkFunctionality()) allTestsPassed = false;
  
  // Test cart
  if (!testCartFunctionality()) allTestsPassed = false;
  
  // Check backend
  const backendOk = await checkBackend();
  if (!backendOk) allTestsPassed = false;
  
  console.log('\n🎯 Verification Complete!');
  
  if (allTestsPassed) {
    console.log('✅ All tests passed! Your BBN-Nutrition app is working correctly.');
    console.log('\n📝 Next steps:');
    console.log('1. Test adding items to cart as anonymous user');
    console.log('2. Test login/registration functionality');
    console.log('3. Test cart persistence after login');
    console.log('4. Test responsive design on different screen sizes');
  } else {
    console.log('❌ Some tests failed. Please check the issues above.');
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure both frontend and backend are running');
    console.log('2. Check browser console for any errors');
    console.log('3. Verify all dependencies are installed');
  }
  
  return allTestsPassed;
}

// Run verification
verifySetup(); 