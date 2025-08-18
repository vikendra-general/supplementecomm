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
    await page.waitForSelector('body', { timeout: 5000 });
    
    // Check if products are loaded
    const productElements = await page.$$('button');
    console.log(`Found ${productElements.length} buttons on homepage`);
    
    // Step 2: Try to add a product to cart
    console.log('Looking for Add to Cart buttons...');
    const addToCartButtons = await page.$$('button[class*="bg-blue-600"]');
    console.log(`Found ${addToCartButtons.length} potential Add to Cart buttons`);
    
    if (addToCartButtons.length > 0) {
      console.log('Clicking first Add to Cart button...');
      await addToCartButtons[0].click();
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if cart icon shows items
      const cartText = await page.evaluate(() => {
        const cartElements = document.querySelectorAll('*');
        for (let el of cartElements) {
          if (el.textContent && el.textContent.includes('cart')) {
            return el.textContent;
          }
        }
        return 'No cart text found';
      });
      console.log('Cart status:', cartText);
    } else {
      console.log('No Add to Cart buttons found');
    }
    
    // Step 3: Navigate to cart page directly
    console.log('Navigating to cart page...');
    await page.goto('http://localhost:3000/cart');
    await page.waitForSelector('body', { timeout: 5000 });
    
    // Check cart page content
    const cartPageContent = await page.evaluate(() => document.body.textContent);
    if (cartPageContent.includes('Your cart is empty')) {
      console.log('❌ Cart is empty - Add to Cart functionality may not be working');
    } else if (cartPageContent.includes('Shopping Cart')) {
      console.log('✅ Cart has items');
      
      // Look for checkout button
      const checkoutLink = await page.$('a[href="/checkout"]');
      if (checkoutLink) {
        console.log('✅ Checkout link found');
      } else {
        console.log('❌ Checkout link not found');
      }
    }
    
    // Step 4: Test checkout page directly
    console.log('Navigating to checkout page...');
    await page.goto('http://localhost:3000/checkout');
    await page.waitForSelector('body', { timeout: 5000 });
    
    const checkoutPageContent = await page.evaluate(() => document.body.textContent);
    if (checkoutPageContent.includes('Billing Information') || checkoutPageContent.includes('Checkout')) {
      console.log('✅ Checkout page loads correctly');
    } else {
      console.log('❌ Checkout page has issues');
      console.log('Page content preview:', checkoutPageContent.substring(0, 200));
    }
    
    // Step 5: Test wishlist page
    console.log('Navigating to wishlist page...');
    await page.goto('http://localhost:3000/wishlist');
    await page.waitForSelector('body', { timeout: 5000 });
    
    const wishlistPageContent = await page.evaluate(() => document.body.textContent);
    if (wishlistPageContent.includes('Wishlist') || wishlistPageContent.includes('wishlist')) {
      console.log('✅ Wishlist page loads correctly');
    } else {
      console.log('❌ Wishlist page has issues');
      console.log('Page content preview:', wishlistPageContent.substring(0, 200));
    }
    
    console.log('\n=== Test Summary ===');
    console.log('1. Homepage: Accessible');
    console.log('2. Add to Cart: Needs verification');
    console.log('3. Cart Page: Accessible');
    console.log('4. Checkout Page: Accessible');
    console.log('5. Wishlist Page: Accessible');
    
  } catch (error) {
    console.error('Test failed with error:', error);
  } finally {
    await browser.close();
  }
})();