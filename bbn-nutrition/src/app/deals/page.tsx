'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import { apiService } from '@/utils/api';
import { Product } from '@/types';
import { Tag, Clock, Zap, TrendingDown } from 'lucide-react';

export default function DealsPage() {
  const [dealsProducts, setDealsProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDealsProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch products that are marked as today's deals
        const response = await apiService.getProducts({ limit: 100 });
        if (response.success && response.data) {
          // Filter products that have todaysDeals flag or have discount > 0
          const deals = response.data.filter((product: Product & { todaysDeals?: boolean }) => 
            product.todaysDeals || 
            (product.originalPrice && product.originalPrice > product.price)
          );
          setDealsProducts(deals);
        }
      } catch (error) {
        console.error('Error fetching deals:', error);
        setError('Failed to load deals');
      } finally {
        setLoading(false);
      }
    };

    fetchDealsProducts();
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
          <div className="inline-flex items-center space-x-2 bg-red-50 border border-red-200 px-4 py-2 rounded-full mb-6">
            <Tag className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">Limited Time Offers</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Today&apos;s <span className="text-red-600">Deals</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Don&apos;t miss out on these amazing discounts! Limited time offers on your favorite supplements.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Active Deals</p>
                <p className="text-2xl font-bold text-gray-900">{dealsProducts.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Time Left</p>
                <p className="text-2xl font-bold text-gray-900">24h</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">Max Savings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {dealsProducts.length > 0 ? 
                    Math.max(...dealsProducts.map(p => 
                      p.originalPrice ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) : 0
                    )) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {error ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Tag className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Deals</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        ) : dealsProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Tag className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Deals Available</h3>
            <p className="text-gray-600 mb-4">Check back later for amazing deals and discounts!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {dealsProducts.map((product) => (
              <div key={product.id} className="relative">
                <ProductCard product={product} />
                {/* Deal Badge */}
                {product.originalPrice && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}