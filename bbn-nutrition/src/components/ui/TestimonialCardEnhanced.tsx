'use client';

import Image from 'next/image';
import { Star, CheckCircle } from 'lucide-react';
import { memo } from 'react';

interface TestimonialProps {
  testimonial: {
    name: string;
    role: string;
    content: string;
    rating: number;
    image: string;
    verified: boolean;
  };
}

const TestimonialCardEnhanced = memo(({ testimonial }: TestimonialProps) => {
  return (
    <div className="testimonial-nutrabay group">
      {/* Verified Badge */}
      {testimonial.verified && (
        <div className="verified-badge">
          <CheckCircle className="w-3 h-3" />
          <span>Verified</span>
        </div>
      )}
      
      {/* Header with Avatar and Info */}
      <div className="testimonial-header">
        <div className="relative">
          <Image
            src={testimonial.image}
            alt={testimonial.name}
            width={60}
            height={60}
            className="testimonial-avatar"
          />
        </div>
        
        <div className="testimonial-info flex-1">
          <h4>{testimonial.name}</h4>
          <p>{testimonial.role}</p>
          
          {/* Rating Stars */}
          <div className="testimonial-rating">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < testimonial.rating
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
            <span className="ml-2 text-sm font-medium text-nutrabay-text-secondary">
              {testimonial.rating}.0
            </span>
          </div>
        </div>
      </div>
      
      {/* Testimonial Content */}
      <div className="testimonial-content">
        {testimonial.content}
      </div>
      
      {/* Hover Effect Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-nutrabay-accent opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-lg pointer-events-none" />
    </div>
  );
});

TestimonialCardEnhanced.displayName = 'TestimonialCardEnhanced';

export default TestimonialCardEnhanced;