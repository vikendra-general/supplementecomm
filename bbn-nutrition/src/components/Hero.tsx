'use client';

import Link from 'next/link';
import { ArrowRight, Star, Play, ShoppingBag, Zap, CheckCircle, Shield, Truck } from 'lucide-react';
import { useState } from 'react';

export default function Hero() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  return (
    <section className="relative overflow-hidden min-h-screen">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/Videos/_video__202508281216.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        {/* Video Overlay */}
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent-blue/20"></div>
      </div>

      {/* Modern Background Elements (now over video) */}
      <div className="absolute inset-0 z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-accent-blue/10 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-accent-orange/10 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>
      
      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 lg:pt-24 lg:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 px-5 py-2.5 rounded-full">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Premium Quality Supplements</span>
              </div>
              
              <h1 className="text-3xl lg:text-5xl font-bold leading-tight text-white">
                Fuel Your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent-blue">
                  Performance
                </span>
              </h1>
              
              <p className="text-lg text-gray-100 leading-relaxed max-w-lg">
                Discover premium supplements designed for athletes and fitness enthusiasts. 
                Quality ingredients, proven results, and unbeatable performance.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/shop" 
                className="inline-flex items-center justify-center px-6 py-3 bg-white/20 backdrop-blur-md border border-white/30 hover:bg-white/30 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:border-white/50"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Shop Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <button 
                onClick={() => setIsVideoPlaying(true)}
                className="inline-flex items-center justify-center px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:border-white/40"
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
                <span className="ml-2 text-sm text-gray-200 font-medium">4.9/5 from 2,500+ reviews</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-300/30">
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

          {/* Empty space to maintain layout */}
          <div className="relative">
            {/* Content removed but div kept to maintain grid layout */}
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-8 mt-16 pt-8 border-t border-white/20">
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 hover:bg-white/15 transition-all duration-300">
            <Truck className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-200 font-medium">Free Shipping</span>
          </div>
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 hover:bg-white/15 transition-all duration-300">
            <Shield className="w-5 h-5 text-blue-400" />
            <span className="text-sm text-gray-200 font-medium">30-Day Returns</span>
          </div>
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 hover:bg-white/15 transition-all duration-300">
            <CheckCircle className="w-5 h-5 text-purple-400" />
            <span className="text-sm text-gray-200 font-medium">Quality Guaranteed</span>
          </div>
          <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 hover:bg-white/15 transition-all duration-300">
            <Star className="w-5 h-5 text-yellow-400" />
            <span className="text-sm text-gray-200 font-medium">Premium Support</span>
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