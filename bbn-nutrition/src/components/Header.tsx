'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { ShoppingCart, Search, User, Menu, X, Heart, LogOut, MapPin, ChevronDown, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import AmazonStyleSearch from './AmazonStyleSearch';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { getCartCount } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
  };





  const cartCount = getCartCount();

  const handleLanguageChange = (lang: 'en' | 'hi') => {
    setLanguage(lang);
    setIsLanguageMenuOpen(false);
  };



  // Check if we're on the home page
  const isHomePage = pathname === '/';
  
  // Different styling for home page vs other pages
  const headerBg = isHomePage 
    ? (isScrolled || isHovered ? 'bg-white shadow-lg' : 'bg-transparent')
    : 'bg-white shadow-lg';
  const textColor = isHomePage 
    ? (isScrolled || isHovered ? 'text-black' : 'text-white')
    : 'text-black';
  const logoTextColor = isHomePage 
    ? (isScrolled || isHovered ? 'text-black' : 'text-white')
    : 'text-black';
  
  // Different positioning for home page vs other pages
  const headerPosition = isHomePage 
    ? 'fixed top-0 left-0 right-0 z-50'
    : 'sticky top-0 z-50';

  return (
    <header 
      className={`${headerBg} backdrop-blur-md ${headerPosition} transition-all duration-300 ease-in-out`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Header */}
      <div className="bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 flex-shrink-0">
              <div className={`text-2xl font-bold ${logoTextColor} transition-colors duration-300`}>
                BBN Nutrition
              </div>
            </Link>

            {/* Navigation Menu */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link href="/shop" className={`${textColor} hover:text-accent-orange transition-colors duration-300 font-medium`}>
                Shop
              </Link>
              <Link href="/protein-supplements" className={`${textColor} hover:text-accent-orange transition-colors duration-300 font-medium`}>
                Protein
              </Link>
              <Link href="/vitamins" className={`${textColor} hover:text-accent-orange transition-colors duration-300 font-medium`}>
                Vitamins
              </Link>
              <Link href="/pre-workout" className={`${textColor} hover:text-accent-orange transition-colors duration-300 font-medium`}>
                Pre-Workout
              </Link>
              <Link href="/about" className={`${textColor} hover:text-accent-orange transition-colors duration-300 font-medium`}>
                About
              </Link>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-6">

              {/* Account */}
              <div className="relative">
                {isAuthenticated ? (
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className={`${textColor} hover:text-accent-orange transition-colors duration-300 font-medium`}
                  >
                    Account
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className={`${textColor} hover:text-accent-orange transition-colors duration-300 font-medium`}
                  >
                    Sign In
                  </Link>
                )}

                {/* User Dropdown */}
                {isUserMenuOpen && isAuthenticated && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <div className="py-2">
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Orders
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Cart */}
              <Link 
                href="/cart" 
                className={`${textColor} hover:text-accent-orange transition-colors duration-300 relative font-medium`}
              >
                <div className="flex items-center space-x-1">
                  <ShoppingCart className="w-5 h-5" />
                  <span>Cart</span>
                  {cartCount > 0 && (
                    <span className="bg-accent-orange text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {cartCount}
                    </span>
                  )}
                </div>
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`lg:hidden ${textColor} hover:text-accent-orange transition-colors duration-300`}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>





      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white shadow-lg">
          <div className="px-4 py-6">
            <nav className="space-y-4">
              <Link 
                href="/shop" 
                className="block text-gray-900 hover:text-accent-orange font-medium py-2 text-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Shop
              </Link>
              <Link 
                href="/protein-supplements" 
                className="block text-gray-900 hover:text-accent-orange font-medium py-2 text-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Protein
              </Link>
              <Link 
                href="/vitamins" 
                className="block text-gray-900 hover:text-accent-orange font-medium py-2 text-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Vitamins
              </Link>
              <Link 
                href="/pre-workout" 
                className="block text-gray-900 hover:text-accent-orange font-medium py-2 text-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Pre-Workout
              </Link>
              <Link 
                href="/about" 
                className="block text-gray-900 hover:text-accent-orange font-medium py-2 text-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              
              {/* Mobile Account Section */}
              <div className="pt-4 border-t border-gray-200">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <Link 
                      href="/dashboard" 
                      className="block text-gray-700 hover:text-accent-orange py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      href="/orders" 
                      className="block text-gray-700 hover:text-accent-orange py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block text-red-600 hover:text-red-700 py-2 font-medium"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link 
                    href="/login" 
                    className="block text-gray-900 hover:text-accent-orange font-medium py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}