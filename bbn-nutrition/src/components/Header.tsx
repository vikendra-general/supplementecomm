'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Search, User, Menu, X, Heart, LogOut, MapPin, ChevronDown, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import EnhancedSearchBar from './EnhancedSearchBar';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { getCartCount } = useCart();
  const { language, setLanguage, t } = useLanguage();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(t('category.allCategories'));
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      const categoryParam = selectedCategory !== 'All Categories' ? `&category=${encodeURIComponent(selectedCategory)}` : '';
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}${categoryParam}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };



  const cartCount = getCartCount();

  const handleLanguageChange = (lang: 'en' | 'hi') => {
    setLanguage(lang);
    setIsLanguageMenuOpen(false);
    // Update selected category to translated version
    setSelectedCategory(t('category.allCategories'));
  };

  const categories = [
    t('category.allCategories'),
    t('category.proteinSupplements'),
    t('category.preWorkout'),
    t('category.postWorkout'),
    t('category.vitaminsAndMinerals'),
    t('category.weightManagement'),
    t('category.creatine'),
    t('category.aminoAcids')
  ];

  return (
    <header className="bg-gray-900 shadow-lg sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-gray-800 text-white text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-8">
            <div className="flex items-center space-x-4">
              {isAuthenticated && user?.addresses && user.addresses.length > 0 && (
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span>Deliver to {user.addresses.find(addr => addr.isDefault)?.city || user.addresses[0]?.city}</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4">
               {/* Removed Customer Service and Track Your Order - moved to Returns & Orders page */}
             </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 space-x-4">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-light-green rounded-lg flex items-center justify-center">
                <span className="text-dark font-bold text-lg">BBN</span>
              </div>
              <div className="hidden lg:block">
                <div className="text-white font-bold text-lg leading-tight">
                  Booster Box
                </div>
                <div className="text-orange-400 text-xs font-medium">
                  Nutrition
                </div>
              </div>
            </Link>

            {/* Location Selector - Only show when user is logged in */}
            {isAuthenticated && user?.addresses && user.addresses.length > 0 && (
              <div className="hidden md:flex items-center text-white text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-300 text-xs">Deliver to</span>
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">
                      {user.addresses.find(addr => addr.isDefault)?.city || user.addresses[0]?.city}, {user.addresses.find(addr => addr.isDefault)?.zipCode || user.addresses[0]?.zipCode}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Search Bar - Amazon Style */}
            <div className="flex-1 max-w-3xl">
              <div className="flex">
                {/* Category Dropdown */}
                <div className="relative">
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="h-10 px-3 bg-gray-200 text-gray-900 text-sm border-r border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none pr-8"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-3 w-4 h-4 text-gray-600 pointer-events-none" />
                </div>
                
                {/* Search Input */}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t('header.searchPlaceholder')}
                  className="flex-1 h-10 px-4 text-gray-900 border-t border-b border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                
                {/* Search Button */}
                <button 
                  onClick={handleSearch}
                  className="h-10 px-4 bg-orange-400 hover:bg-orange-500 rounded-r-md transition-colors"
                >
                  <Search className="w-5 h-5 text-gray-900" />
                </button>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-6">

              {/* Account & Lists */}
              <div className="relative">
                {isAuthenticated ? (
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex flex-col items-start text-white hover:text-orange-400 transition-colors"
                  >
                    <span className="text-xs">Hello, {user?.name?.split(' ')[0]}</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-medium">Account & Lists</span>
                      <ChevronDown className="w-3 h-3" />
                    </div>
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="flex flex-col items-start text-white hover:text-orange-400 transition-colors"
                  >
                    <span className="text-xs">Hello, sign in</span>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-medium">Account & Lists</span>
                      <ChevronDown className="w-3 h-3" />
                    </div>
                  </Link>
                )}

                {/* User Dropdown */}
                {isUserMenuOpen && isAuthenticated && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-600">{user?.email}</p>
                    </div>
                    <div className="py-2">
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Your Account
                      </Link>
                      <Link
                        href="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Your Orders
                      </Link>
                      <Link
                        href="/wishlist"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Your Wish List
                      </Link>
                      <div className="border-t border-gray-200 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Returns & Orders */}
              <Link
                href="/orders"
                className="hidden lg:flex flex-col items-start text-white hover:text-orange-400 transition-colors"
              >
                <span className="text-xs">Returns</span>
                <span className="text-sm font-medium">& Orders</span>
              </Link>

              {/* Cart */}
              <Link 
                href="/cart" 
                className="flex items-center space-x-2 text-white hover:text-orange-400 transition-colors relative"
              >
                <div className="relative">
                  <ShoppingCart className="w-8 h-8" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-orange-400 text-gray-900 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {cartCount}
                    </span>
                  )}
                </div>
                <div className="hidden lg:flex flex-col">
                  <span className="text-xs text-orange-400">{cartCount}</span>
                  <span className="text-sm font-medium">Cart</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-10 space-x-6">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden flex items-center space-x-1 text-white hover:text-orange-400 transition-colors"
            >
              <Menu className="w-5 h-5" />
              <span className="text-sm font-medium">All</span>
            </button>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
              <Link href="/shop?sortBy=discount&sortOrder=desc&q=deals" className="text-white hover:text-orange-400 transition-colors text-sm font-medium">
                {t('header.todaysDeals')}
              </Link>
              <Link href="/shop?sortBy=sales&sortOrder=desc&q=bestseller" className="text-white hover:text-orange-400 transition-colors text-sm font-medium">
                {t('header.bestSellers')}
              </Link>
              <Link href="/shop?q=protein whey muscle gainer" className="text-white hover:text-orange-400 transition-colors text-sm font-medium">
                {t('header.proteinSupplements')}
              </Link>
              <Link href="/shop?q=pre-workout energy pump" className="text-white hover:text-orange-400 transition-colors text-sm font-medium">
                {t('header.preWorkout')}
              </Link>
              <Link href="/shop?q=vitamin multivitamin mineral" className="text-white hover:text-orange-400 transition-colors text-sm font-medium">
                {t('header.vitamins')}
              </Link>
              <Link href="/about" className="text-white hover:text-orange-400 transition-colors text-sm font-medium">
                {t('header.aboutBBN')}
              </Link>
              <Link href="/contact" className="text-white hover:text-orange-400 transition-colors text-sm font-medium">
                {t('header.customerService')}
              </Link>
              
              {/* Language Switcher */}
              <div className="relative">
                <button
                  onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                  className="flex items-center space-x-1 text-white hover:text-orange-400 transition-colors text-sm font-medium"
                >
                  <img 
                    src={language === 'hi' ? '/images/flags/in.svg' : '/images/flags/us.svg'} 
                    alt={language === 'hi' ? 'Hindi' : 'English'}
                    className="w-5 h-5 rounded-sm"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <Globe className="w-4 h-4" />
                  <span className="uppercase">{language}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {isLanguageMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    <div className="py-2">
                      <button
                        onClick={() => handleLanguageChange('en')}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 ${
                          language === 'en' ? 'bg-orange-50 text-orange-600' : 'text-gray-700'
                        }`}
                      >
                        <img 
                          src="/images/flags/us.svg" 
                          alt="English"
                          className="w-4 h-4 rounded-sm"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <span>English</span>
                      </button>
                      <button
                        onClick={() => handleLanguageChange('hi')}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 ${
                          language === 'hi' ? 'bg-orange-50 text-orange-600' : 'text-gray-700'
                        }`}
                      >
                        <img 
                          src="/images/flags/in.svg" 
                          alt="Hindi"
                          className="w-4 h-4 rounded-sm"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <span>हिंदी</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      </div>



      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4">
            {/* Mobile Search */}
            <div className="mb-4">
              <div className="flex">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t('header.searchPlaceholder')}
                  className="flex-1 h-10 px-4 text-gray-900 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button 
                  onClick={handleSearch}
                  className="h-10 px-4 bg-orange-400 hover:bg-orange-500 rounded-r-md transition-colors"
                >
                  <Search className="w-5 h-5 text-gray-900" />
                </button>
              </div>
            </div>
            
            {/* Mobile Navigation Links */}
            <nav className="space-y-3">
              <Link 
                href="/shop?sortBy=discount&sortOrder=desc&q=deals" 
                className="block text-gray-900 hover:text-orange-600 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('header.todaysDeals')}
              </Link>
              <Link 
                href="/shop?sortBy=sales&sortOrder=desc&q=bestseller" 
                className="block text-gray-900 hover:text-orange-600 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('header.bestSellers')}
              </Link>
              <Link 
                href="/shop?q=protein whey muscle gainer" 
                className="block text-gray-900 hover:text-orange-600 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('header.proteinSupplements')}
              </Link>
              <Link 
                href="/shop?q=pre-workout energy pump" 
                className="block text-gray-900 hover:text-orange-600 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('header.preWorkout')}
              </Link>
              <Link 
                href="/shop?q=vitamin multivitamin mineral" 
                className="block text-gray-900 hover:text-orange-600 font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Vitamins
              </Link>
              
              {/* Mobile Account Section */}
              <div className="pt-4 border-t border-gray-200">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3 py-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-primary to-light-green rounded-full flex items-center justify-center">
                        <span className="text-dark font-bold text-sm">
                          {user?.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <span className="text-gray-900 font-medium">{user?.name}</span>
                    </div>
                    <Link 
                      href="/orders" 
                      className="block text-gray-700 hover:text-orange-600 py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Your Orders
                    </Link>
                    <Link 
                      href="/wishlist" 
                      className="block text-gray-700 hover:text-orange-600 py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Your Wish List
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
                    className="block text-gray-900 hover:text-orange-600 font-medium py-2"
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