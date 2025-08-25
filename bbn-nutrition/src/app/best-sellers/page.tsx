'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import { apiService } from '@/utils/api';
import { Product } from '@/types';
import { Trophy, TrendingUp } from 'lucide-react';

export default function BestSellersPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all products and sort by best sellers criteria
        const response = await apiService.getProducts({ limit: 100 });
        if (response.success && response.data) {
          // Sort by: 1) bestSeller flag, 2) rating, 3) review count
          const bestSellers = response.data
            .filter((product: Product) => product.inStock)
            .sort((a: Product, b: Product) => {
              // Prioritize manually marked best sellers
              if (a.bestSeller && !b.bestSeller) return -1;
              if (!a.bestSeller && b.bestSeller) return 1;
              
              // Then sort by rating (minimum 4.0 to be considered)
              if (b.rating !== a.rating) {
                return b.rating - a.rating;
              }
              
              // Then by review count
              return (b.reviews || 0) - (a.reviews || 0);
            })
            .filter((product: Product) => product.bestSeller || product.rating >= 4.0);
            
          setProducts(bestSellers);
        }
      } catch (error) {
        console.error('Error fetching best sellers:', error);
        setError('Failed to load best sellers');
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellers();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-yellow-50 border border-yellow-200 px-4 py-2 rounded-full mb-6">
            <Trophy className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Top Rated Products</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Best <span className="text-yellow-600">Sellers</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Discover our most popular supplements trusted by thousands of customers worldwide.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">{products.length}</h3>
            <p className="text-gray-600">Best Selling Products</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">
              {products.filter(p => p.rating >= 4.5).length}
            </h3>
            <p className="text-gray-600">4.5+ Star Rated</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-blue-600 font-bold">✓</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {products.filter(p => p.inStock).length}
            </h3>
            <p className="text-gray-600">In Stock</p>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          !loading && !error && (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Best Sellers Yet</h3>
              <p className="text-gray-600">Check back soon for our top-rated products!</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}