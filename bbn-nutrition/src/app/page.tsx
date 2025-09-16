'use client';

import dynamic from 'next/dynamic'
import { getCategoriesWithDynamicCounts } from '@/utils/categoryUtils'
import { getTopSellerProducts, getFeaturedProducts } from '@/utils/recommendations'
import { Star, ArrowRight, Truck, Shield, Clock, TrendingUp, Zap, Award, Users, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { memo, useState, useEffect } from 'react'
import { Product, Category } from '@/types'
import { useLanguage } from '@/contexts/LanguageContext'

// Lazy load components for better performance
const Hero = dynamic(() => import('@/components/Hero'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse" />
})

const ProductCard = dynamic(() => import('@/components/ProductCard'), {
  loading: () => <div className="h-56 bg-gray-100 animate-pulse rounded-lg" />
})

// Memoized components for better performance
const CategoryCard = memo(({ category, t }: { category: { id: string; name: string; description: string; productCount: number; image: string }, t: (key: string) => string }) => (
  <Link 
    href={`/shop?category=${category.name.toLowerCase()}`}
    className="group bg-white rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
  >
    <div className="aspect-square overflow-hidden bg-gray-50">
      <Image
        src={category.image || '/images/categories/placeholder.svg'}
        alt={category.name}
        width={150}
        height={150}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
    </div>
    <div className="p-2 text-center">
      <h3 className="font-semibold text-gray-900 text-xs">{category.name}</h3>
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
    <div className={`w-12 h-12 ${bgColor} rounded-xl mx-auto mb-3 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300`}>
      <Icon className={`w-6 h-6 ${iconColor}`} />
    </div>
    <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-xs text-gray-600 leading-relaxed">{description}</p>
  </div>
))

FeatureCard.displayName = 'FeatureCard'

const TestimonialCard = memo(({ testimonial }: { testimonial: { name: string; role: string; content: string; rating: number; image: string; verified: boolean } }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
    <div className="flex items-center mb-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
          <Image
            src={testimonial.image}
            alt={testimonial.name}
            width={64}
            height={64}
            className="object-cover w-full h-full"
          />
        </div>
        {testimonial.verified && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-semibold text-gray-900 text-sm">{testimonial.name}</h4>
          {testimonial.verified && (
            <span className="text-xs text-green-600 font-medium">✓ Verified customer</span>
          )}
        </div>
        <p className="text-xs text-gray-500 mb-2">{testimonial.role}</p>
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-4 h-4 ${i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
          ))}
        </div>
      </div>
    </div>
    <p className="text-sm text-gray-700 leading-relaxed">&ldquo;{testimonial.content}&rdquo;</p>
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
      name: "Yatharth",
      role: "Gold medalist - Natural Bodybuilding",
      content: "I recently made a big purchase from Nutrabay.com and I have to say, I'm impressed with the genuine products and fast service. I feel confident in my purchase and will definitely be ordering from Nutrabay again.",
      rating: 5,
      image: "/images/testimonials/yatharth.jpg",
      verified: true
    },
    {
      name: "Pratik Gupta",
      role: "International Medalist in Rowing",
      content: "Nutrabay sells genuine products, I have been a part of nutrabay family for almost 2.5 years now and from starting to now it has never disappointed me, be it product quality or delivery time or discounts offered it just gets me back each month for my stack.",
      rating: 5,
      image: "/images/testimonials/pratik.jpg",
      verified: true
    },
    {
      name: "Monika Lamba",
      role: "Fitness Influencer",
      content: "I have been using Nutrabay.com for several months now, and I'm always blown away by how fast their shipping is. I never have to worry about waiting weeks for my supplements to arrive.",
      rating: 5,
      image: "/images/testimonials/monika.jpg",
      verified: true
    },
    {
      name: "Sarah Johnson",
      role: "Fitness Trainer",
      content: "BBN's whey protein has been a game-changer for my clients. The quality is unmatched and the results speak for themselves. I've seen incredible transformations in just a few months.",
      rating: 5,
      image: "/images/testimonials/sarah.jpg",
      verified: true
    },
    {
      name: "Mike Chen",
      role: "Professional Bodybuilder",
      content: "I've tried many pre-workouts, but BBN's formula gives me the perfect energy boost without the crash. The taste is amazing and it mixes perfectly. Highly recommended for serious athletes!",
      rating: 5,
      image: "/images/testimonials/mike.jpg",
      verified: true
    },
    {
      name: "Emma Davis",
      role: "Certified Nutritionist",
      content: "The multivitamin from BBN has improved my overall energy levels and recovery. As a nutritionist, I appreciate the transparency in ingredients and the third-party testing. Great quality and fast shipping!",
      rating: 5,
      image: "/images/testimonials/emma.jpg",
      verified: true
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
      description: "Free shipping on orders over ₹3500",
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
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Categories</h2>
          </div>
          
          <div className="grid grid-cols-4 gap-3">
            {categories.slice(0, 8).map((category) => (
              <CategoryCard key={category.id} category={category} t={t} />
            ))}
          </div>
        </div>
      </section>

      {/* P1 & P2 Videos Section */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">Product Showcase</h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">Discover our premium supplements in action</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg">
              <video 
                className="w-full h-full object-cover"
                autoPlay 
                muted 
                loop 
                playsInline
              >
                <source src="/videos/P1.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg">
              <video 
                className="w-full h-full object-cover"
                autoPlay 
                muted 
                loop 
                playsInline
              >
                <source src="/videos/P2.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-8 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 px-4 py-2 rounded-full mb-6">
              <Star className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">{t('home.featuredTitle')}</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">{t('home.featuredTitle')}</h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">{t('home.featuredSubtitle')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="text-center mt-6">
            <Link 
              href="/shop" 
              className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              View All Products
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Shadow Video Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="relative">
          <video 
            className="w-full h-full object-cover"
            autoPlay 
            muted 
            loop 
            playsInline
            style={{ minHeight: '400px' }}
          >
            <source src="/videos/Shadow video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
             <div className="text-center text-white">
               <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-4">
                 Experience the
                 <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400">
                   Difference
                 </span>
               </h1>
               <p className="text-lg text-gray-200 leading-relaxed max-w-lg mx-auto">Premium quality supplements for peak performance</p>
             </div>
           </div>
        </div>
      </section>

      {/* Top Sellers Section */}
      <section className="py-8 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-green-50 border border-green-200 px-4 py-2 rounded-full mb-6">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Trending Now</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">Top Sellers</h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">Most popular products chosen by our fitness community</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {topSellerProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Why Choose BBN?</h2>
            <p className="text-sm text-gray-600">Quality, reliability, and results you can trust</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 px-4 py-2 rounded-full mb-6">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Customer Reviews</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-3">What customers say</h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">Real testimonials from our satisfied customers who have transformed their fitness journey with BBN Nutrition</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} />
            ))}
          </div>
          
          <div className="text-center mt-10">
            <Link 
              href="/reviews" 
              className="inline-flex items-center space-x-2 bg-white text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors border border-gray-200 shadow-sm"
            >
              <span>View All Reviews</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Ready to Transform Your Performance?</h2>
          <p className="text-sm text-gray-600 mb-4">Join thousands of athletes who trust BBN for their supplement needs</p>
          <Link 
            href="/shop" 
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            Start Shopping
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
