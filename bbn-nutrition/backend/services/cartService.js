const User = require('../models/User');
const Product = require('../models/Product');

class CartService {
  constructor() {
    // In a real application, you might use Redis or a dedicated cart collection
    // For now, we'll use a simple in-memory store with user ID as key
    this.carts = new Map();
  }

  async addItemToCart(userId, productId, quantity = 1, variant = null) {
    try {
      // Get or create cart for user
      let cart = this.carts.get(userId) || {
        userId,
        items: [],
        updatedAt: new Date()
      };

      // Get product details
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      // Check stock availability
      const availableStock = this.getAvailableStock(product, variant);
      if (availableStock < quantity) {
        throw new Error(`Only ${availableStock} items available in stock`);
      }

      // Check if item already exists in cart
      const existingItemIndex = cart.items.findIndex(item => 
        item.productId === productId && 
        (!variant || item.variant?.id === variant?.id)
      );

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        const newQuantity = cart.items[existingItemIndex].quantity + quantity;
        if (newQuantity > availableStock) {
          throw new Error(`Cannot add ${quantity} more items. Only ${availableStock - cart.items[existingItemIndex].quantity} more available`);
        }
        cart.items[existingItemIndex].quantity = newQuantity;
        cart.items[existingItemIndex].updatedAt = new Date();
      } else {
        // Add new item to cart
        const cartItem = {
          productId,
          productName: product.name,
          price: variant ? variant.price : product.price,
          quantity,
          variant: variant || null,
          addedAt: new Date(),
          updatedAt: new Date()
        };
        cart.items.push(cartItem);
      }

      cart.updatedAt = new Date();
      this.carts.set(userId, cart);

      console.log(`✅ Added ${quantity}x ${product.name} to cart for user ${userId}`);
      return cart;
    } catch (error) {
      console.error('❌ Error adding item to cart:', error);
      throw error;
    }
  }

  async removeItemFromCart(userId, productId, variant = null) {
    try {
      const cart = this.carts.get(userId);
      if (!cart) {
        throw new Error('Cart not found');
      }

      cart.items = cart.items.filter(item => 
        !(item.productId === productId && 
          (!variant || item.variant?.id === variant?.id))
      );

      cart.updatedAt = new Date();
      this.carts.set(userId, cart);

      console.log(`✅ Removed item from cart for user ${userId}`);
      return cart;
    } catch (error) {
      console.error('❌ Error removing item from cart:', error);
      throw error;
    }
  }

  async updateItemQuantity(userId, productId, quantity, variant = null) {
    try {
      const cart = this.carts.get(userId);
      if (!cart) {
        throw new Error('Cart not found');
      }

      const itemIndex = cart.items.findIndex(item => 
        item.productId === productId && 
        (!variant || item.variant?.id === variant?.id)
      );

      if (itemIndex === -1) {
        throw new Error('Item not found in cart');
      }

      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        cart.items.splice(itemIndex, 1);
      } else {
        // Check stock availability
        const product = await Product.findById(productId);
        const availableStock = this.getAvailableStock(product, variant);
        
        if (quantity > availableStock) {
          throw new Error(`Only ${availableStock} items available in stock`);
        }

        cart.items[itemIndex].quantity = quantity;
        cart.items[itemIndex].updatedAt = new Date();
      }

      cart.updatedAt = new Date();
      this.carts.set(userId, cart);

      console.log(`✅ Updated cart item quantity for user ${userId}`);
      return cart;
    } catch (error) {
      console.error('❌ Error updating cart item quantity:', error);
      throw error;
    }
  }

  getCart(userId) {
    return this.carts.get(userId) || {
      userId,
      items: [],
      updatedAt: new Date()
    };
  }

  clearCart(userId) {
    this.carts.delete(userId);
    console.log(`✅ Cleared cart for user ${userId}`);
  }

  getAvailableStock(product, variant = null) {
    if (variant && variant.id) {
      const productVariant = product.variants?.find(v => v.id === variant.id);
      return productVariant ? productVariant.stockQuantity : 0;
    } else {
      return product.stockQuantity || 0;
    }
  }

  async autoAddWishlistItemsToCart(userId, wishlistItems) {
    const results = {
      success: [],
      failed: []
    };

    for (const item of wishlistItems) {
      try {
        await this.addItemToCart(
          userId,
          item.product._id,
          1, // Default quantity of 1
          item.variant
        );
        
        results.success.push({
          productId: item.product._id,
          productName: item.product.name,
          variant: item.variant
        });
      } catch (error) {
        results.failed.push({
          productId: item.product._id,
          productName: item.product.name,
          variant: item.variant,
          error: error.message
        });
      }
    }

    console.log(`🛒 Auto-cart results for user ${userId}:`, {
      successCount: results.success.length,
      failedCount: results.failed.length
    });

    return results;
  }

  // Get cart statistics
  getCartStats(userId) {
    const cart = this.getCart(userId);
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return {
      itemCount: cart.items.length,
      totalItems,
      totalValue,
      lastUpdated: cart.updatedAt
    };
  }

  // Clean up old carts (call this periodically)
  cleanupOldCarts(maxAgeHours = 24) {
    const cutoffTime = new Date(Date.now() - (maxAgeHours * 60 * 60 * 1000));
    let cleanedCount = 0;

    for (const [userId, cart] of this.carts.entries()) {
      if (cart.updatedAt < cutoffTime) {
        this.carts.delete(userId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} old carts`);
    }
  }
}

// Create singleton instance
const cartService = new CartService();

// Set up periodic cleanup (every hour)
setInterval(() => {
  cartService.cleanupOldCarts();
}, 60 * 60 * 1000);

module.exports = cartService;