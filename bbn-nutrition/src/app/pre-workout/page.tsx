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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header Section */}
      <section className="py-8 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-orange-50 border border-orange-200 px-4 py-2 rounded-full mb-6">
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
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <Zap className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Explosive Energy</h3>
            <p className="text-gray-600 text-sm">Sustained energy boost for intense workouts</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <Target className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Enhanced Focus</h3>
            <p className="text-gray-600 text-sm">Improved mental clarity and concentration</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-purple-600 font-bold text-sm">💪</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Muscle Pump</h3>
            <p className="text-gray-600 text-sm">Increased blood flow and muscle fullness</p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-6 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{products.length}</h3>
              <p className="text-gray-600">Pre-Workout Products</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {products.filter(p => p.featured).length}
              </h3>
              <p className="text-gray-600">Featured Formulas</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {products.filter(p => p.rating >= 4.5).length}
              </h3>
              <p className="text-gray-600">Top Rated</p>
            </div>
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
              <Battery className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Pre-Workout Supplements Available</h3>
              <p className="text-gray-600">Check back soon for new pre-workout products!</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}