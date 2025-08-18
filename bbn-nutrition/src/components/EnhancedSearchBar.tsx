
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter } from 'lucide-react';
import { Product } from '@/types';
import { products } from '@/data/products';
import { searchProducts } from '@/utils/recommendations';

interface EnhancedSearchBarProps {
  onClose?: () => void;
}

export default function EnhancedSearchBar({ onClose }: EnhancedSearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    inStock: null as boolean | null,
    featured: null as boolean | null,
    bestSeller: null as boolean | null
  });
  
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  // Get unique categories and brands
  const categories = Array.from(new Set(products.map(p => p.category)));
  const brands = Array.from(new Set(products.map(p => p.brand)));

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchTerm.trim()) {
        try {
          const results = await searchProducts(searchTerm, {
            category: filters.category || undefined,
            brand: filters.brand || undefined,
            minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
            maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
            inStock: filters.inStock ?? undefined,
            featured: filters.featured ?? undefined,
            bestSeller: filters.bestSeller ?? undefined
          });
          setSearchResults(results.slice(0, 6)); // Show top 6 results
          setShowResults(true);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
          setShowResults(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filters]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
        setShowFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      const queryParams = new URLSearchParams();
      queryParams.set('q', searchTerm);
      
      if (filters.category) queryParams.set('category', filters.category);
      if (filters.brand) queryParams.set('brand', filters.brand);
      if (filters.minPrice) queryParams.set('minPrice', filters.minPrice);
      if (filters.maxPrice) queryParams.set('maxPrice', filters.maxPrice);
      if (filters.inStock !== null) queryParams.set('inStock', filters.inStock.toString());
      if (filters.featured !== null) queryParams.set('featured', filters.featured.toString());
      if (filters.bestSeller !== null) queryParams.set('bestSeller', filters.bestSeller.toString());
      
      router.push(`/shop?${queryParams.toString()}`);
      setShowResults(false);
      onClose?.();
    }
  };

  const handleProductClick = (productId: string) => {
    router.push(`/product/${productId}`);
    setShowResults(false);
    onClose?.();
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      inStock: null,
      featured: null,
      bestSeller: null
    });
  };

  return (
    <div ref={searchRef} className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search products, categories, brands..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          onFocus={() => searchTerm && setShowResults(true)}
          className="w-full px-4 py-3 pl-12 pr-20 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
        
        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`absolute right-2 top-2 p-1.5 rounded-md transition-colors ${
            showFilters ? 'bg-primary text-white' : 'text-gray-600 hover:text-primary'
          }`}
        >
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Filters */}
      {showFilters && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            {/* Category */}
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 text-sm focus:ring-1 focus:ring-primary"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Brand */}
            <select
              value={filters.brand}
              onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
              className="px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 text-sm focus:ring-1 focus:ring-primary"
            >
              <option value="">All Brands</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>

            {/* Price Range */}
            <div className="flex space-x-1">
              <input
                type="number"
                placeholder="Min ₹"
                value={filters.minPrice}
                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                className="w-full px-2 py-2 bg-white border border-gray-300 rounded text-gray-900 text-sm focus:ring-1 focus:ring-primary"
              />
              <input
                type="number"
                placeholder="Max ₹"
                value={filters.maxPrice}
                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                className="w-full px-2 py-2 bg-white border border-gray-300 rounded text-gray-900 text-sm focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex space-x-2">
              <button
                onClick={() => setFilters({ ...filters, inStock: filters.inStock === true ? null : true })}
                className={`px-3 py-2 rounded text-xs font-medium transition-colors ${
                  filters.inStock === true
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:text-primary border border-gray-300'
                }`}
              >
                In Stock
              </button>
              <button
                onClick={() => setFilters({ ...filters, bestSeller: filters.bestSeller === true ? null : true })}
                className={`px-3 py-2 rounded text-xs font-medium transition-colors ${
                  filters.bestSeller === true
                    ? 'bg-primary text-dark'
                    : 'bg-dark-gray text-dark-text-secondary hover:text-primary border border-gray-600'
                }`}
              >
                Best Seller
              </button>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <button
              onClick={clearFilters}
              className="text-sm text-dark-text-secondary hover:text-primary"
            >
              Clear Filters
            </button>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-gradient-to-r from-primary to-light-green text-dark font-medium rounded text-sm hover:from-dark-green hover:to-primary transition-all"
            >
              Search
            </button>
          </div>
        </div>
      )}

      {/* Search Results Dropdown */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-dark-card border border-gray-700 rounded-lg shadow-lg z-40 max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-sm text-dark-text-secondary">
                {searchResults.length} results for &ldquo;{searchTerm}&rdquo;
              </span>
              <button
                onClick={handleSearch}
                className="text-sm text-primary hover:text-accent-2"
              >
                View All
              </button>
            </div>
          </div>
          
          <div className="divide-y divide-gray-700">
            {searchResults.map((product) => (
              <button
                key={product.id}
                onClick={() => handleProductClick(product.id)}
                className="w-full p-3 text-left hover:bg-hover-subtle hover:bg-opacity-20 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-600 rounded-lg flex-shrink-0 flex items-center justify-center">
                    <span className="text-xs text-gray-300">{product.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-dark-text truncate">{product.name}</h4>
                      {product.bestSeller && (
                        <span className="text-xs bg-primary text-dark px-1.5 py-0.5 rounded-full font-medium">
                          Best Seller
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-dark-text-secondary truncate">{product.category} • {product.brand}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm font-semibold text-primary">₹{product.price}</span>
                      <div className="flex items-center">
                        <span className="text-xs text-yellow-400">★</span>
                        <span className="text-xs text-dark-text-secondary ml-1">{product.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}