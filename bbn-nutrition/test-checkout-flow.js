// Test script for checkout flow

import puppeteer from 'puppeteer';

(async () => {
  console.log('Starting checkout flow test...');
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Step 1: Navigate to the homepage
    console.log('Navigating to homepage...');
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    // Step 2: Add a product to cart
    console.log('Adding product to cart...');
    await page.click('.product-card:first-child .add-to-cart-button');
    await page.waitForTimeout(1000);
    
    // Step 3: Go to cart page
    console.log('Navigating to cart page...');
    await page.click('.cart-icon');
    await page.waitForTimeout(2000);
    
    // Step 4: Proceed to checkout
    console.log('Proceeding to checkout...');
    await page.click('.checkout-button');
    await page.waitForTimeout(2000);
    
    // Step 5: Fill billing information
    console.log('Filling billing information...');
    await page.type('input[name="fullName"]', 'Test User');
    await page.type('input[name="email"]', 'test@example.com');
    await page.type('input[name="phone"]', '9876543210');
    await page.type('input[name="street"]', '123 Test Street');
    await page.type('input[name="landmark"]', 'Near Test Landmark');
    await page.type('input[name="city"]', 'Mumbai');
    await page.type('input[name="district"]', 'Mumbai');
    await page.select('select[name="state"]', 'Maharashtra');
    await page.type('input[name="pincode"]', '400001');
    
    // Step 6: Continue to shipping
    console.log('Continuing to shipping...');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    // Step 7: Use same address for shipping and continue to payment
    console.log('Using same address for shipping and continuing to payment...');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    // Step 8: Fill payment information
    console.log('Filling payment information...');
    await page.click('input[name="paymentMethod"][value="credit"]');
    await page.type('input[name="cardNumber"]', '4111111111111111');
    await page.type('input[name="cardName"]', 'Test User');
    await page.type('input[name="expiryDate"]', '12/25');
    await page.type('input[name="cvv"]', '123');
    
    // Step 9: Place order
    console.log('Placing order...');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);
    
    // Step 10: Verify order success page
    console.log('Verifying order success page...');
    const successMessage = await page.$eval('h1', el => el.textContent);
    if (successMessage.includes('Order Placed Successfully')) {
      console.log('✅ Test passed: Order placed successfully!');
    } else {
      console.log('❌ Test failed: Order success message not found');
    }
    
  } catch (error) {
    console.error('Test failed with error:', error);
  } finally {
    await browser.close();
  }
})();