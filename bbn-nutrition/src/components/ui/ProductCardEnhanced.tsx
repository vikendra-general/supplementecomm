'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart, Heart, Eye } from 'lucide-react';
import { memo, useState } from 'react';

interface ProductProps {
  product: {
    id: string;
    name: string;
    brand: string;
    price: number;
    originalPrice?: number;
    rating: number;
    reviewCount: number;
    image: string;
    badge?: string;
    inStock: boolean;
    slug: string;
  };
}

const ProductCardEnhanced = memo(({ product }: ProductProps) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="product-card-nutrabay group">
      {/* Product Image Container */}
      <div className="product-image-container">
        <Link href={`/products/${product.slug}`}>
          <Image
            src={product.image}
            alt={product.name}
            width={280}
            height={280}
            className="product-image"
          />
        </Link>
        
        {/* Badges */}
        <div className="product-badges">
          {product.badge && (
            <span className="product-badge product-badge-primary">
              {product.badge}
            </span>
          )}
          {discountPercentage > 0 && (
            <span className="product-badge product-badge-discount">
              {discountPercentage}% OFF
            </span>
          )}
          {!product.inStock && (
            <span className="product-badge product-badge-out-of-stock">
              Out of Stock
            </span>
          )}
        </div>
        
        {/* Quick Actions */}
        <div className="product-quick-actions">
          <button
            onClick={() => setIsWishlisted(!isWishlisted)}
            className={`quick-action-btn ${
              isWishlisted ? 'text-red-500' : 'text-nutrabay-text-muted'
            }`}
            aria-label="Add to wishlist"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
          <Link href={`/products/${product.slug}`} className="quick-action-btn">
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      </div>
      
      {/* Product Info */}
      <div className="product-info">
        {/* Brand */}
        <p className="product-brand">{product.brand}</p>
        
        {/* Product Name */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="product-name">{product.name}</h3>
        </Link>
        
        {/* Rating */}
        <div className="product-rating">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < Math.floor(product.rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
            <span className="ml-1 text-xs text-nutrabay-text-muted">
              ({product.reviewCount})
            </span>
          </div>
        </div>
        
        {/* Price */}
        <div className="product-pricing">
          <span className="product-price">₹{product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <span className="product-original-price">
              ₹{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
        
        {/* Add to Cart Button */}
        <button
          className="product-cta-button"
          disabled={!product.inStock}
        >
          <ShoppingCart className="w-4 h-4" />
          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
      
      {/* Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-nutrabay-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-lg pointer-events-none" />
    </div>
  );
});

ProductCardEnhanced.displayName = 'ProductCardEnhanced';

export default ProductCardEnhanced;