'use client';

import Link from 'next/link';
import { ArrowRight, Star, Play, ShoppingBag, Zap, CheckCircle, Shield, Truck } from 'lucide-react';
import { useState } from 'react';

export default function Hero() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Video Background */}
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          onError={(e) => {
            // Hide video on error and show gradient background
            e.currentTarget.style.display = 'none';
          }}
        >
          <source src="/videos/_video__202508281216.mp4" type="video/mp4" />
        </video>
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 bg-green-50 border border-green-200 px-4 py-2 rounded-full">
                <Zap className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Premium Quality Supplements</span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight text-white">
                Fuel Your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
                  Performance
                </span>
              </h1>
              
              <p className="text-lg text-gray-200 leading-relaxed max-w-lg">
                Discover premium supplements designed for athletes and fitness enthusiasts. 
                Quality ingredients, proven results, and unbeatable performance.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link 
                href="/shop" 
                className="inline-flex items-center justify-center px-6 py-3 energetic-cta rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm font-semibold"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Shop Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <button 
                onClick={() => setIsVideoPlaying(true)}
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg border-2 border-gray-200 hover:border-green-300 transition-all duration-200 shadow-md hover:shadow-lg text-sm"
              >
                <Play className="w-4 h-4 mr-2" />
                Watch Demo
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-4 pt-3">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
                <span className="ml-2 text-sm text-gray-200 font-medium">4.9/5 from 2,500+ reviews</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-300">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">10K+</div>
                <div className="text-xs text-gray-200 font-medium">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">50+</div>
                <div className="text-xs text-gray-200 font-medium">Premium Products</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">99%</div>
                <div className="text-xs text-gray-200 font-medium">Satisfaction Rate</div>
              </div>
            </div>
          </div>


        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-10 pt-6 border-t border-gray-300">
          <div className="flex items-center space-x-2">
            <Truck className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-200 font-medium">Free Shipping</span>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-200 font-medium">30-Day Returns</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-200 font-medium">Quality Guaranteed</span>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-gray-200 font-medium">Premium Support</span>
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