'use client';

import dynamic from 'next/dynamic'
import { getCategoriesWithDynamicCounts } from '@/utils/categoryUtils'
import { getTopSellerProducts, getFeaturedProducts } from '@/utils/recommendations'
import { Star, ArrowRight, Truck, Shield, Clock, TrendingUp, Zap, Award, Users, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { memo, useState, useEffect } from 'react'
import { Product, Category } from '@/types'
import { useLanguage } from '@/contexts/LanguageContext'

// Lazy load components for better performance
const Hero = dynamic(() => import('@/components/Hero'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse" />
})

const ProductCard = dynamic(() => import('@/components/ProductCard'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
})

// Memoized components for better performance
const CategoryCard = memo(({ category, t }: { category: { id: string; name: string; description: string; productCount: number }, t: (key: string) => string }) => (
  <Link 
    href={`/shop?category=${category.name.toLowerCase()}`}
    className="group bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center hover:shadow-xl hover:border-green-300 transition-all duration-300 transform hover:-translate-y-2"
  >
    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
      <span className="text-white font-bold text-2xl">{category.name.charAt(0)}</span>
    </div>
    <h3 className="font-bold text-gray-900 mb-3 text-lg">{category.name}</h3>
    <p className="text-sm text-gray-600 mb-4 leading-relaxed">{category.description}</p>
    <div className="inline-flex items-center space-x-2 text-green-600 font-medium text-sm">
      <span>{category.productCount} {t('home.products')}</span>
      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
    </div>
  </Link>
))

CategoryCard.displayName = 'CategoryCard'

const FeatureCard = memo(({ icon: Icon, title, description, bgColor, iconColor }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  bgColor: string;
  iconColor: string;
}) => (
  <div className="text-center group">
    <div className={`w-20 h-20 ${bgColor} rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
      <Icon className={`w-10 h-10 ${iconColor}`} />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
))

FeatureCard.displayName = 'FeatureCard'

const TestimonialCard = memo(({ testimonial }: { testimonial: { name: string; role: string; content: string; rating: number } }) => (
  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300">
    <div className="flex items-center mb-6">
      {[...Array(testimonial.rating)].map((_, i) => (
        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
      ))}
    </div>
    <p className="text-gray-700 mb-6 text-lg leading-relaxed italic">&ldquo;{testimonial.content}&rdquo;</p>
    <div className="flex items-center space-x-4">
      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
        <span className="text-white font-bold text-lg">{testimonial.name.charAt(0)}</span>
      </div>
      <div>
        <div className="font-bold text-gray-900">{testimonial.name}</div>
        <div className="text-sm text-gray-500">{testimonial.role}</div>
      </div>
    </div>
  </div>
))

TestimonialCard.displayName = 'TestimonialCard'

export default function HomePage() {
  const { t } = useLanguage();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [topSellerProducts, setTopSellerProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const [featured, topSellers] = await Promise.all([
          getFeaturedProducts(4),
          getTopSellerProducts(4)
        ]);
        setFeaturedProducts(featured);
        setTopSellerProducts(topSellers);
        
        // Get categories with dynamic product counts
        const dynamicCategories = getCategoriesWithDynamicCounts();
        setCategories(dynamicCategories);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Fitness Trainer",
      content: "BBN's whey protein has been a game-changer for my clients. The quality is unmatched and the results speak for themselves.",
      rating: 5
    },
    {
      name: "Mike Chen",
      role: "Bodybuilder",
      content: "I've tried many pre-workouts, but BBN's formula gives me the perfect energy boost without the crash. Highly recommended!",
      rating: 5
    },
    {
      name: "Emma Davis",
      role: "Yoga Instructor",
      content: "The multivitamin from BBN has improved my overall energy levels and recovery. Great quality and fast shipping!",
      rating: 5
    }
  ]

  const features = [
    {
      icon: Shield,
      title: "Quality Guaranteed",
      description: "All our products are tested for purity and potency",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      icon: Truck,
      title: "Free Shipping",
      description: "Free shipping on orders over $50",
      bgColor: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      icon: Clock,
      title: "Fast Delivery",
      description: "Get your supplements in 2-3 business days",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600"
    }
  ]

  return (
    <div>
      {/* Hero Section */}
      <Hero />

      {/* Categories Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-green-50 border border-green-200 px-4 py-2 rounded-full mb-6">
              <Zap className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">{t('home.categoriesTitle')}</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">{t('home.categoriesTitle')}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">{t('home.categoriesSubtitle')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} t={t} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 px-4 py-2 rounded-full mb-6">
              <Star className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">{t('home.featuredTitle')}</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">{t('home.featuredTitle')}</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">{t('home.featuredSubtitle')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link 
              href="/shop" 
              className="inline-flex items-center justify-center px-8 py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              View All Products
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Top Sellers Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-green-50 border border-green-200 px-4 py-2 rounded-full mb-6">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Trending Now</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">Top Sellers</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">Most popular products chosen by our fitness community</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {topSellerProducts.map((product, index) => (
              <div key={product.id} className="relative">
                <ProductCard product={product} />
                <div className="absolute -top-3 -left-3 bg-gradient-to-r from-green-500 to-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  🔥 Best Seller
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose BBN?</h2>
            <p className="text-lg text-gray-600">Quality, reliability, and results you can trust</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-lg text-gray-600">Real results from real people</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-dark-green to-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Performance?</h2>
          <p className="text-xl text-green-100 mb-8">Join thousands of athletes who trust BBN for their supplement needs</p>
          <Link 
            href="/shop" 
            className="inline-flex items-center px-8 py-4 bg-white text-dark-green font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Start Shopping
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
