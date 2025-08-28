'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Minus, Plus, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatPrice } from '@/utils/currency';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, getCartTotal, clearCart, getAvailableStock } = useCart();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    setIsUpdating(productId);
    try {
      updateQuantity(productId, newQuantity);
      toast.success('Cart updated');
    } catch {
      toast.error('Failed to update cart');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
    toast.success('Item removed from cart');
  };

  const handleClearCart = () => {
    clearCart();
    toast.success('Cart cleared');
  };

  const subtotal = getCartTotal();
  const freeShippingThreshold = 2999; // Free shipping over ₹2999 (more appropriate for Indian market)
  const shipping = subtotal >= freeShippingThreshold ? 0 : 199; // ₹199 shipping fee
  const total = subtotal + shipping; // No tax calculation

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('cart.emptyTitle')}</h1>
          <p className="text-gray-600 mb-8">{t('cart.emptyMessage')}</p>
          <Link
            href="/shop"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('cart.title')}</h1>
          <p className="text-gray-600">
            {items.length} {items.length !== 1 ? 'products' : 'product'}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">{t('cart.cartItems')}</h2>
                  <button
                    onClick={handleClearCart}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    {t('cart.clearCart')}
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.variant?.id || 'default'}`} className="p-6">
                    <div className="flex items-center space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <Link href={`/product/${item.product.id}`}>
                          <div className="w-20 h-20 relative rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                            <Image
                              src={item.product.images[0] || '/images/products/placeholder.svg'}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        </Link>
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <Link href={`/product/${item.product.id}`}>
                              <h3 className="text-lg font-semibold text-gray-900 hover:text-primary transition-colors cursor-pointer">
                                {item.product.name}
                              </h3>
                            </Link>
                            {item.variant && (
                              <p className="text-sm text-gray-500">
                                Variant: {item.variant.name}
                              </p>
                            )}
                            <p className="text-sm text-gray-500">{item.product.brand}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-gray-900">
                              {formatPrice((item.variant?.price || item.product.price) * item.quantity)}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatPrice(item.variant?.price || item.product.price)} each
                            </p>
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                                disabled={isUpdating === item.product.id || item.quantity <= 1}
                                className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-12 text-center font-medium">
                                {isUpdating === item.product.id ? '...' : item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                                disabled={isUpdating === item.product.id || item.quantity >= getAvailableStock(item.product, item.variant)}
                                className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                title={item.quantity >= getAvailableStock(item.product, item.variant) ? 'Maximum stock reached' : 'Increase quantity'}
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            {getAvailableStock(item.product, item.variant) <= 10 && (
                              <span className="text-xs text-gray-500">
                                {getAvailableStock(item.product, item.variant)} available
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.product.id)}
                            className="text-red-600 hover:text-red-700 p-2"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-80">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('cart.subtotal')}</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('cart.shipping')}</span>
                  <span className="font-medium">
                    {shipping === 0 ? t('cart.free') : formatPrice(shipping)}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">{t('cart.total')}</span>
                    <span className="text-lg font-semibold text-gray-900">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              {shipping > 0 && (
                <div className="mb-6 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    {t('cart.add')} {formatPrice(freeShippingThreshold - subtotal)} {t('cart.freeShippingMessage')}
                  </p>
                </div>
              )}
              
              {shipping === 0 && subtotal >= freeShippingThreshold && (
                <div className="mb-6 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">
                    {t('cart.qualifyFreeShipping')}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <Link
                  href="/checkout"
                  className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  {t('cart.proceedToCheckout')}
                </Link>
                
                <Link
                  href="/shop"
                  className="w-full bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  {t('cart.continueShopping')}
                </Link>
              </div>

              {!isAuthenticated && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-700">
                    {t('header.signIn')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}