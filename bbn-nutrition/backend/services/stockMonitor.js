const User = require('../models/User');
const Product = require('../models/Product');
const nodemailer = require('nodemailer');
const cartService = require('./cartService');

class StockMonitorService {
  constructor() {
    this.isRunning = false;
    this.checkInterval = 5 * 60 * 1000; // Check every 5 minutes
    this.intervalId = null;
  }

  start() {
    if (this.isRunning) {
      console.log('Stock monitor is already running');
      return;
    }

    console.log('🔍 Starting stock monitor service...');
    this.isRunning = true;
    
    // Run initial check
    this.checkStockChanges();
    
    // Set up interval
    this.intervalId = setInterval(() => {
      this.checkStockChanges();
    }, this.checkInterval);
  }

  stop() {
    if (!this.isRunning) {
      console.log('Stock monitor is not running');
      return;
    }

    console.log('⏹️ Stopping stock monitor service...');
    this.isRunning = false;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async checkStockChanges() {
    try {
      console.log('🔍 Checking stock changes...');
      
      // Get all users with wishlist items marked as out of stock
      const usersWithOutOfStockWishlist = await User.find({
        'wishlist.wasOutOfStock': true
      }).populate('wishlist.product');

      for (const user of usersWithOutOfStockWishlist) {
        await this.processUserWishlist(user);
      }
      
      console.log(`✅ Stock check completed for ${usersWithOutOfStockWishlist.length} users`);
    } catch (error) {
      console.error('❌ Error during stock check:', error);
    }
  }

  async processUserWishlist(user) {
    const restockedItems = [];
    const itemsToNotify = [];
    const itemsToAutoCart = [];

    for (const wishlistItem of user.wishlist) {
      if (!wishlistItem.wasOutOfStock || !wishlistItem.product) continue;

      const product = wishlistItem.product;
      const isNowInStock = this.checkProductStock(product, wishlistItem.variant);

      if (isNowInStock) {
        restockedItems.push(wishlistItem);
        
        // Mark as no longer out of stock
        wishlistItem.wasOutOfStock = false;
        
        if (wishlistItem.autoAddToCart) {
          itemsToAutoCart.push(wishlistItem);
        }
        
        if (wishlistItem.notifyOnRestock) {
          itemsToNotify.push(wishlistItem);
        }
      }
    }

    if (restockedItems.length > 0) {
      // Save updated wishlist
      await user.save();
      
      // Process auto-cart items
      if (itemsToAutoCart.length > 0) {
        await this.processAutoCartItems(user, itemsToAutoCart);
      }
      
      // Send notifications
      if (itemsToNotify.length > 0) {
        await this.sendRestockNotifications(user, itemsToNotify);
      }
      
      console.log(`📦 Processed ${restockedItems.length} restocked items for user ${user.email}`);
    }
  }

  checkProductStock(product, variant = null) {
    if (variant && variant.id) {
      // Check variant stock
      const productVariant = product.variants?.find(v => v.id === variant.id);
      return productVariant && productVariant.inStock && productVariant.stockQuantity > 0;
    } else {
      // Check main product stock
      return product.inStock && product.stockQuantity > 0;
    }
  }

  async processAutoCartItems(user, items) {
    try {
      console.log(`🛒 Auto-adding ${items.length} items to cart for user ${user.email}`);
      
      // Use cart service to add items to cart
      const results = await cartService.autoAddWishlistItemsToCart(user._id.toString(), items);
      
      // Remove successfully added items from wishlist
      for (const successItem of results.success) {
        await user.removeFromWishlist(successItem.productId, successItem.variant?.id);
      }
      
      // Log results
      if (results.success.length > 0) {
        console.log(`✅ Successfully auto-added ${results.success.length} items to cart`);
      }
      
      if (results.failed.length > 0) {
        console.log(`⚠️ Failed to auto-add ${results.failed.length} items:`, 
          results.failed.map(f => `${f.productName}: ${f.error}`).join(', '));
      }
      
      // Send notification about auto-cart action
      if (results.success.length > 0) {
        await this.sendAutoCartNotification(user, results.success, results.failed);
      }
      
    } catch (error) {
      console.error('❌ Error processing auto-cart items:', error);
    }
  }

  async sendRestockNotifications(user, items) {
    try {
      console.log(`📧 Sending restock notifications to ${user.email}`);
      
      // Create email transporter
      const transporter = nodemailer.createTransporter({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const itemsList = items.map(item => {
        const productName = item.product.name;
        const variantInfo = item.variant ? ` (${item.variant.name})` : '';
        return `• ${productName}${variantInfo}`;
      }).join('\n');

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@bbn-nutrition.com',
        to: user.email,
        subject: '🎉 Great News! Your Wishlist Items Are Back in Stock',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Your Wishlist Items Are Back! 🎉</h2>
            <p>Hi ${user.name},</p>
            <p>Great news! The following items from your wishlist are now back in stock:</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <pre style="margin: 0; font-family: Arial, sans-serif;">${itemsList}</pre>
            </div>
            <p>Don't wait too long - these popular items might sell out again quickly!</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/dashboard?tab=wishlist" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View My Wishlist
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">Best regards,<br>BBN Nutrition Team</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ Restock notification sent to ${user.email}`);
      
    } catch (error) {
      console.error('❌ Error sending restock notification:', error);
    }
  }

  async sendAutoCartNotification(user, successItems, failedItems = []) {
    try {
      console.log(`📧 Sending auto-cart notification to ${user.email}`);
      
      // Create email transporter
      const transporter = nodemailer.createTransporter({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const successList = successItems.map(item => {
        const variantInfo = item.variant ? ` (${item.variant.name})` : '';
        return `• ${item.productName}${variantInfo}`;
      }).join('\n');

      let failedSection = '';
      if (failedItems.length > 0) {
        const failedList = failedItems.map(item => {
          const variantInfo = item.variant ? ` (${item.variant.name})` : '';
          return `• ${item.productName}${variantInfo} - ${item.error}`;
        }).join('\n');
        
        failedSection = `
          <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
            <h4 style="color: #dc2626; margin: 0 0 10px 0;">⚠️ Some items couldn't be added:</h4>
            <pre style="margin: 0; font-family: Arial, sans-serif; color: #7f1d1d;">${failedList}</pre>
          </div>
        `;
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@bbn-nutrition.com',
        to: user.email,
        subject: '🛒 Items Automatically Added to Your Cart!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Great News! Items Added to Cart 🛒</h2>
            <p>Hi ${user.name},</p>
            <p>We've automatically added the following restocked items from your wishlist to your cart:</p>
            <div style="background-color: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
              <pre style="margin: 0; font-family: Arial, sans-serif;">${successList}</pre>
            </div>
            ${failedSection}
            <p>These items are now in your cart and ready for checkout. Don't wait too long - they might sell out again!</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/cart" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
                View Cart
              </a>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/checkout" 
                 style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Checkout Now
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">This is an automated service based on your wishlist preferences. You can manage these settings in your account.</p>
            <p style="color: #6b7280; font-size: 14px;">Best regards,<br>BBN Nutrition Team</p>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ Auto-cart notification sent to ${user.email}`);
      
    } catch (error) {
      console.error('❌ Error sending auto-cart notification:', error);
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      checkInterval: this.checkInterval,
      nextCheck: this.intervalId ? new Date(Date.now() + this.checkInterval) : null
    };
  }
}

// Create singleton instance
const stockMonitor = new StockMonitorService();

module.exports = stockMonitor;