'use client';

import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

// Mock product for testing
const mockProduct = {
  id: 'test-product-1',
  name: 'Test Product',
  description: 'A test product for cart functionality',
  price: 999,
  images: [],
  category: 'test',
  brand: 'Test Brand',
  inStock: true,
  stockQuantity: 10,
  variants: [],
  rating: 4.5,
  reviews: 0,
  tags: ['test']
};

export default function TestCartPage() {
  const { items, addToCart, removeFromCart, clearCart, getCartCount, getCartTotal } = useCart();
  const { isAuthenticated, user } = useAuth();

  const handleAddToCart = async () => {
    try {
      console.log('🧪 Test: Adding product to cart');
      await addToCart(mockProduct, 1);
      toast.success('Product added to cart!');
    } catch (error) {
      console.error('🧪 Test: Error adding to cart:', error);
      toast.error('Failed to add product to cart');
    }
  };

  const handleRemoveFromCart = async () => {
    try {
      console.log('🧪 Test: Removing product from cart');
      await removeFromCart(mockProduct.id);
      toast.success('Product removed from cart!');
    } catch (error) {
      console.error('🧪 Test: Error removing from cart:', error);
      toast.error('Failed to remove product from cart');
    }
  };

  const handleClearCart = async () => {
    try {
      console.log('🧪 Test: Clearing cart');
      await clearCart();
      toast.success('Cart cleared!');
    } catch (error) {
      console.error('🧪 Test: Error clearing cart:', error);
      toast.error('Failed to clear cart');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Cart Functionality Test</h1>
        
        {/* Auth Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          <p className="text-gray-600">
            <strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}
          </p>
          {user && (
            <p className="text-gray-600">
              <strong>User ID:</strong> {user.id}
            </p>
          )}
        </div>

        {/* Cart Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Cart Status</h2>
          <p className="text-gray-600 mb-2">
            <strong>Items in Cart:</strong> {getCartCount()}
          </p>
          <p className="text-gray-600 mb-4">
            <strong>Cart Total:</strong> ₹{getCartTotal()}
          </p>
          
          {items.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Cart Items:</h3>
              <ul className="space-y-2">
                {items.map((item, index) => (
                  <li key={index} className="bg-gray-50 p-3 rounded">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        <p className="text-sm text-gray-600">Price: ₹{item.product.price}</p>
                      </div>
                      <button
                        onClick={handleRemoveFromCart}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Test Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
          <div className="space-y-4">
            <button
              onClick={handleAddToCart}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Test Product to Cart
            </button>
            
            <button
              onClick={handleRemoveFromCart}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors"
              disabled={items.length === 0}
            >
              Remove Test Product from Cart
            </button>
            
            <button
              onClick={handleClearCart}
              className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              disabled={items.length === 0}
            >
              Clear Cart
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-4">Testing Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Open browser Developer Tools (F12) and go to Console tab</li>
            <li>Click &quot;Add Test Product to Cart&quot; and watch the console logs</li>
            <li>Check if the cart count and items update correctly</li>
            <li>Navigate to /cart page to see if items persist</li>
            <li>Refresh the page and check if cart items are still there</li>
            <li>Try removing items and clearing the cart</li>
          </ol>
        </div>
      </div>
    </div>
  );
}