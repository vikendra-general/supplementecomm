'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingCart, User, Menu, X, Heart, MapPin } from 'lucide-react';

const HeaderEnhanced = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigationItems = [
    { name: 'Protein', href: '/categories/protein' },
    { name: 'Vitamins', href: '/categories/vitamins' },
    { name: 'Pre-Workout', href: '/categories/pre-workout' },
    { name: 'Mass Gainers', href: '/categories/mass-gainers' },
    { name: 'Health', href: '/categories/health' },
    { name: 'Brands', href: '/brands' },
  ];

  return (
    <header className="header-nutrabay">
      {/* Top Bar */}
      <div className="header-top-bar">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-nutrabay-text-muted">
                <MapPin className="w-4 h-4 mr-1" />
                <span>Deliver to: Mumbai 400001</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/track-order" className="header-top-link">
                Track Order
              </Link>
              <Link href="/help" className="header-top-link">
                Help
              </Link>
              <Link href="/contact" className="header-top-link">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="header-main">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link href="/" className="header-logo">
              <Image
                src="/logo.png"
                alt="BBN Nutrition"
                width={160}
                height={40}
                className="h-10 w-auto"
              />
            </Link>

            {/* Search Bar */}
            <div className="header-search-container">
              <div className="header-search-wrapper">
                <Search className="header-search-icon" />
                <input
                  type="text"
                  placeholder="Search for products, brands, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="header-search-input"
                />
                <button className="header-search-button">
                  Search
                </button>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-4">
              {/* Wishlist */}
              <Link href="/wishlist" className="header-action-btn">
                <Heart className="w-5 h-5" />
                <span className="hidden md:inline ml-1">Wishlist</span>
              </Link>

              {/* Account */}
              <Link href="/account" className="header-action-btn">
                <User className="w-5 h-5" />
                <span className="hidden md:inline ml-1">Account</span>
              </Link>

              {/* Cart */}
              <Link href="/cart" className="header-cart-btn">
                <div className="relative">
                  <ShoppingCart className="w-5 h-5" />
                  <span className="header-cart-badge">3</span>
                </div>
                <span className="hidden md:inline ml-2">Cart</span>
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden header-menu-toggle"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="header-navigation">
        <div className="container mx-auto px-4">
          <div className="hidden md:flex items-center justify-between py-3">
            <div className="flex items-center space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="header-nav-link"
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="flex items-center space-x-4">
              <span className="header-offer-text">
                🔥 UPTO 57% OFF on Bestsellers
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="header-mobile-menu md:hidden">
          <div className="container mx-auto px-4 py-4">
            <div className="space-y-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block header-mobile-nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default HeaderEnhanced;