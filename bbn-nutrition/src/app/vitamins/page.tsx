'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import { apiService } from '@/utils/api';
import { Product } from '@/types';
import { Heart, Shield, Sparkles } from 'lucide-react';

export default function VitaminsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVitaminProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all products and filter by vitamins category
        const response = await apiService.getProducts({ limit: 100 });
        if (response.success && response.data) {
          const vitaminProducts = response.data
            .filter((product: Product) => 
              product.inStock && 
              (product.category.toLowerCase() === 'vitamins' || 
               product.category.toLowerCase() === 'vitamin' ||
               product.category.toLowerCase().includes('vitamin') ||
               product.category.toLowerCase().includes('multivitamin'))
            )
            .sort((a: Product, b: Product) => b.rating - a.rating);
            
          setProducts(vitaminProducts);
        }
      } catch (error) {
        console.error('Error fetching vitamin products:', error);
        setError('Failed to load vitamin supplements');
      } finally {
        setLoading(false);
      }
    };

    fetchVitaminProducts();
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
          <div className="inline-flex items-center space-x-2 bg-green-50 border border-green-200 px-4 py-2 rounded-full mb-6">
            <Heart className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Health & Wellness</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Vitamin <span className="text-green-600">Supplements</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Support your overall health and wellness with our premium vitamin supplements.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Immune Support</h3>
            <p className="text-gray-600 text-sm">Strengthen your immune system naturally</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <Sparkles className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Energy & Vitality</h3>
            <p className="text-gray-600 text-sm">Boost energy levels and reduce fatigue</p>
          </div>
          <div className="bg-white rounded-lg p-6 text-center shadow-sm">
            <Heart className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Overall Wellness</h3>
            <p className="text-gray-600 text-sm">Support general health and well-being</p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">{products.length}</h3>
              <p className="text-gray-600">Vitamin Products</p>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {products.filter(p => p.featured).length}
              </h3>
              <p className="text-gray-600">Featured Vitamins</p>
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
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Vitamin Supplements Available</h3>
              <p className="text-gray-600">Check back soon for new vitamin products!</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}