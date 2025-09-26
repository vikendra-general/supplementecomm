'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, Shield, Truck, RotateCcw, CreditCard } from 'lucide-react';

const FooterEnhanced = () => {
  const footerSections = {
    company: {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Careers', href: '/careers' },
        { name: 'Press', href: '/press' },
        { name: 'Blog', href: '/blog' },
        { name: 'Affiliate Program', href: '/affiliate' },
      ],
    },
    support: {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '/help' },
        { name: 'Contact Us', href: '/contact' },
        { name: 'Track Order', href: '/track-order' },
        { name: 'Returns & Refunds', href: '/returns' },
        { name: 'Shipping Info', href: '/shipping' },
      ],
    },
    categories: {
      title: 'Categories',
      links: [
        { name: 'Protein Supplements', href: '/categories/protein' },
        { name: 'Vitamins & Minerals', href: '/categories/vitamins' },
        { name: 'Pre-Workout', href: '/categories/pre-workout' },
        { name: 'Mass Gainers', href: '/categories/mass-gainers' },
        { name: 'Health & Wellness', href: '/categories/health' },
      ],
    },
    legal: {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Cookie Policy', href: '/cookies' },
        { name: 'Disclaimer', href: '/disclaimer' },
      ],
    },
  };

  const trustBadges = [
    {
      icon: Shield,
      title: '100% Original',
      description: 'Authentic Products',
    },
    {
      icon: Truck,
      title: 'Free Shipping',
      description: 'On orders above ₹999',
    },
    {
      icon: RotateCcw,
      title: 'Easy Returns',
      description: '15-day return policy',
    },
    {
      icon: CreditCard,
      title: 'Secure Payment',
      description: 'Safe & encrypted',
    },
  ];

  return (
    <footer className="footer-nutrabay">
      {/* Trust Badges Section */}
      <div className="footer-trust-section">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trustBadges.map((badge, index) => {
              const IconComponent = badge.icon;
              return (
                <div key={index} className="footer-trust-badge">
                  <div className="footer-trust-icon">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="footer-trust-title">{badge.title}</h4>
                    <p className="footer-trust-description">{badge.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="footer-main">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <Link href="/" className="footer-logo">
                <Image
                  src="/logo.png"
                  alt="BBN Nutrition"
                  width={160}
                  height={40}
                  className="h-10 w-auto mb-4"
                />
              </Link>
              <p className="footer-description">
                Your trusted partner in health and fitness. We provide premium quality supplements 
                and nutrition products to help you achieve your fitness goals.
              </p>
              
              {/* Contact Info */}
              <div className="footer-contact-info">
                <div className="footer-contact-item">
                  <Phone className="w-4 h-4" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="footer-contact-item">
                  <Mail className="w-4 h-4" />
                  <span>support@bbnnutrition.com</span>
                </div>
                <div className="footer-contact-item">
                  <MapPin className="w-4 h-4" />
                  <span>Mumbai, Maharashtra, India</span>
                </div>
              </div>
            </div>

            {/* Footer Links */}
            {Object.entries(footerSections).map(([key, section]) => (
              <div key={key}>
                <h3 className="footer-section-title">{section.title}</h3>
                <ul className="footer-links">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link href={link.href} className="footer-link">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="footer-newsletter">
        <div className="container mx-auto px-4">
          <div className="footer-newsletter-content">
            <div className="footer-newsletter-info">
              <h3 className="footer-newsletter-title">Stay Updated</h3>
              <p className="footer-newsletter-description">
                Get the latest updates on new products, offers, and health tips.
              </p>
            </div>
            <div className="footer-newsletter-form">
              <div className="footer-newsletter-input-wrapper">
                <Mail className="footer-newsletter-icon" />
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="footer-newsletter-input"
                />
                <button className="footer-newsletter-button">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="footer-bottom">
        <div className="container mx-auto px-4">
          <div className="footer-bottom-content">
            <div className="footer-copyright">
              <p>&copy; 2024 BBN Nutrition. All rights reserved.</p>
            </div>
            
            {/* Social Links */}
            <div className="footer-social">
              <Link href="#" className="footer-social-link">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="#" className="footer-social-link">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="footer-social-link">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="footer-social-link">
                <Youtube className="w-5 h-5" />
              </Link>
            </div>
            
            {/* Payment Methods */}
            <div className="footer-payment">
              <span className="footer-payment-text">We Accept:</span>
              <div className="footer-payment-methods">
                <div className="footer-payment-method">Visa</div>
                <div className="footer-payment-method">MC</div>
                <div className="footer-payment-method">UPI</div>
                <div className="footer-payment-method">Wallet</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterEnhanced;