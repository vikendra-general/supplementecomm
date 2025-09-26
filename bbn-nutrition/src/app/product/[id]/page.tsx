'use client';

import { useState, use, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingCart, Heart, Truck, Shield, Clock } from 'lucide-react';
import { notFound } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice } from '@/utils/currency';
import { apiService } from '@/utils/api';
import { Product } from '@/types';
import { Review } from '@/types';
import toast from 'react-hot-toast';

interface ProductDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = use(params);
  const { addToCart, isInCart, getAvailableStock, getMaxQuantityCanAdd } = useCart();
  const { isAuthenticated, user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  // Review state
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getProduct(id);
         if (response.success && response.data) {
           setProduct(response.data as Product);
        } else {
          setError('Product not found');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        // Fall back to static data
        const { products } = await import('@/data/products');
        const staticProduct = products.find(p => p.id === id);
        if (staticProduct) {
          setProduct(staticProduct);
          setError(null);
        } else {
          setError('Product not found');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Fetch reviews for the product
  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;
      
      try {
        setReviewsLoading(true);
        const response = await apiService.getProductReviews(id);
        if (response.success && response.data) {
          setReviews(response.data);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [id]);

  // Check if product is in wishlist when product loads
  useEffect(() => {
    if (isAuthenticated && product) {
      try {
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
  }, [isAuthenticated, product, user]);

  // Reset quantity when variant changes
  useEffect(() => {
    if (product && selectedVariant) {
      const variant = product.variants?.find(v => v.id === selectedVariant);
      const availableStock = getAvailableStock(product, variant);
      
      // Reset quantity to 1 when variant changes
      setQuantity(1);
      
      // If current quantity exceeds variant stock, adjust it
      if (quantity > availableStock) {
        setQuantity(Math.min(quantity, availableStock));
      }
    }
  }, [selectedVariant, product, getAvailableStock, quantity]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-gray-200 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    notFound();
  }

  const handleAddToCart = async () => {
    if (!product) return;
    
    const variant = product.variants?.find(v => v.id === selectedVariant);
    const availableStock = getAvailableStock(product, variant);
    const maxCanAdd = getMaxQuantityCanAdd(product, variant);
    
    if (quantity > maxCanAdd) {
      if (maxCanAdd === 0) {
        if (availableStock === 0) {
          toast.error('This item is out of stock.');
        } else {
          toast.error('Maximum quantity already in cart.');
        }
      } else {
        toast.error(`Only ${maxCanAdd} more item(s) can be added to cart.`);
        setQuantity(maxCanAdd);
      }
      return;
    }
    
    setIsAddingToCart(true);
    try {
      await addToCart(product, quantity, variant);
      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };
  
  const handleQuantityChange = (newQuantity: number) => {
    if (!product) return;
    
    const variant = product.variants?.find(v => v.id === selectedVariant);
    const availableStock = getAvailableStock(product, variant);
    
    if (newQuantity < 1) {
      setQuantity(1);
    } else if (newQuantity > availableStock) {
      setQuantity(availableStock);
      toast.error(`Maximum ${availableStock} item(s) available.`);
    } else {
      setQuantity(newQuantity);
    }
  };

  const handleWishlist = () => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    
    if (!product) return;
    
    try {
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
  
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    
    if (reviewRating === 0) {
      setReviewError('Please select a rating');
      return;
    }
    
    if (reviewComment.length < 10) {
      setReviewError('Review comment must be at least 10 characters');
      return;
    }
    
    setIsSubmittingReview(true);
    setReviewError(null);
    
    try {
      const response = await apiService.addReview(id, {
        rating: reviewRating,
        comment: reviewComment
      });
      
      if (response.success) {
        setReviewSuccess(true);
        setReviewComment('');
        setReviewRating(0);
        
        // Refresh product data to show the new review
        const updatedProduct = await apiService.getProduct(id);
        if (updatedProduct.success && updatedProduct.data) {
          setProduct(updatedProduct.data as Product);
        }
        
        // Refresh reviews list
        const reviewsResponse = await apiService.getProductReviews(id);
        if (reviewsResponse.success && reviewsResponse.data) {
          setReviews(reviewsResponse.data);
        }
        
        toast.success('Your review has been submitted successfully!');
        
        // Reset success message after 5 seconds
        setTimeout(() => {
          setReviewSuccess(false);
        }, 5000);
      } else {
        setReviewError(response.message || 'Failed to submit review');
      }
    } catch (error: unknown) {
      console.error('Review submission error:', error);
      setReviewError(error instanceof Error ? error.message : 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };



  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={(() => {
                // Handle case where images might be a stringified array
                let imageUrl = product.images?.[0] || '/images/products/placeholder.svg';
                
                // If the imageUrl looks like a stringified array, parse it
                if (typeof imageUrl === 'string' && imageUrl.startsWith('[') && imageUrl.endsWith(']')) {
                  try {
                    const parsed = JSON.parse(imageUrl);
                    imageUrl = Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : '/images/products/placeholder.svg';
                  } catch {
                    console.warn('Failed to parse image URL:', imageUrl);
                    imageUrl = '/images/products/placeholder.svg';
                  }
                }
                
                return imageUrl;
              })()}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          
          {/* Thumbnail Images */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(0, 4).map((image, index) => {
                let imageUrl = image;
                
                // Handle stringified array case
                if (typeof imageUrl === 'string' && imageUrl.startsWith('[') && imageUrl.endsWith(']')) {
                  try {
                    const parsed = JSON.parse(imageUrl);
                    imageUrl = Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : '/images/products/placeholder.svg';
                  } catch {
                    imageUrl = '/images/products/placeholder.svg';
                  }
                }
                
                return (
                  <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-75 transition-opacity">
                    <Image
                      src={imageUrl}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 25vw, 12.5vw"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Brand and Name */}
          <div>
            <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
            <h1 className="text-3xl font-bold text-black mb-4">{product.name}</h1>
          </div>

          {/* Rating */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.floor(product.rating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-gray-600">
              {product.rating} ({product.reviewCount || (Array.isArray(product.reviews) ? product.reviews.length : product.reviews) || 0} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center space-x-4">
            <span className="text-3xl font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xl text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            {product.originalPrice && (
              <span className="bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
              </span>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-black mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-black mb-2">Flavor</h3>
              <div className="flex space-x-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant.id)}
                    disabled={!variant.inStock}
                    className={`px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                      selectedVariant === variant.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : variant.inStock
                        ? 'border-gray-300 hover:border-blue-500'
                        : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {variant.name}
                    {!variant.inStock && ' (Out of Stock)'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <h3 className="text-lg font-semibold text-black mb-2">Quantity</h3>
            {(() => {
              const variant = product.variants?.find(v => v.id === selectedVariant);
              const availableStock = getAvailableStock(product, variant);
              const maxCanAdd = getMaxQuantityCanAdd(product, variant);
              const isProductInCart = isInCart(product.id);
              
              return (
                <div className="space-y-3">
                  {/* Stock Information */}
                  <div className="flex items-center space-x-4 text-sm">
                    <span className={`font-medium ${
                      availableStock === 0 
                        ? 'text-red-600' 
                        : availableStock <= 5 
                        ? 'text-orange-600' 
                        : 'text-green-600'
                    }`}>
                      {availableStock === 0 
                        ? 'Out of Stock' 
                        : availableStock <= 5 
                        ? `Only ${availableStock} left!` 
                        : `${availableStock} available`
                      }
                    </span>
                    {isProductInCart && maxCanAdd < availableStock && (
                      <span className="text-gray-500">
                        ({maxCanAdd} more can be added)
                      </span>
                    )}
                  </div>
                  
                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(quantity - 1)}
                        disabled={quantity <= 1}
                        className="px-3 py-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                        min="1"
                        max={availableStock}
                        className="w-16 px-2 py-2 text-center border-x border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= availableStock}
                        className="px-3 py-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={quantity >= availableStock ? 'Maximum stock reached' : 'Increase quantity'}
                      >
                        +
                      </button>
                    </div>
                    
                    {isProductInCart && (
                      <span className="text-sm text-gray-600">
                        Update quantity in cart
                      </span>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            {(() => {
              const variant = product.variants?.find(v => v.id === selectedVariant);
              const availableStock = getAvailableStock(product, variant);
              const maxCanAdd = getMaxQuantityCanAdd(product, variant);
              const isProductInCart = isInCart(product.id);
              const isOutOfStock = availableStock === 0;
              const canAddMore = maxCanAdd > 0;
              
              return (
                <>
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || isAddingToCart || (!canAddMore && isProductInCart)}
                    className={`flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-semibold transition-colors ${
                      isOutOfStock
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : (!canAddMore && isProductInCart)
                        ? 'bg-orange-500 text-white cursor-not-allowed'
                        : isProductInCart
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isAddingToCart ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Adding...</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        <span>
                          {isOutOfStock
                            ? 'Out of Stock'
                            : (!canAddMore && isProductInCart)
                            ? 'Max Quantity in Cart'
                            : isProductInCart
                            ? `Add ${quantity} More to Cart`
                            : `Add ${quantity} to Cart`
                          }
                        </span>
                      </>
                    )}
                  </button>
                  
                  {isProductInCart && (
                    <Link href="/cart">
                      <button className="px-6 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-semibold transition-colors">
                        View Cart
                      </button>
                    </Link>
                  )}
                </>
              );
            })()}
            

            <button
              onClick={handleWishlist}
              className={`p-3 rounded-lg border-2 transition-colors ${
                isWishlisted
                  ? 'border-red-500 bg-red-50 text-red-600'
                  : 'border-gray-300 hover:border-red-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
            <div className="text-center">
              <Truck className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Free Shipping</p>
            </div>
            <div className="text-center">
              <Shield className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Quality Guaranteed</p>
            </div>
            <div className="text-center">
              <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Fast Delivery</p>
            </div>
          </div>
        </div>
      </div>

      {/* Nutrition Facts */}
      {product.nutritionFacts && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-black mb-6">Nutrition Facts</h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-black mb-4">Per Serving</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Serving Size</span>
                    <span className="font-medium">{product.nutritionFacts.servingSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Calories</span>
                    <span className="font-medium">{product.nutritionFacts.calories}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Protein</span>
                    <span className="font-medium">{product.nutritionFacts.protein}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Carbohydrates</span>
                    <span className="font-medium">{product.nutritionFacts.carbs}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fat</span>
                    <span className="font-medium">{product.nutritionFacts.fat}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sugar</span>
                    <span className="font-medium">{product.nutritionFacts.sugar}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sodium</span>
                    <span className="font-medium">{product.nutritionFacts.sodium}mg</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-black mb-4">Ingredients</h3>
                <ul className="space-y-1">
                  {product.nutritionFacts.ingredients.map((ingredient, index) => (
                    <li key={index} className="text-gray-600">• {ingredient}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-black mb-6">Customer Reviews</h2>
        
        {/* Write a Review Form */}
        {isAuthenticated ? (
          <div className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-black mb-4">Write a Review</h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
                  Rating
                </label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${reviewRating >= star ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Review
                </label>
                <textarea
                  id="comment"
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience with this product..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                  minLength={10}
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {reviewComment.length}/500 characters (minimum 10)
                </p>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingReview || reviewRating === 0 || reviewComment.length < 10}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
              
              {reviewError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{reviewError}</p>
                </div>
              )}
              
              {reviewSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-600">Your review has been submitted successfully!</p>
                </div>
              )}
            </form>
          </div>
        ) : (
          <div className="mb-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
            <p className="text-blue-700 mb-2">Please <Link href={`/login?redirect=/product/${id}`} className="font-semibold underline">login</Link> to write a review.</p>
          </div>
        )}
        
        {/* Reviews List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-black">
              Reviews ({reviews.length})
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select className="text-sm border border-gray-300 rounded-md px-2 py-1">
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="rating-high">Highest Rating</option>
                <option value="rating-low">Lowest Rating</option>
              </select>
            </div>
          </div>

          {reviewsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-start space-x-4 p-6 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/6"></div>
                      <div className="h-4 bg-gray-300 rounded w-full"></div>
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review, index) => (
                <div key={review._id || index} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                        {review.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium text-black">
                            {review.user?.name || 'Anonymous User'}
                          </h4>
                          <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                            ✓ Verified Customer
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {review.rating}.0
                          </span>
                          <span className="text-sm text-gray-500">
                            • {new Date(review.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <p className="text-gray-700 leading-relaxed mb-4">
                          {review.comment}
                        </p>
                        <div className="flex items-center space-x-4 text-sm">
                          <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700">
                            <span>👍</span>
                            <span>Helpful (0)</span>
                          </button>
                          <button className="text-gray-500 hover:text-gray-700">
                            Report
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-gray-200 rounded-lg">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Star className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-black mb-2">
                No reviews yet
              </h3>
              <p className="text-gray-500 mb-4">
                Be the first to review this product and help others make informed decisions.
              </p>
              {!isAuthenticated && (
                <Link
                  href={`/login?redirect=/product/${id}`}
                  className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                >
                  Login to Write Review
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}