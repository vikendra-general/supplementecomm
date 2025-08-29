'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Star, ShoppingCart, Heart } from 'lucide-react';
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
  const { addToCart, removeFromCart, isInCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { translateProduct, t } = useLanguage();
  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isRemovingFromCart, setIsRemovingFromCart] = useState(false);
  
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

  const handleAddToCart = () => {
    setIsAddingToCart(true);
    
    // Simulate API call
    setTimeout(() => {
      addToCart(product, 1);
      setIsAddingToCart(false);
      
      // Show success toast
      if (isAuthenticated) {
        toast.success(`${product.name} added to cart!`);
      } else {
        toast.success(`${product.name} added to cart! Sign in to save your cart.`);
      }
    }, 500);
  };

  const handleRemoveFromCart = () => {
    setIsRemovingFromCart(true);
    
    // Simulate API call
    setTimeout(() => {
      removeFromCart(product.id);
      setIsRemovingFromCart(false);
      toast.success(`${product.name} removed from cart!`);
    }, 500);
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
       }
       
       const productExists = wishlistItems.find((item: WishlistItem) => item.product.id === product.id);
       
       if (productExists) {
         // Remove from wishlist
         wishlistItems = wishlistItems.filter((item: WishlistItem) => item.product.id !== product.id);
        setIsWishlisted(false);
        toast.success('Removed from wishlist');
      } else {
        // Add to wishlist
        const wishlistItem = {
          id: `wishlist_${product.id}_${Date.now()}`,
          product: product,
          addedAt: new Date().toISOString()
        };
        wishlistItems.push(wishlistItem);
        setIsWishlisted(true);
        toast.success('Added to wishlist');
      }
      
      localStorage.setItem(wishlistKey, JSON.stringify(wishlistItems));
    } catch (error) {
      console.error('Error managing wishlist:', error);
      toast.error('Failed to update wishlist');
    }
  };

  const isProductInCart = isInCart(product.id);

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group relative border border-gray-200 hover:border-gray-300 flex flex-col h-full">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        <Link href={`/product/${product.id}`}>
          <Image
            src={product.images[0] || '/images/products/placeholder.svg'}
            alt={product.name}
            fill
            className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>
        
        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/90 hover:bg-white transition-all duration-200 shadow-md hover:shadow-lg backdrop-blur-sm"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart 
            className={`w-4 h-4 transition-all duration-200 ${
              isWishlisted ? 'fill-red-500 text-red-500 scale-110' : 'text-gray-400 hover:text-red-500 hover:scale-110'
            }`} 
          />
        </button>

        {/* Sale Badge */}
        {product.originalPrice && product.originalPrice > product.price && (
          <div className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
          </div>
        )}

        {/* Out of Stock Badge */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center backdrop-blur-sm">
            <span className="bg-red-500 text-white px-3 py-1.5 rounded-lg font-semibold shadow-lg text-xs">{t('common.outOfStock')}</span>
          </div>
        )}

        {/* In Cart Badge */}
        {isProductInCart && (
          <div className="absolute bottom-2 left-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-lg">
            <ShoppingCart className="w-3 h-3" />
            IN CART
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 flex flex-col flex-grow">
        {/* Brand */}
        {product.brand && (
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">
            {product.brand}
          </p>
        )}
        
        {/* Product Name */}
        <Link href={`/product/${product.id}`}>
          <h3 className="font-semibold text-gray-900 mb-2 hover:text-primary transition-colors line-clamp-2 text-sm leading-tight">
            {translatedProduct.name}
          </h3>
        </Link>

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600 font-medium">({product.rating})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          {product.originalPrice && product.originalPrice > product.price ? (
            <>
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
              <span className="text-sm text-gray-500 line-through font-medium">
                {formatPrice(product.originalPrice)}
              </span>
            </>
          ) : (
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {/* Add to Cart / Remove from Cart Button */}
        <div className="mt-auto">
        {isProductInCart ? (
          <button
            onClick={handleRemoveFromCart}
            disabled={isRemovingFromCart}
            className="w-full py-2 px-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 disabled:transform-none text-sm bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
          >
            {isRemovingFromCart ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700"></div>
                <span>Removing...</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>Remove from Cart</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock || isAddingToCart}
            className={`w-full py-2 px-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 disabled:transform-none text-sm ${
              product.inStock
                ? 'bg-primary text-white hover:bg-primary-dark'
                : 'bg-gray-100 text-gray-500 border border-gray-200 cursor-not-allowed'
            }`}
          >
            {isAddingToCart ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>{t('common.loading')}</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>
                  {product.inStock 
                    ? t('common.addToCart') 
                    : t('common.outOfStock')
                  }
                </span>
              </>
            )}
          </button>
        )}

        {/* Anonymous User Message */}
        {!isAuthenticated && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            Sign in to save your cart
          </p>
        )}
        </div>
      </div>
    </div>
  );
}