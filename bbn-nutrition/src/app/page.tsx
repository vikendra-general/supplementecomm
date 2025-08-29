'use client';

import dynamic from 'next/dynamic'
import { getCategoriesWithDynamicCounts } from '@/utils/categoryUtils'
import { getTopSellerProducts, getFeaturedProducts } from '@/utils/recommendations'
import { Star, ArrowRight, Truck, Shield, Clock, TrendingUp, Zap, Award, Users, CheckCircle, Verified, Lock, RefreshCw, Phone } from 'lucide-react'
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
    className="group bg-white rounded-lg shadow-sm border border-gray-200 p-3 text-center hover:shadow-xl hover:border-green-300 transition-all duration-300 transform hover:-translate-y-1"
  >
    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl mx-auto mb-3 flex items-center justify-center shadow-lg">
      <span className="text-white font-bold text-sm">{category.name.charAt(0)}</span>
    </div>
    <h3 className="font-bold text-gray-900 mb-1 text-sm">{category.name}</h3>
    <p className="text-xs text-gray-600 mb-2 leading-relaxed">{category.description}</p>
    <div className="inline-flex items-center space-x-1 text-green-600 font-medium text-xs">
      <span>{category.productCount} {t('home.products')}</span>
      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
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
  <div className="text-center group bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
    <div className={`w-20 h-20 ${bgColor} rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
      <Icon className={`w-10 h-10 ${iconColor}`} />
    </div>
    <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
    <p className="text-gray-200 leading-relaxed">{description}</p>
  </div>
))

FeatureCard.displayName = 'FeatureCard'

const TestimonialCard = memo(({ testimonial }: { testimonial: { name: string; role: string; content: string; rating: number } }) => (
  <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-8 hover:bg-white/20 transition-all duration-300">
    <div className="flex items-center mb-6">
      {[...Array(testimonial.rating)].map((_, i) => (
        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
      ))}
    </div>
    <p className="text-gray-200 mb-6 text-lg leading-relaxed italic">&ldquo;{testimonial.content}&rdquo;</p>
    <div className="flex items-center space-x-4">
      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
        <span className="text-white font-bold text-lg">{testimonial.name.charAt(0)}</span>
      </div>
      <div>
        <div className="font-bold text-white">{testimonial.name}</div>
        <div className="text-sm text-gray-300">{testimonial.role}</div>
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
      <section className="py-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center space-x-2 bg-green-50 border border-green-200 px-3 py-1 rounded-full mb-4">
              <Zap className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">{t('home.categoriesTitle')}</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-3">{t('home.categoriesTitle')}</h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">{t('home.categoriesSubtitle')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} t={t} />
            ))}
          </div>
         </div>
       </section>



      {/* Top Sellers Section */}
       <section className="py-12 relative bg-cover bg-center bg-no-repeat" style={{backgroundImage: 'url(/images/background.png)'}}>
         <div className="absolute inset-0 bg-black bg-opacity-50"></div>
         <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1 rounded-full mb-4">
              <TrendingUp className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">Trending Now</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-3">Best Sellers</h2>
             <p className="text-base text-gray-200 max-w-2xl mx-auto leading-relaxed">Discover our most popular and highest-rated supplements trusted by thousands</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {topSellerProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
         </div>
         </div>
       </section>

       {/* Features Section */}
       <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-green-50 border border-green-200 px-3 py-1 rounded-full mb-4">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Why Choose Us</span>
            </div>
             <h2 className="text-2xl font-bold text-gray-900 mb-3">Why Choose BBN?</h2>
             <p className="text-base text-gray-600">Quality, reliability, and results you can trust</p>
           </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="text-center group bg-white rounded-lg shadow-lg border border-gray-100 p-3 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className={`w-12 h-12 ${feature.bgColor} rounded-lg mx-auto mb-3 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1.5">{feature.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
         </div>
       </section>

       {/* Certification & Authenticity Section */}
      <section className="py-10 relative bg-cover bg-center bg-no-repeat" style={{backgroundImage: 'url(/images/background.png)'}}>
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1 rounded-full mb-4">
              <Shield className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">Certified & Trusted</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Your Trust, Our Priority</h2>
            <p className="text-base text-gray-200 max-w-2xl mx-auto">Every product is backed by certifications and guarantees that ensure quality and authenticity</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* FDA Approved Facility */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 p-4 text-center hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">FDA Approved</h3>
              <p className="text-xs text-gray-200 mb-2">Manufactured in FDA approved facilities</p>
              <div className="inline-flex items-center text-xs text-green-400 font-medium bg-green-500/20 px-2 py-1 rounded-full">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified
              </div>
            </div>

            {/* Third-Party Tested */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 p-4 text-center hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Third-Party Tested</h3>
              <p className="text-xs text-gray-200 mb-2">Independent lab testing for purity</p>
              <div className="inline-flex items-center text-xs text-purple-400 font-medium bg-purple-500/20 px-2 py-1 rounded-full">
                <Award className="w-3 h-3 mr-1" />
                Certified
              </div>
            </div>

            {/* Money Back Guarantee */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 p-4 text-center hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">30-Day Guarantee</h3>
              <p className="text-xs text-gray-200 mb-2">100% money back if not satisfied</p>
              <div className="inline-flex items-center text-xs text-green-400 font-medium bg-green-500/20 px-2 py-1 rounded-full">
                <RefreshCw className="w-3 h-3 mr-1" />
                Protected
              </div>
            </div>

            {/* Secure Transactions */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 p-4 text-center hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full mx-auto mb-3 flex items-center justify-center">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">Secure Payments</h3>
              <p className="text-xs text-gray-200 mb-2">256-bit SSL encryption protection</p>
              <div className="inline-flex items-center text-xs text-orange-400 font-medium bg-orange-500/20 px-2 py-1 rounded-full">
                <Lock className="w-3 h-3 mr-1" />
                Encrypted
              </div>
            </div>
          </div>

          {/* Additional Trust Indicators */}
          
        </div>
        </div>
      </section>

      {/* Testimonials */}
       <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full mb-4">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Customer Reviews</span>
            </div>
             <h2 className="text-2xl font-bold text-gray-900 mb-3">What Our Customers Say</h2>
             <p className="text-base text-gray-600">Real results from real people</p>
           </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg border border-gray-100 p-4 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-3 text-xs leading-relaxed italic">&ldquo;{testimonial.content}&rdquo;</p>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs">{testimonial.name.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-xs">{testimonial.name}</div>
                    <div className="text-xs text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
         </div>
       </section>

       {/* CTA Section */}
      <section className="py-10 relative bg-cover bg-center bg-no-repeat" style={{backgroundImage: 'url(/images/background.png)'}}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to Transform Your Performance?</h2>
          <p className="text-base text-gray-200 mb-6">Join thousands of athletes who trust BBN for their supplement needs</p>
          <Link 
            href="/shop" 
            className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-lg hover:bg-white/20 transition-all duration-300"
          >
            Start Shopping
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
        </div>
      </section>
    </div>
  )
}
