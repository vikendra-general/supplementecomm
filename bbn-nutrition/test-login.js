// Simple test script to verify login functionality
import fetch from 'node-fetch';

async function testLogin() {
  try {
    console.log('Testing login with admin credentials...');
    
    const response = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@bbn-nutrition.com',
        password: 'Admin123!'
      }),
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Login successful!');
    } else {
      console.log('❌ Login failed:', data.message);
    }
  } catch (error) {
    console.error('Error during login test:', error);
  }
}

testLogin();

// Export for ES modules
export default testLogin;