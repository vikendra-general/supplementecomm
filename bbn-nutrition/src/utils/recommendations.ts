import { Product } from '@/types';
import { apiService } from './api';

/**
 * Get top selling products based on various criteria
 */
export const getTopSellerProducts = async (limit: number = 4): Promise<Product[]> => {
  try {
    const response = await apiService.getProducts({ limit: 100 });
    if (response.success && response.data) {
      return response.data
        .filter(product => product.inStock)
        .sort((a, b) => {
          // Prioritize manually marked best sellers, then sort by rating and reviews
          if (a.bestSeller && !b.bestSeller) return -1;
          if (!a.bestSeller && b.bestSeller) return 1;
          
          // Sort by rating first (minimum 4.0 rating to be considered top seller)
          if (b.rating !== a.rating) {
            return b.rating - a.rating;
          }
          // Then by number of reviews
          return b.reviews - a.reviews;
        })
        .filter(product => product.bestSeller || product.rating >= 4.0)
        .slice(0, limit);
    }
    return [];
  } catch (error) {
    console.error('Error fetching top seller products:', error);
    return [];
  }
};

/**
 * Get recommended products based on a given product
 */
export const getRecommendedProducts = async (currentProduct: Product, limit: number = 4): Promise<Product[]> => {
  try {
    const response = await apiService.getProducts({ limit: 100 });
    if (response.success && response.data) {
      return response.data
        .filter(product => 
          product.id !== currentProduct.id && 
          product.inStock &&
          (product.category === currentProduct.category || 
           product.brand === currentProduct.brand ||
           product.tags.some(tag => currentProduct.tags.includes(tag)))
        )
        .sort((a, b) => {
          // Prioritize same category, then same brand, then rating
          const aScore = (a.category === currentProduct.category ? 3 : 0) +
                        (a.brand === currentProduct.brand ? 2 : 0) +
                        (a.rating / 5);
          const bScore = (b.category === currentProduct.category ? 3 : 0) +
                        (b.brand === currentProduct.brand ? 2 : 0) +
                        (b.rating / 5);
          return bScore - aScore;
        })
        .slice(0, limit);
    }
    return [];
  } catch (error) {
    console.error('Error fetching recommended products:', error);
    return [];
  }
};

/**
 * Get trending products based on high ratings and reviews
 */
export const getTrendingProducts = async (limit: number = 6): Promise<Product[]> => {
  try {
    const response = await apiService.getProducts({ limit: 100 });
    if (response.success && response.data) {
      return response.data
        .filter(product => product.inStock && product.rating >= 4.0)
        .sort((a, b) => {
          // Calculate trending score based on rating and review count
          const aTrendingScore = a.rating * Math.log(a.reviews + 1);
          const bTrendingScore = b.rating * Math.log(b.reviews + 1);
          return bTrendingScore - aTrendingScore;
        })
        .slice(0, limit);
    }
    return [];
  } catch (error) {
    console.error('Error fetching trending products:', error);
    return [];
  }
};

/**
 * Get products by category with recommendations
 */
export const getProductsByCategory = async (category: string, limit?: number): Promise<Product[]> => {
  try {
    const response = await apiService.getProducts({ limit: 100 });
    if (response.success && response.data) {
      const categoryProducts = response.data
        .filter(product => product.category === category && product.inStock)
        .sort((a, b) => b.rating - a.rating);
      
      return limit ? categoryProducts.slice(0, limit) : categoryProducts;
    }
    return [];
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
};

/**
 * Get featured products for homepage
 */
export const getFeaturedProducts = async (limit: number = 4): Promise<Product[]> => {
  try {
    const response = await apiService.getProducts({ limit: 100 });
    if (response.success && response.data) {
      return response.data
        .filter(product => product.featured && product.inStock)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, limit);
    }
    return [];
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
};

/**
 * Search products with advanced filtering
 */
export const searchProducts = async (query: string, filters?: {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  bestSeller?: boolean;
}): Promise<Product[]> => {
  try {
    const response = await apiService.getProducts({ limit: 100 });
    if (response.success && response.data) {
      let filteredProducts = response.data;

      // Text search
      if (query) {
        const searchTerm = query.toLowerCase();
        filteredProducts = filteredProducts.filter(product =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm) ||
          product.category.toLowerCase().includes(searchTerm) ||
          product.brand.toLowerCase().includes(searchTerm) ||
          product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }

      // Apply filters
      if (filters) {
        if (filters.category) {
          filteredProducts = filteredProducts.filter(p => p.category === filters.category);
        }
        if (filters.brand) {
          filteredProducts = filteredProducts.filter(p => p.brand === filters.brand);
        }
        if (filters.minPrice !== undefined) {
          filteredProducts = filteredProducts.filter(p => p.price >= filters.minPrice!);
        }
        if (filters.maxPrice !== undefined) {
          filteredProducts = filteredProducts.filter(p => p.price <= filters.maxPrice!);
        }
        if (filters.inStock !== undefined) {
          filteredProducts = filteredProducts.filter(p => p.inStock === filters.inStock);
        }
        if (filters.featured !== undefined) {
          filteredProducts = filteredProducts.filter(p => p.featured === filters.featured);
        }
        if (filters.bestSeller !== undefined) {
          filteredProducts = filteredProducts.filter(p => p.bestSeller === filters.bestSeller);
        }
      }

      return filteredProducts.sort((a, b) => b.rating - a.rating);
    }
    return [];
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};