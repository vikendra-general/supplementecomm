'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { apiService } from '@/utils/api';
import { Product } from '@/types';
import { categories } from '@/data/categories';
import { Filter, Search } from 'lucide-react';

export default function ShopPage() {
  const searchParams = useSearchParams();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    category: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    inStock: false,
    rating: '',
    searchQuery: '',
    sortBy: '',
    sortOrder: 'desc'
  });

  useEffect(() => {
    // Handle URL search parameters
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const inStock = searchParams.get('inStock');
    const sortBy = searchParams.get('sortBy');
    const sortOrder = searchParams.get('sortOrder');
    const searchQuery = searchParams.get('q');
    
    setFilters(prev => ({
      ...prev,
      category: category || '',
      brand: brand || '',
      minPrice: minPrice || '',
      maxPrice: maxPrice || '',
      inStock: inStock === 'true',
      searchQuery: searchQuery || '',
      sortBy: sortBy || '',
      sortOrder: sortOrder || 'desc'
    }));
  }, [searchParams]);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await apiService.getProducts({ limit: 100 });
        if (response.success && response.data) {
          setAllProducts(response.data);
          setFilteredProducts(response.data);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    // Use requestAnimationFrame to debounce filtering
    const timeoutId = setTimeout(() => {
      let filtered = [...allProducts];

      // Apply search query filter
      if (filters.searchQuery) {
        const searchTerm = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(product =>
          (product.name && product.name.toLowerCase().includes(searchTerm)) ||
          (product.description && product.description.toLowerCase().includes(searchTerm)) ||
          (product.category && product.category.toLowerCase().includes(searchTerm)) ||
          (product.brand && product.brand.toLowerCase().includes(searchTerm)) ||
          (product.tags && product.tags.some(tag => tag && tag.toLowerCase().includes(searchTerm)))
        );
      }

      // Apply category filter
      if (filters.category && filters.category.trim()) {
        filtered = filtered.filter(product => 
          product.category && product.category.toLowerCase() === filters.category.toLowerCase()
        );
      }

      // Apply brand filter
      if (filters.brand && filters.brand.trim()) {
        filtered = filtered.filter(product => 
          product.brand && product.brand.toLowerCase() === filters.brand.toLowerCase()
        );
      }

      // Apply price filters
      if (filters.minPrice && !isNaN(parseFloat(filters.minPrice))) {
        const minPrice = parseFloat(filters.minPrice);
        filtered = filtered.filter(product => product.price >= minPrice);
      }
      if (filters.maxPrice && !isNaN(parseFloat(filters.maxPrice))) {
        const maxPrice = parseFloat(filters.maxPrice);
        filtered = filtered.filter(product => product.price <= maxPrice);
      }

      // Apply stock filter
      if (filters.inStock) {
        filtered = filtered.filter(product => product.inStock);
      }

      // Apply rating filter
      if (filters.rating && !isNaN(parseFloat(filters.rating))) {
        const minRating = parseFloat(filters.rating);
        filtered = filtered.filter(product => product.rating >= minRating);
      }

      // Apply sorting
      if (filters.sortBy) {
        filtered.sort((a, b) => {
          let aValue, bValue;
          
          switch (filters.sortBy) {
            case 'discount':
              // Calculate discount percentage
              aValue = a.originalPrice ? ((a.originalPrice - a.price) / a.originalPrice) * 100 : 0;
              bValue = b.originalPrice ? ((b.originalPrice - b.price) / b.originalPrice) * 100 : 0;
              break;
            case 'sales':
               // Sort by popularity (reviews count and bestSeller status)
               aValue = (a.bestSeller ? 1000 : 0) + (a.reviews || 0);
               bValue = (b.bestSeller ? 1000 : 0) + (b.reviews || 0);
               break;
            case 'price':
              aValue = a.price;
              bValue = b.price;
              break;
            case 'rating':
              aValue = a.rating || 0;
              bValue = b.rating || 0;
              break;
            case 'name':
              aValue = a.name.toLowerCase();
              bValue = b.name.toLowerCase();
              break;
            default:
              return 0;
          }
          
          if (filters.sortOrder === 'asc') {
            return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
          } else {
            return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
          }
        });
      }

      setFilteredProducts(filtered);
    }, 100); // 100ms debounce

    return () => clearTimeout(timeoutId);
  }, [filters, allProducts]);

  const clearFilters = () => {
    setFilters({
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      inStock: false,
      rating: '',
      searchQuery: '',
      sortBy: '',
      sortOrder: 'desc'
    });
  };

  const brands = [...new Set(allProducts.map((product: Product) => product.brand))];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Header */}
        <div className="mb-4">
          {filters.searchQuery ? (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Search Results for &ldquo;{filters.searchQuery}&rdquo;
              </h1>
              <p className="text-gray-600 text-sm">
                {filteredProducts.length} products found
              </p>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Shop</h1>
              <p className="text-gray-600 text-sm">
                Find the perfect supplements for your fitness goals
              </p>
            </div>
          )}
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 bg-white text-gray-700 px-3 py-1.5 rounded-lg border border-gray-300 shadow-sm hover:bg-gray-50 text-sm"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>

          {/* Product Count Display */}
          <div className="flex items-center ml-auto">
            <span className="text-sm text-gray-600">
              {filteredProducts.length} products found
            </span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Filters Sidebar */}
          <div className={`lg:w-60 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary hover:text-accent-2"
                >
                  Clear All
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2 text-sm">Category</h4>
                <div className="space-y-1">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      value=""
                      checked={filters.category === ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                      className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300"
                    />
                    <span className="text-xs text-gray-700">All Categories</span>
                  </label>
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        value={category.name}
                        checked={filters.category === category.name}
                        onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                        className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300"
                      />
                      <span className="text-xs text-gray-700">{category.name}</span>
                      <span className="ml-auto text-xs text-gray-500">
                        ({allProducts.filter(product => product.category && product.category.toLowerCase() === category.name.toLowerCase()).length})
                      </span>
                    </label>
                  ))}
                </div>
              </div>



              {/* Price Range */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2 text-sm">Price Range</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                          setFilters(prev => ({ ...prev, minPrice: value }));
                        }
                      }}
                      min="0"
                      step="1"
                      className="flex-1 p-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                    />
                    <span className="text-gray-500 text-sm">to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                          setFilters(prev => ({ ...prev, maxPrice: value }));
                        }
                      }}
                      min="0"
                      step="1"
                      className="flex-1 p-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                    />
                  </div>
                  <div className="flex space-x-1 text-xs">
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, minPrice: '0', maxPrice: '1000' }))}
                      className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                    >
                      ₹0-1K
                    </button>
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, minPrice: '1000', maxPrice: '3000' }))}
                      className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                    >
                      ₹1K-3K
                    </button>
                    <button
                      onClick={() => setFilters(prev => ({ ...prev, minPrice: '3000', maxPrice: '' }))}
                      className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                    >
                      ₹3K+
                    </button>
                  </div>
                </div>
                {filters.minPrice && filters.maxPrice && parseFloat(filters.minPrice) > parseFloat(filters.maxPrice) && (
                  <p className="text-sm text-red-600 mt-1">Min price should be less than max price</p>
                )}
              </div>



              {/* Availability Filter */}
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2 text-sm">Availability</h4>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.inStock}
                      onChange={(e) => setFilters(prev => ({ ...prev, inStock: e.target.checked }))}
                      className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <span className="text-xs text-gray-700">In Stock Only</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-lg"></div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters or search terms.</p>
                <button
                  onClick={clearFilters}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {filteredProducts.map((product: Product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}