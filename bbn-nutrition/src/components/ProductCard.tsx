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

  // Calculate discount percentage
  const discountPercentage = product.originalPrice && product.originalPrice > product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden flex flex-col h-full">
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
          className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white hover:scale-110 transition-all duration-200"
        >
          <Heart 
            className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
          />
        </button>

        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
            Upto {discountPercentage}% OFF
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
          <div className="absolute bottom-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
            IN CART
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 flex flex-col flex-grow">
        {/* Brand */}
         <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">{product.brand}</p>
         
         {/* Product Name */}
            <Link href={`/product/${product.id}`}>
              <h3 className="font-normal text-gray-800 mb-2 hover:text-primary transition-colors leading-tight h-10 overflow-hidden font-sans" title={translatedProduct.name} style={{fontSize: '14px'}}>
                <span className="block line-clamp-2">
                  {translatedProduct.name}
                </span>
              </h3>
            </Link>

         {/* Rating */}
         <div className="flex items-center mb-2 h-4">
           <div className="flex items-center">
             {[...Array(5)].map((_, i) => (
               <Star
                 key={i}
                 className={`w-2.5 h-2.5 ${
                   i < Math.floor(product.rating)
                     ? 'text-yellow-400 fill-current'
                     : 'text-gray-300'
                 }`}
               />
             ))}
           </div>
           <span className="text-xs text-gray-500 ml-1">
             ({product.reviewCount || (Array.isArray(product.reviews) ? product.reviews.length : product.reviews) || 0})
           </span>
         </div>

         {/* Price */}
         <div className="flex items-center mb-2 h-5">
           <span className="text-sm font-bold text-gray-900">
             {formatPrice(product.price)}
           </span>
           <span className="text-xs text-gray-500 line-through ml-2">
             {product.originalPrice && product.originalPrice > product.price && formatPrice(product.originalPrice)}
           </span>
         </div>

        {/* Stock Information */}
        <div className="mb-2 h-5 flex items-center">
          {isLowStock && !isOutOfStock && (
            <span className="text-xs text-orange-700 font-medium bg-orange-50 px-2 py-1 rounded border border-orange-200">
              Only {availableStock} left!
            </span>
          )}
        </div>
        
        {/* Add to Cart Button */}
        <div className="mt-auto">
        {isOutOfStock ? (
              <button
                disabled
                className="w-full bg-gray-200 text-gray-500 py-2.5 px-3 rounded-md font-medium cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="text-sm">{t('common.outOfStock')}</span>
              </button>
            ) : isInCart(product.id) ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => router.push('/cart')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-3 rounded-md font-medium transition-colors flex items-center justify-center space-x-1 min-w-0"
                >
                  <ShoppingCart className="w-4 h-4 flex-shrink-0" />
                  <span className="whitespace-nowrap text-sm">Go to Cart</span>
                </button>
                <button
                  onClick={handleRemoveFromCart}
                  disabled={isRemovingFromCart}
                  className="bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-md font-medium transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Remove from cart"
                >
                  {isRemovingFromCart ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            ) : (
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart || maxCanAdd === 0}
            className={`w-full py-2.5 px-3 rounded-md font-medium transition-colors flex items-center justify-center space-x-2 ${
              maxCanAdd === 0
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600 text-white'
            }`}
          >
            {isAddingToCart ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">{t('common.loading')}</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span className="text-sm">
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
            <p className="text-xs text-gray-400 text-center">
              Sign in to save your cart
            </p>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}