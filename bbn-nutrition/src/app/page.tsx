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
        width={200}
        height={200}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
    </div>
    <div className="p-4 text-center">
      <h3 className="font-semibold text-black text-sm">{category.name}</h3>
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
    <h3 className="text-base font-bold text-green-400 mb-2" style={{color: '#4ade80'}}>{title}</h3>
    <p className="text-xs text-gray-300 leading-relaxed">{description}</p>
  </div>
))

FeatureCard.displayName = 'FeatureCard'

const TestimonialCard = memo(({ testimonial }: { testimonial: { name: string; role: string; content: string; rating: number; image: string; verified: boolean } }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 w-80 flex-shrink-0">
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
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <h4 className="font-semibold text-black text-sm">{testimonial.name}</h4>
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
    let isMounted = true;
    const abortController = new AbortController();

    const fetchProducts = async () => {
      try {
        if (!isMounted) return;
        setLoading(true);
        
        const [featured, topSellers] = await Promise.all([
          getFeaturedProducts(4, abortController.signal),
          getTopSellerProducts(4, abortController.signal)
        ]);
        
        if (isMounted) {
          setFeaturedProducts(featured);
          setTopSellerProducts(topSellers);
          
          // Get categories with dynamic product counts
          const dynamicCategories = getCategoriesWithDynamicCounts();
          setCategories(dynamicCategories);
        }
      } catch (error) {
        // Only log errors if the component is still mounted
        if (isMounted) {
          // Check if it's an abort-related error and suppress it
          if (error instanceof Error && 
              (error.message.includes('Request was cancelled') || 
               error.message.includes('aborted') || 
               error.name === 'AbortError')) {
            // Silently ignore abort errors during navigation
            return;
          }
          // Only log if the request wasn't explicitly aborted
          if (!abortController.signal.aborted) {
            console.error('Error fetching products:', error);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
      abortController.abort();
    };
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
            <h2 className="text-2xl font-bold text-black mb-6">Categories</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} t={t} />
            ))}
          </div>
        </div>
      </section>

      {/* P1 & P2 Videos Section */}
      <section className="py-12 bg-black" style={{backgroundColor: '#000000'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-6xl lg:text-12xl font-bold text-green-400 mb-4" style={{color: '#4ade80'}}>Product Showcase</h2>
            <p className="text-lg lg:text-xl text-white max-w-2xl mx-auto leading-relaxed" style={{color: '#ffffff'}}>Discover how our premium supplements are designed to fuel performance, enhance recovery, and support overall well-being — combining science-backed formulas with uncompromising quality.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="relative rounded-xl overflow-hidden shadow-lg" style={{aspectRatio: '16/10', minHeight: '400px'}}>
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
            <div className="relative rounded-xl overflow-hidden shadow-lg" style={{aspectRatio: '16/10', minHeight: '400px'}}>
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
            <h2 className="text-2xl lg:text-3xl font-bold text-black mb-3">{t('home.featuredTitle')}</h2>
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
              <span className="text-white">View All Products</span>
              <ArrowRight className="ml-2 w-4 h-4 text-white" />
            </Link>
          </div>
        </div>
      </section>

      {/* Shadow Video Section */}
      <section className="py-8 bg-black" style={{backgroundColor: '#000000'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-4 text-green-400" style={{color: '#4ade80'}}>
              Experience the Difference
            </h1>
            <p className="text-lg lg:text-xl text-white leading-relaxed max-w-2xl mx-auto" style={{color: '#ffffff'}}>From boosting daily energy to supporting long-term health goals, our supplements are crafted to deliver results you can see, feel, and trust — every step of your journey.</p>
          </div>
          
          <div className="flex justify-center">
            <div className="relative rounded-xl overflow-hidden shadow-lg" style={{aspectRatio: '21/9', maxWidth: '1200px', width: '100%'}}>
              <video 
                className="w-full h-full object-cover"
                autoPlay 
                muted 
                loop 
                playsInline
              >
                <source src="/videos/Shadow video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
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
            <h2 className="text-2xl lg:text-3xl font-bold text-black mb-3">Top Sellers</h2>
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
      <section className="py-8 bg-black" style={{backgroundColor: '#000000'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl lg:text-3xl font-bold text-green-400 mb-2" style={{color: '#4ade80'}}>Why Choose BBN?</h2>
            <p className="text-sm text-gray-300" style={{color: '#d1d5db'}}>More than just supplements — we provide trusted solutions built on research, purity, and performance, so you can unlock your body's full potential naturally.</p>
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
            <h2 className="text-3xl lg:text-4xl font-bold text-black mb-3">What customers say</h2>
            <p className="text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">Real testimonials from our satisfied customers who have transformed their fitness journey with BBN Nutrition</p>
          </div>
          
          <div className="relative overflow-hidden max-w-6xl mx-auto">
            <div className="flex gap-6 animate-scroll">
              {[...testimonials.slice(0, 3), ...testimonials.slice(0, 3)].map((testimonial, index) => (
                <TestimonialCard key={index} testimonial={testimonial} />
              ))}
            </div>
          </div>
          
          <div className="text-center mt-10">
            <Link 
              href="/reviews" 
              className="inline-flex items-center space-x-2 bg-white text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors border border-gray-200 shadow-sm"
            >
              <span className="text-gray-700">View All Reviews</span>
              <ArrowRight className="w-4 h-4 text-gray-700" />
            </Link>
          </div>
        </div>
        
        <style jsx>{`
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          
          .animate-scroll {
            animation: scroll 20s linear infinite;
          }
          
          .animate-scroll:hover {
            animation-play-state: paused;
          }
        `}</style>
      </section>

      {/* CTA Section */}
      <section className="py-8 bg-black" style={{backgroundColor: '#000000'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl lg:text-3xl font-bold text-green-400 mb-2" style={{color: '#4ade80'}}>Ready to Transform Your Performance?</h2>
          <p className="text-sm text-gray-300 mb-4" style={{color: '#d1d5db'}}>Join thousands of athletes who trust BBN for their supplement needs</p>
          <Link 
            href="/shop" 
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            <span className="text-white">Start Shopping</span>
            <ArrowRight className="ml-2 w-4 h-4 text-white" />
          </Link>
        </div>
      </section>
    </div>
  )
}
