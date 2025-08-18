'use client';

import { useState } from 'react';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { Product } from '@/types';

interface AdvancedSearchProps {
  products: Product[];
  onSearchResults: (results: Product[]) => void;
  onClose?: () => void;
}

interface FilterState {
  category: string;
  priceRange: [number, number];
  brand: string;
  inStock: boolean | null;
  featured: boolean | null;
  sortBy: string;
}

export default function AdvancedSearch({ products, onSearchResults, onClose }: AdvancedSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    priceRange: [0, 1000],
    brand: '',
    inStock: null,
    featured: null,
    sortBy: 'relevance'
  });

  // Get unique categories and brands from products
  const categories = Array.from(new Set(products.map(p => p.category)));
  const brands = Array.from(new Set(products.map(p => p.brand)));

  const handleSearch = () => {
    const filteredProducts = products.filter(product => {
      // Text search
      const matchesSearch = searchTerm === '' || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.tags && product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));

      // Category filter
      const matchesCategory = filters.category === '' || product.category === filters.category;

      // Price range filter
      const matchesPrice = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1];

      // Brand filter
      const matchesBrand = filters.brand === '' || product.brand === filters.brand;

      // Stock filter
      const matchesStock = filters.inStock === null || product.inStock === filters.inStock;

      // Featured filter
      const matchesFeatured = filters.featured === null || product.featured === filters.featured;

      return matchesSearch && matchesCategory && matchesPrice && matchesBrand && matchesStock && matchesFeatured;
    });

    // Sort results
    switch (filters.sortBy) {
      case 'price-low':
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filteredProducts.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        // Assuming products have a created date or we can use featured as proxy
        filteredProducts.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
      default:
        // Relevance - keep original order or sort by rating
        filteredProducts.sort((a, b) => b.rating - a.rating);
    }

    onSearchResults(filteredProducts);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      priceRange: [0, 1000],
      brand: '',
      inStock: null,
      featured: null,
      sortBy: 'relevance'
    });
    setSearchTerm('');
    onSearchResults(products);
  };

  return (
    <div className="bg-dark-card border border-gray-700 rounded-lg p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-dark-text flex items-center">
          <Search className="w-5 h-5 mr-2 text-primary" />
          Advanced Search
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-dark-text-secondary hover:text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search products, categories, brands..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="w-full px-4 py-3 pl-12 bg-dark-gray border border-gray-600 rounded-lg text-dark-text placeholder-dark-text-secondary focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-dark-text-secondary" />
      </div>

      {/* Filter Toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center text-primary hover:text-accent-2 transition-colors mb-4"
      >
        <Filter className="w-4 h-4 mr-2" />
        {showFilters ? 'Hide Filters' : 'Show Filters'}
        <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
      </button>

      {/* Filters */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 p-4 bg-dark-gray rounded-lg">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-3 py-2 bg-dark-card border border-gray-600 rounded-lg text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Brand Filter */}
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">Brand</label>
            <select
              value={filters.brand}
              onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
              className="w-full px-3 py-2 bg-dark-card border border-gray-600 rounded-lg text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All Brands</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="w-full px-3 py-2 bg-dark-card border border-gray-600 rounded-lg text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="relevance">Relevance</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="name">Name A-Z</option>
              <option value="newest">Newest First</option>
            </select>
          </div>

          {/* Price Range */}
          <div className="md:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium text-dark-text mb-2">
              Price Range: ₹{filters.priceRange[0]} - ₹{filters.priceRange[1]}
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="range"
                min="0"
                max="1000"
                value={filters.priceRange[0]}
                onChange={(e) => setFilters({ 
                  ...filters, 
                  priceRange: [parseInt(e.target.value), filters.priceRange[1]] 
                })}
                className="flex-1"
              />
              <input
                type="range"
                min="0"
                max="1000"
                value={filters.priceRange[1]}
                onChange={(e) => setFilters({ 
                  ...filters, 
                  priceRange: [filters.priceRange[0], parseInt(e.target.value)] 
                })}
                className="flex-1"
              />
            </div>
          </div>

          {/* Stock Filter */}
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">Availability</label>
            <select
              value={filters.inStock === null ? '' : filters.inStock.toString()}
              onChange={(e) => setFilters({ 
                ...filters, 
                inStock: e.target.value === '' ? null : e.target.value === 'true' 
              })}
              className="w-full px-3 py-2 bg-dark-card border border-gray-600 rounded-lg text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All Products</option>
              <option value="true">In Stock Only</option>
              <option value="false">Out of Stock</option>
            </select>
          </div>

          {/* Featured Filter */}
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">Featured</label>
            <select
              value={filters.featured === null ? '' : filters.featured.toString()}
              onChange={(e) => setFilters({ 
                ...filters, 
                featured: e.target.value === '' ? null : e.target.value === 'true' 
              })}
              className="w-full px-3 py-2 bg-dark-card border border-gray-600 rounded-lg text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All Products</option>
              <option value="true">Featured Only</option>
              <option value="false">Non-Featured</option>
            </select>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleSearch}
          className="flex-1 bg-gradient-to-r from-primary to-light-green text-dark font-semibold py-3 px-6 rounded-lg hover:from-dark-green hover:to-primary transition-all duration-300 flex items-center justify-center"
        >
          <Search className="w-4 h-4 mr-2" />
          Search Products
        </button>
        <button
          onClick={clearFilters}
          className="px-6 py-3 border border-gray-600 text-dark-text-secondary hover:text-primary hover:border-primary rounded-lg transition-colors"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}