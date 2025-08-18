'use client';

import Link from 'next/link';
import { ArrowRight, Star, Play, ShoppingBag, Zap, CheckCircle, Shield, Truck } from 'lucide-react';
import { useState } from 'react';

export default function Hero() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  return (
    <section className="relative bg-gradient-to-br from-gray-50 via-white to-gray-100 overflow-hidden">
      {/* Modern Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 bg-green-50 border border-green-200 px-4 py-2 rounded-full">
                <Zap className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Premium Quality Supplements</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight text-gray-900">
                Fuel Your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600">
                  Performance
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Discover premium supplements designed for athletes and fitness enthusiasts. 
                Quality ingredients, proven results, and unbeatable performance.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/shop" 
                className="inline-flex items-center justify-center px-8 py-4 energetic-cta rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Shop Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <button 
                onClick={() => setIsVideoPlaying(true)}
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl border-2 border-gray-200 hover:border-green-300 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-6 pt-4">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
                <span className="ml-2 text-sm text-gray-600 font-medium">4.9/5 from 2,500+ reviews</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">10K+</div>
                <div className="text-sm text-gray-600 font-medium">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">50+</div>
                <div className="text-sm text-gray-600 font-medium">Premium Products</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">99%</div>
                <div className="text-sm text-gray-600 font-medium">Satisfaction Rate</div>
              </div>
            </div>
          </div>

          {/* Hero Image/Visual */}
          <div className="relative">
            <div className="relative z-10">
              {/* Product Showcase */}
              <div className="bg-white rounded-2xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="aspect-square bg-gradient-to-br from-green-100 to-blue-100 rounded-xl mb-6 flex items-center justify-center">
                  <div className="w-32 h-32 bg-green-600 rounded-full flex items-center justify-center">
                    <Zap className="w-16 h-16 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">BBN Whey Protein</h3>
                <p className="text-gray-600 mb-4">Premium quality protein for muscle growth</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-600">₹2,999</span>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute top-4 right-4 bg-white rounded-full p-3 shadow-lg animate-bounce">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="absolute bottom-4 left-4 bg-white rounded-full p-3 shadow-lg animate-bounce" style={{animationDelay: '1s'}}>
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-8 mt-16 pt-8 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <Truck className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-600 font-medium">Free Shipping</span>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600 font-medium">30-Day Returns</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-gray-600 font-medium">Quality Guaranteed</span>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="text-sm text-gray-600 font-medium">Premium Support</span>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {isVideoPlaying && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setIsVideoPlaying(false)}>
          <div className="bg-white rounded-lg p-4 max-w-4xl w-full mx-4">
            <div className="aspect-video bg-gray-200 rounded flex items-center justify-center">
              <p className="text-gray-600">Video Player Placeholder</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}