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
  const { addToCart, isInCart, getAvailableStock, getMaxQuantityCanAdd } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { translateProduct, t } = useLanguage();
  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
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
    // Check if we can add more items
    if (maxCanAdd === 0) {
      if (isOutOfStock) {
        toast.error('This item is out of stock.');
      } else {
        toast.error('Maximum quantity already in cart.');
      }
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
    <div className="group bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col h-full">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden flex-shrink-0">
        <Link href={`/product/${product.id}`}>
          <div className="relative w-full h-full">
            <Image
              src={product.images && product.images.length > 0 && product.images[0] ? product.images[0] : '/images/products/placeholder.svg'}
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
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
        >
          <Heart 
            className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
          />
        </button>

        {/* Sale Badge */}
        {product.originalPrice && product.originalPrice > product.price && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
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
          <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">
            IN CART
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Brand */}
        <p className="text-sm text-gray-500 mb-1">{product.brand}</p>
        
        {/* Product Name */}
        <Link href={`/product/${product.id}`}>
          <h3 className="font-semibold text-gray-900 mb-2 hover:text-primary transition-colors line-clamp-2 h-12 flex items-start">
            {translatedProduct.name}
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
        <div className="flex items-center mb-3 h-7">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-gray-500 line-through ml-2">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Stock Information */}
        <div className="mb-2 h-6 flex items-center">
          {isLowStock && !isOutOfStock && (
            <span className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded">
              Only {availableStock} left!
            </span>
          )}
        </div>
        
        {/* Add to Cart Button */}
        <div className="mt-auto">
        {isOutOfStock ? (
              <button
                disabled
                className="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-lg font-bold cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{t('common.outOfStock')}</span>
              </button>
            ) : (
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart || maxCanAdd === 0}
            className={`w-full py-2 px-4 rounded-lg font-bold transition-all duration-300 flex items-center justify-center space-x-2 ${
              maxCanAdd === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'energetic-cta'
            }`}
          >
            {isAddingToCart ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{t('common.loading')}</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>
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