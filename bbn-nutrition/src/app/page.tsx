import dynamic from 'next/dynamic'
import { products } from '@/data/products'
import { categories } from '@/data/categories'
import { Star, ArrowRight, Truck, Shield, Clock } from 'lucide-react'
import Link from 'next/link'
import { memo } from 'react'

// Lazy load components for better performance
const Hero = dynamic(() => import('@/components/Hero'), {
  loading: () => <div className="h-96 bg-gray-100 animate-pulse" />
})

const ProductCard = dynamic(() => import('@/components/ProductCard'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />
})

// Memoized components for better performance
const CategoryCard = memo(({ category }: { category: { id: string; name: string; description: string; productCount: number } }) => (
  <Link 
    href={`/shop?category=${category.name.toLowerCase()}`}
    className="group bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center hover:shadow-lg transition-all duration-300"
  >
    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg mx-auto mb-4 flex items-center justify-center">
      <span className="text-white font-bold text-lg">{category.name.charAt(0)}</span>
    </div>
    <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
    <p className="text-sm text-gray-500 mb-2">{category.description}</p>
    <span className="text-xs text-blue-600 font-medium">
      {category.productCount} products
    </span>
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
  <div className="text-center">
    <div className={`w-16 h-16 ${bgColor} rounded-full mx-auto mb-4 flex items-center justify-center`}>
      <Icon className={`w-8 h-8 ${iconColor}`} />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
))

FeatureCard.displayName = 'FeatureCard'

const TestimonialCard = memo(({ testimonial }: { testimonial: { name: string; role: string; content: string; rating: number } }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex items-center mb-4">
      {[...Array(testimonial.rating)].map((_, i) => (
        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
      ))}
    </div>
    <p className="text-gray-600 mb-4">&ldquo;{testimonial.content}&rdquo;</p>
    <div>
      <div className="font-semibold text-gray-900">{testimonial.name}</div>
      <div className="text-sm text-gray-500">{testimonial.role}</div>
    </div>
  </div>
))

TestimonialCard.displayName = 'TestimonialCard'

export default function HomePage() {
  const featuredProducts = products.filter(product => product.featured).slice(0, 4)

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
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-lg text-gray-600">Find the perfect supplements for your fitness goals</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Products</h2>
              <p className="text-lg text-gray-600">Our most popular and highest-rated supplements</p>
            </div>
            <Link 
              href="/shop" 
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold"
            >
              View All
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
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
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Performance?</h2>
          <p className="text-xl text-blue-100 mb-8">Join thousands of athletes who trust BBN for their supplement needs</p>
          <Link 
            href="/shop" 
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Start Shopping
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
