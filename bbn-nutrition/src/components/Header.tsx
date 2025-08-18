'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, User, Menu, X, Heart, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import EnhancedSearchBar from './EnhancedSearchBar';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { getCartCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
  };

  const cartCount = getCartCount(); // Show cart count for both anonymous and authenticated users

  return (
    <header className="bg-gray-900 shadow-lg border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-light-green rounded-lg flex items-center justify-center">
              <span className="text-dark font-bold text-sm">BBN</span>
            </div>
            <span className="text-xl font-bold text-white">Booster Box Nutrition</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-white hover:text-primary transition-colors font-medium">
              Home
            </Link>
            <Link href="/shop" className="text-white hover:text-primary transition-colors font-medium">
              Shop
            </Link>
            <Link href="/about" className="text-white hover:text-primary transition-colors font-medium">
              About
            </Link>
            <Link href="/contact" className="text-white hover:text-primary transition-colors font-medium">
              Contact
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-white hover:text-primary transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist */}
            <Link href="/wishlist" className="p-2 text-white hover:text-primary transition-colors">
              <Heart className="w-5 h-5" />
            </Link>

            {/* Cart */}
            <Link 
              href="/cart" 
              className="p-2 text-white hover:text-primary transition-colors relative"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent-1 text-secondary text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 text-white hover:text-primary transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-primary to-light-green rounded-full flex items-center justify-center">
                    <span className="text-gray-900 font-bold text-sm">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <span className="hidden lg:block text-sm font-medium text-white">{user?.name}</span>
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-neutral-light rounded-lg shadow-lg border border-gray-300 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-300">
                      <p className="text-sm font-medium text-secondary">{user?.name}</p>
                      <p className="text-xs text-gray-600">{user?.email}</p>
                    </div>
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <div className="flex items-center space-x-2">
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="p-2 text-white hover:text-primary transition-colors">
                <User className="w-5 h-5" />
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-white hover:text-primary transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Enhanced Search Bar */}
        {isSearchOpen && (
          <div className="py-4 border-t border-gray-600">
            <EnhancedSearchBar onClose={() => setIsSearchOpen(false)} />
          </div>
        )}

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-600 py-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className="text-white hover:text-primary transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/shop" 
                className="text-white hover:text-primary transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Shop
              </Link>
              <Link 
                href="/about" 
                className="text-white hover:text-primary transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className="text-white hover:text-primary transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              
              <div className="flex items-center space-x-4 pt-4 border-t border-gray-600">
                <Link 
                  href="/wishlist" 
                  className="flex items-center space-x-2 text-white hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Heart className="w-5 h-5" />
                  <span>Wishlist</span>
                </Link>
                <Link 
                  href="/cart" 
                  className="flex items-center space-x-2 text-white hover:text-primary transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Cart ({cartCount})</span>
                </Link>
                
                {isAuthenticated ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary to-light-green rounded-full flex items-center justify-center">
                      <span className="text-dark font-bold text-sm">
                        {user?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">{user?.name}</span>
                      <button
                        onClick={handleLogout}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link 
                    href="/login" 
                    className="flex items-center space-x-2 text-white hover:text-primary transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    <span>Login</span>
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}