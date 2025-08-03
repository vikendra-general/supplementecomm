// Test script to verify BBN Nutrition setup
// Run this after setting up MongoDB to test the application

console.log('🧪 Testing BBN Nutrition Setup...');

// Test 1: Check if backend is running
async function testBackend() {
  console.log('Testing backend connection...');
  
  try {
    const response = await fetch('http://localhost:5001/api/health');
    const data = await response.json();
    
    if (data.status === 'OK') {
      console.log('✅ Backend is running');
      console.log('📊 Environment:', data.environment);
      console.log('🕒 Timestamp:', data.timestamp);
      return true;
    } else {
      console.log('❌ Backend responded with error');
      return false;
    }
  } catch (error) {
    console.log('❌ Backend is not accessible');
    console.log('💡 Make sure the backend server is running: cd backend && npm run dev');
    return false;
  }
}

// Test 2: Check if frontend is running
async function testFrontend() {
  console.log('Testing frontend connection...');
  
  try {
    const response = await fetch('http://localhost:3000');
    
    if (response.ok) {
      console.log('✅ Frontend is running');
      return true;
    } else {
      console.log('❌ Frontend responded with error');
      return false;
    }
  } catch (error) {
    console.log('❌ Frontend is not accessible');
    console.log('💡 Make sure the frontend server is running: npm run dev');
    return false;
  }
}

// Test 3: Check API documentation
async function testAPIDocs() {
  console.log('Testing API documentation...');
  
  try {
    const response = await fetch('http://localhost:5001/api/docs');
    const data = await response.json();
    
    if (data.message) {
      console.log('✅ API documentation is accessible');
      console.log('📚 Available endpoints:');
      Object.keys(data.endpoints).forEach(category => {
        console.log(`  ${category}: ${Object.keys(data.endpoints[category]).length} endpoints`);
      });
      return true;
    } else {
      console.log('❌ API documentation not accessible');
      return false;
    }
  } catch (error) {
    console.log('❌ API documentation not accessible');
    return false;
  }
}

// Test 4: Check database connection
async function testDatabase() {
  console.log('Testing database connection...');
  
  try {
    const response = await fetch('http://localhost:5001/api/products');
    
    if (response.ok) {
      console.log('✅ Database connection is working');
      return true;
    } else {
      console.log('❌ Database connection failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Database connection failed');
    console.log('💡 Make sure MongoDB is running and connected');
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting comprehensive setup test...\n');
  
  const tests = [
    { name: 'Backend', fn: testBackend },
    { name: 'Frontend', fn: testFrontend },
    { name: 'API Documentation', fn: testAPIDocs },
    { name: 'Database', fn: testDatabase }
  ];
  
  let passedTests = 0;
  
  for (const test of tests) {
    console.log(`\n📋 Testing ${test.name}...`);
    const result = await test.fn();
    if (result) passedTests++;
  }
  
  console.log('\n🎯 Test Results:');
  console.log(`✅ Passed: ${passedTests}/${tests.length}`);
  console.log(`❌ Failed: ${tests.length - passedTests}/${tests.length}`);
  
  if (passedTests === tests.length) {
    console.log('\n🎉 All tests passed! Your BBN Nutrition app is working correctly.');
    console.log('\n📝 Next steps:');
    console.log('1. Open http://localhost:3000 in your browser');
    console.log('2. Test the user registration and login');
    console.log('3. Add products to cart and test the checkout process');
    console.log('4. Explore the admin dashboard at /admin');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the issues above.');
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure MongoDB is running and connected');
    console.log('2. Check that both frontend and backend servers are running');
    console.log('3. Verify your environment configuration');
    console.log('4. See MONGODB_SETUP.md for detailed setup instructions');
  }
}

// Run tests if in browser environment
if (typeof window !== 'undefined') {
  runAllTests();
} else {
  console.log('⚠️ This test should be run in a browser environment');
  console.log('💡 Open http://localhost:3000 and run this script in the browser console');
} 