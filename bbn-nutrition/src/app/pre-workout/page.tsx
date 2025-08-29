'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import { apiService } from '@/utils/api';
import { Product } from '@/types';
import { Zap, Battery, Target } from 'lucide-react';

export default function PreWorkoutPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPreWorkoutProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all products and filter by pre-workout category
        const response = await apiService.getProducts({ limit: 100 });
        if (response.success && response.data) {
          const preWorkoutProducts = response.data
            .filter((product: Product) => 
              product.inStock && 
              (product.category.toLowerCase() === 'pre-workout' || 
               product.category.toLowerCase() === 'pre workout' ||
               product.category.toLowerCase().includes('pre-workout') ||
               product.category.toLowerCase().includes('preworkout'))
            )
            .sort((a: Product, b: Product) => b.rating - a.rating);
            
          setProducts(preWorkoutProducts);
        }
      } catch (error) {
        console.error('Error fetching pre-workout products:', error);
        setError('Failed to load pre-workout supplements');
      } finally {
        setLoading(false);
      }
    };

    fetchPreWorkoutProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-2 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full mb-3">
            <Battery className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-800">Energy & Performance</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
            Pre-Workout <span className="text-orange-600">Supplements</span>
          </h1>
          <p className="text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Maximize your workout performance with our powerful pre-workout formulas.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <Zap className="w-6 h-6 text-orange-600 mx-auto mb-2" />
            <h3 className="text-base font-semibold text-gray-900 mb-2">Explosive Energy</h3>
            <p className="text-gray-600 text-xs">Sustained energy boost for intense workouts</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <Target className="w-6 h-6 text-red-600 mx-auto mb-2" />
            <h3 className="text-base font-semibold text-gray-900 mb-2">Enhanced Focus</h3>
            <p className="text-gray-600 text-xs">Improved mental clarity and concentration</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow-sm">
            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-purple-600 font-bold text-xs">💪</span>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">Muscle Pump</h3>
            <p className="text-gray-600 text-xs">Increased blood flow and muscle fullness</p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{products.length}</h3>
              <p className="text-gray-600 text-sm">Pre-Workout Products</p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {products.filter(p => p.featured).length}
              </h3>
              <p className="text-gray-600 text-sm">Featured Formulas</p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {products.filter(p => p.rating >= 4.5).length}
              </h3>
              <p className="text-gray-600 text-sm">Top Rated</p>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          !loading && !error && (
            <div className="text-center py-8">
              <Battery className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-900 mb-2">No Pre-Workout Supplements Available</h3>
              <p className="text-gray-600">Check back soon for new pre-workout products!</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}