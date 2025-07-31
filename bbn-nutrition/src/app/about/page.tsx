import { Users, Target, Award, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About BBN</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          We&apos;re passionate about helping athletes and fitness enthusiasts achieve their goals 
          with premium quality supplements backed by science and results.
        </p>
      </div>

      {/* Story Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
          <div className="space-y-4 text-gray-600">
            <p>
              Founded in 2020 by a team of fitness professionals and nutrition experts, 
              Booster Box Nutrition (BBN) was born from a simple belief: everyone deserves 
              access to high-quality supplements that actually work.
            </p>
            <p>
              What started as a small operation in a local gym has grown into a trusted 
              brand serving thousands of athletes, bodybuilders, and fitness enthusiasts 
              across the country.
            </p>
            <p>
                             We&apos;ve never lost sight of our core mission: to provide scientifically-backed, 
               premium quality supplements that help people achieve their fitness goals faster 
               and more effectively.
            </p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
          <div className="text-center">
            <Users className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">10,000+</h3>
            <p className="text-blue-100">Happy Customers</p>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <Target className="w-12 h-12 text-blue-600 mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
          <p className="text-gray-600">
            To provide athletes and fitness enthusiasts with premium quality supplements 
            that are scientifically formulated, rigorously tested, and proven to deliver 
            real results. We believe in transparency, quality, and putting our customers first.
          </p>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <Award className="w-12 h-12 text-purple-600 mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
          <p className="text-gray-600">
            To become the most trusted name in sports nutrition, known for our commitment 
            to quality, innovation, and customer satisfaction. We aim to help millions of 
            people achieve their fitness goals and live healthier, stronger lives.
          </p>
        </div>
      </div>

      {/* Values */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Heart className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality First</h3>
            <p className="text-gray-600">
              Every product we create undergoes rigorous testing to ensure the highest 
              quality standards and maximum effectiveness.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Target className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Science-Based</h3>
            <p className="text-gray-600">
              Our formulations are backed by scientific research and developed by 
              nutrition experts to deliver proven results.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Customer Focused</h3>
            <p className="text-gray-600">
              We put our customers first, providing exceptional service and support 
              to help you achieve your fitness goals.
            </p>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Meet Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              name: "Dr. Sarah Johnson",
              role: "Founder & CEO",
              bio: "Former professional athlete and nutritionist with 15+ years of experience in sports nutrition.",
              image: "/images/team/sarah.jpg"
            },
            {
              name: "Mike Chen",
              role: "Head of Product Development",
              bio: "PhD in Sports Nutrition with expertise in supplement formulation and clinical research.",
              image: "/images/team/mike.jpg"
            },
            {
              name: "Emma Davis",
              role: "Quality Assurance Manager",
              bio: "Certified nutritionist specializing in quality control and regulatory compliance.",
              image: "/images/team/emma.jpg"
            },
            {
              name: "Alex Rodriguez",
              role: "Marketing Director",
              bio: "Former fitness coach with a passion for helping people achieve their fitness goals.",
              image: "/images/team/alex.jpg"
            },
            {
              name: "Lisa Thompson",
              role: "Customer Success Manager",
              bio: "Dedicated to ensuring every customer has an exceptional experience with BBN.",
              image: "/images/team/lisa.jpg"
            },
            {
              name: "David Wilson",
              role: "Operations Manager",
              bio: "Ensures smooth operations and timely delivery of all BBN products to our customers.",
              image: "/images/team/david.jpg"
            }
          ].map((member, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white font-bold text-xl">{member.name.charAt(0)}</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
              <p className="text-blue-600 font-medium mb-3">{member.role}</p>
              <p className="text-gray-600 text-sm">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gray-50 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">BBN by the Numbers</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
            <p className="text-gray-600">Premium Products</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">10K+</div>
            <p className="text-gray-600">Happy Customers</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">4.9★</div>
            <p className="text-gray-600">Average Rating</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">3</div>
            <p className="text-gray-600">Years of Excellence</p>
          </div>
        </div>
      </div>
    </div>
  );
} 