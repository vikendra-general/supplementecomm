'use client';

import Link from 'next/link';
import { ArrowRight, Star, Play, ShoppingBag, Zap, CheckCircle, Shield, Truck } from 'lucide-react';
import { useState } from 'react';

export default function Hero() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black hero-section" data-hero>
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
        {/* Enhanced overlay with gradient for better visual appeal */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 bg-green-500/20 border border-green-400/30 px-4 py-2 rounded-full backdrop-blur-sm">
                <Zap className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-green-300">#1 Trusted Supplement Store</span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                <span className="text-gray-100 drop-shadow-2xl">
                  Transform Your Body,
                </span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400">
                  Elevate Your Life
                </span>
              </h1>
              
              <p className="text-xl text-gray-200 leading-relaxed max-w-2xl">
                Unlock your potential with scientifically-backed supplements trusted by over 10,000+ athletes worldwide. 
                <span className="text-green-300 font-semibold">Premium quality, proven results, uncompromising purity.</span>
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link 
                href="/shop" 
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105 text-base group"
              >
                <ShoppingBag className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              <button 
                onClick={() => setIsVideoPlaying(true)}
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border-2 border-white/20 hover:border-white/40 hover:bg-white/20 transition-all duration-300 shadow-lg hover:shadow-xl text-base group"
              >
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
                See Results
              </button>
            </div>

            {/* Enhanced Trust Indicators */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-6 pt-4">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
                <span className="ml-2 text-sm text-gray-200 font-medium">4.9/5 from 2,500+ verified reviews</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-300 font-medium">Lab-Tested & Certified</span>
              </div>
            </div>

            {/* Enhanced Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-600/50">
              <div className="text-center group">
                <div className="text-3xl font-bold text-white group-hover:text-green-400 transition-colors duration-300">10K+</div>
                <div className="text-sm text-gray-300 font-medium">Satisfied Athletes</div>
                <div className="text-xs text-gray-400 mt-1">Worldwide</div>
              </div>
              <div className="text-center group">
                <div className="text-3xl font-bold text-white group-hover:text-green-400 transition-colors duration-300">100+</div>
                <div className="text-sm text-gray-300 font-medium">Premium Products</div>
                <div className="text-xs text-gray-400 mt-1">Lab-Tested</div>
              </div>
              <div className="text-center group">
                <div className="text-3xl font-bold text-white group-hover:text-green-400 transition-colors duration-300">99.8%</div>
                <div className="text-sm text-gray-300 font-medium">Success Rate</div>
                <div className="text-xs text-gray-400 mt-1">Customer Goals</div>
              </div>
            </div>
          </div>


        </div>

        {/* Enhanced Trust Badges */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12 pt-8 border-t border-gray-600/50">
          <div className="flex items-center space-x-3 bg-white/5 backdrop-blur-sm rounded-lg p-3 hover:bg-white/10 transition-colors duration-300">
            <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
              <Truck className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Free Shipping</div>
              <div className="text-xs text-gray-400">Orders above ₹999</div>
            </div>
          </div>
          <div className="flex items-center space-x-3 bg-white/5 backdrop-blur-sm rounded-lg p-3 hover:bg-white/10 transition-colors duration-300">
            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Shield className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Money Back</div>
              <div className="text-xs text-gray-400">30-Day Guarantee</div>
            </div>
          </div>
          <div className="flex items-center space-x-3 bg-white/5 backdrop-blur-sm rounded-lg p-3 hover:bg-white/10 transition-colors duration-300">
            <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-purple-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Lab Certified</div>
              <div className="text-xs text-gray-400">Third-Party Tested</div>
            </div>
          </div>
          <div className="flex items-center space-x-3 bg-white/5 backdrop-blur-sm rounded-lg p-3 hover:bg-white/10 transition-colors duration-300">
            <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <Star className="w-4 h-4 text-yellow-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Expert Support</div>
              <div className="text-xs text-gray-400">24/7 Available</div>
            </div>
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