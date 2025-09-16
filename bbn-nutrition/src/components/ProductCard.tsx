'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Star, ShoppingCart, Heart, Trash2 } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatPrice } from '@/utils/currency';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, isInCart, getAvailableStock, getMaxQuantityCanAdd, removeFromCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { translateProduct, t } = useLanguage();
  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isRemovingFromCart, setIsRemovingFromCart] = useState(false);
  
  const availableStock = getAvailableStock(product);
  const maxCanAdd = getMaxQuantityCanAdd(product);
  const isOutOfStock = availableStock === 0;
  const isLowStock = availableStock > 0 && availableStock <= 5;
  
  // Get translated product data
  const translatedProduct = translateProduct(product);
  
  // Check if product is in wishlist on component mount
  useEffect(() => {
    if (isAuthenticated) {
      try {
        // Get user from auth context or use anonymous for consistency
        const userId = user?.id || 'anonymous';
        const wishlistKey = `wishlist_${userId}`;
        const existingWishlist = localStorage.getItem(wishlistKey);
        if (existingWishlist) {
          const wishlistItems = JSON.parse(existingWishlist);
          interface WishlistItem {
             id: string;
             product: Product;
             addedAt: string;
           }
           const productExists = wishlistItems.find((item: WishlistItem) => item.product.id === product.id);
          setIsWishlisted(!!productExists);
        }
      } catch (error) {
        console.error('Error checking wishlist status:', error);
      }
    }
  }, [isAuthenticated, product.id]);

  const handleAddToCart = async () => {
    if (isOutOfStock) {
      toast.error('This item is out of stock.');
      return;
    }

    if (maxCanAdd === 0) {
      toast.error('Maximum quantity already in cart.');
      return;
    }

    setIsAddingToCart(true);
    try {
      await addToCart(product, 1);
      
      // Show success toast
      if (isAuthenticated) {
        toast.success(`${product.name} added to cart!`);
      } else {
        toast.success(`${product.name} added to cart! Sign in to save your cart.`);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleRemoveFromCart = async () => {
    // Show confirmation dialog
    const isConfirmed = window.confirm(`Are you sure you want to remove "${product.name}" from your cart?`);
    
    if (!isConfirmed) {
      return; // User cancelled, don't proceed with removal
    }

    setIsRemovingFromCart(true);
    try {
      removeFromCart(product.id);
      toast.success(`${product.name} removed from cart!`);
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item from cart. Please try again.');
    } finally {
      setIsRemovingFromCart(false);
    }
  };

  const handleWishlist = () => {
    if (!isAuthenticated) {
      // Use Next.js router for navigation
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    
    try {
      // Get user from auth context or use anonymous for consistency
      const userId = user?.id || 'anonymous';
      const wishlistKey = `wishlist_${userId}`;
      const existingWishlist = localStorage.getItem(wishlistKey);
      let wishlistItems = existingWishlist ? JSON.parse(existingWishlist) : [];
      
      interface WishlistItem {
         id: string;
         product: Product;
         addedAt: string;
         autoAddToCart?: boolean;
         notifyOnRestock?: boolean;
         wasOutOfStock?: boolean;
       }
       
       const productExists = wishlistItems.find((item: WishlistItem) => item.product.id === product.id);
       
       if (productExists) {
         // Remove from wishlist
         wishlistItems = wishlistItems.filter((item: WishlistItem) => item.product.id !== product.id);
         setIsWishlisted(false);
         toast.success('Removed from wishlist');
      } else {
        // Add to wishlist - automatically enable auto-cart for out-of-stock items
        const wishlistItem = {
          id: `wishlist_${product.id}_${Date.now()}`,
          product: product,
          addedAt: new Date().toISOString(),
          autoAddToCart: isOutOfStock, // Auto-enable for out-of-stock items
          notifyOnRestock: true,
          wasOutOfStock: isOutOfStock
        };
        wishlistItems.push(wishlistItem);
        setIsWishlisted(true);
        
        if (isOutOfStock) {
          toast.success('Added to wishlist! Will auto-add to cart when back in stock.');
        } else {
          toast.success('Added to wishlist!');
        }
      }
      
      localStorage.setItem(wishlistKey, JSON.stringify(wishlistItems));
    } catch (error) {
      console.error('Error managing wishlist:', error);
      toast.error('Failed to update wishlist');
    }
  };

  const isProductInCart = isInCart(product.id);

  return (
    <div className="group bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-xl hover:border-primary/20 transition-all duration-300 overflow-hidden flex flex-col h-full transform hover:-translate-y-1">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden flex-shrink-0">
        <Link href={`/product/${product.id}`}>
          <div className="relative w-full h-full">
            <Image
              src={product.images[0] || '/images/products/placeholder.svg'}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          </div>
        </Link>
        
        {/* Wishlist Button */}
        <button
          onClick={(e) => {
              e.preventDefault();
              handleWishlist();
            }}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-200"
        >
          <Heart 
            className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
          />
        </button>

        {/* Sale Badge */}
        {product.originalPrice && product.originalPrice > product.price && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            SALE
          </div>
        )}

        {/* Out of Stock Badge */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center pointer-events-none">
            <span className="text-white font-semibold">{t('common.outOfStock')}</span>
          </div>
        )}

        {/* In Cart Badge */}
        {isProductInCart && (
          <div className="absolute bottom-3 left-3 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            IN CART
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-5 flex flex-col flex-grow bg-gradient-to-b from-white to-gray-50/30">
        {/* Brand */}
        <p className="text-sm font-medium text-primary/70 mb-2 uppercase tracking-wide">{product.brand}</p>
        
        {/* Product Name */}
        <Link href={`/product/${product.id}`}>
          <h3 className="font-semibold text-gray-900 mb-3 hover:text-primary transition-colors text-sm leading-tight h-10 overflow-hidden" title={translatedProduct.name}>
            <span className="block truncate">
              {translatedProduct.name}
            </span>
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center mb-2 h-6">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500 ml-1">
            ({product.reviews})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center mb-4 h-8">
          <span className="text-xl font-bold text-gray-900 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-gray-500 line-through ml-3 font-medium">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Stock Information */}
        <div className="mb-3 h-6 flex items-center">
          {isLowStock && !isOutOfStock && (
            <span className="text-xs text-orange-700 font-bold bg-gradient-to-r from-orange-100 to-orange-200 px-3 py-1 rounded-full border border-orange-300">
              Only {availableStock} left!
            </span>
          )}
        </div>
        
        {/* Add to Cart Button */}
        <div className="mt-auto">
        {isOutOfStock ? (
              <button
                disabled
                className="w-full bg-gray-300 text-gray-500 py-3 px-4 rounded-xl font-bold cursor-not-allowed flex items-center justify-center space-x-2 shadow-md"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="font-bold">{t('common.outOfStock')}</span>
              </button>
            ) : isInCart(product.id) ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => router.push('/cart')}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-1 shadow-lg hover:shadow-xl transform hover:scale-105 border-2 border-blue-500 min-w-0"
                >
                  <ShoppingCart className="w-4 h-4 flex-shrink-0" />
                  <span className="whitespace-nowrap text-sm">Go to Cart</span>
                </button>
                <button
                  onClick={handleRemoveFromCart}
                  disabled={isRemovingFromCart}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Remove from cart"
                >
                  {isRemovingFromCart ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Trash2 className="w-5 h-5" />
                  )}
                </button>
              </div>
            ) : (
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart || maxCanAdd === 0}
            className={`w-full py-3 px-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 ${
              maxCanAdd === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white'
            }`}
          >
            {isAddingToCart ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="font-bold">{t('common.loading')}</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                <span className="font-bold">
                  {maxCanAdd === 0
                    ? 'Max in Cart'
                    : t('common.addToCart')
                  }
                </span>
              </>
            )}
          </button>
        )}

        {/* Anonymous User Message */}
        <div className="mt-2 h-4 flex items-center justify-center">
          {!isAuthenticated && (
            <p className="text-xs text-gray-500 text-center">
              Sign in to save your cart
            </p>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}