'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { apiService } from '@/utils/api';
import { Product } from '@/types';
import { categories } from '@/data/categories';
import { Filter, Grid, List, Search } from 'lucide-react';

function ShopPageOld() {
  const searchParams = useSearchParams();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header Section */}
      <section className="py-8 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            {filters.searchQuery ? (
              <div>
                <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 px-4 py-2 rounded-full mb-6">
                  <Search className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Search Results</span>
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold text-black mb-3">
                  Results for &ldquo;{filters.searchQuery}&rdquo;
                </h1>
                <p className="text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  {filteredProducts.length} products found matching your search
                </p>
              </div>
            ) : (
              <div>
                <div className="inline-flex items-center space-x-2 bg-green-50 border border-green-200 px-4 py-2 rounded-full mb-6">
                  <Grid className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Product Catalog</span>
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold text-black mb-3">Shop All Products</h1>
                <p className="text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  Find the perfect supplements for your fitness goals from our premium collection
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Filters and Controls */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 shadow-sm hover:bg-gray-50"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2 ml-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${
                viewMode === 'grid' 
                  ? 'bg-primary text-white' 
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${
                viewMode === 'list' 
                  ? 'bg-primary text-white' 
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-black">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary hover:text-accent-2"
                >
                  Clear All
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-black mb-3">Category</h4>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      value=""
                      checked={filters.category === ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                      className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300"
                    />
                    <span className="text-sm text-gray-700">All Categories</span>
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
                      <span className="text-sm text-gray-700">{category.name}</span>
                      <span className="ml-auto text-xs text-gray-500">
                        ({allProducts.filter(product => product.category && product.category.toLowerCase() === category.name.toLowerCase()).length})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Brand Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-black mb-3">Brand</h4>
                <select
                  value={filters.brand}
                  onChange={(e) => setFilters(prev => ({ ...prev, brand: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">All Brands</option>
                  {brands.filter(brand => brand && brand.trim()).map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium text-black mb-3">Price Range</h4>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Min Price (₹)"
                    value={filters.minPrice}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                        setFilters(prev => ({ ...prev, minPrice: value }));
                      }
                    }}
                    min="0"
                    step="1"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                  <input
                    type="number"
                    placeholder="Max Price (₹)"
                    value={filters.maxPrice}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                        setFilters(prev => ({ ...prev, maxPrice: value }));
                      }
                    }}
                    min="0"
                    step="1"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                {filters.minPrice && filters.maxPrice && parseFloat(filters.minPrice) > parseFloat(filters.maxPrice) && (
                  <p className="text-sm text-red-600 mt-1">Min price should be less than max price</p>
                )}
              </div>

              {/* Stock Filter */}
              <div className="mb-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => setFilters(prev => ({ ...prev, inStock: e.target.checked }))}
                    className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">In Stock Only</span>
                </label>
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-black mb-3">Minimum Rating</h4>
                <select
                  value={filters.rating}
                  onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Any Rating</option>
                  <option value="3">3+ Stars ({allProducts.filter(product => product.rating >= 3).length})</option>
                  <option value="3.5">3.5+ Stars ({allProducts.filter(product => product.rating >= 3.5).length})</option>
                  <option value="4">4+ Stars ({allProducts.filter(product => product.rating >= 4).length})</option>
                  <option value="4.5">4.5+ Stars ({allProducts.filter(product => product.rating >= 4.5).length})</option>
                  <option value="5">5 Stars ({allProducts.filter(product => product.rating === 5).length})</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters or search terms.</p>
                <button
                  onClick={clearFilters}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
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


export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}

function ShopContent() {
  const searchParams = useSearchParams();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          {filters.searchQuery ? (
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">
                Search Results for &ldquo;{filters.searchQuery}&rdquo;
              </h1>
              <p className="text-gray-600">
                {filteredProducts.length} products found
              </p>
            </div>
          ) : (
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">Shop</h1>
              <p className="text-gray-600">
                Find the perfect supplements for your fitness goals
              </p>
            </div>
          )}
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 shadow-sm hover:bg-gray-50"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2 ml-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${
                viewMode === 'grid' 
                  ? 'bg-primary text-white' 
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${
                viewMode === 'list' 
                  ? 'bg-primary text-white' 
                  : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-black">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-primary hover:text-accent-2"
                >
                  Clear All
                </button>
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-black mb-3">Category</h4>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      value=""
                      checked={filters.category === ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                      className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300"
                    />
                    <span className="text-sm text-gray-700">All Categories</span>
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
                      <span className="text-sm text-gray-700">{category.name}</span>
                      <span className="ml-auto text-xs text-gray-500">
                        ({allProducts.filter(product => product.category && product.category.toLowerCase() === category.name.toLowerCase()).length})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Brand Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-black mb-3">Brand</h4>
                <select
                  value={filters.brand}
                  onChange={(e) => setFilters(prev => ({ ...prev, brand: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">All Brands</option>
                  {brands.filter(brand => brand && brand.trim()).map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium text-black mb-3">Price Range</h4>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Min Price (₹)"
                    value={filters.minPrice}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                        setFilters(prev => ({ ...prev, minPrice: value }));
                      }
                    }}
                    min="0"
                    step="1"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                  <input
                    type="number"
                    placeholder="Max Price (₹)"
                    value={filters.maxPrice}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0)) {
                        setFilters(prev => ({ ...prev, maxPrice: value }));
                      }
                    }}
                    min="0"
                    step="1"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                {filters.minPrice && filters.maxPrice && parseFloat(filters.minPrice) > parseFloat(filters.maxPrice) && (
                  <p className="text-sm text-red-600 mt-1">Min price should be less than max price</p>
                )}
              </div>

              {/* Stock Filter */}
              <div className="mb-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => setFilters(prev => ({ ...prev, inStock: e.target.checked }))}
                    className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">In Stock Only</span>
                </label>
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-black mb-3">Minimum Rating</h4>
                <select
                  value={filters.rating}
                  onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="">Any Rating</option>
                  <option value="3">3+ Stars ({allProducts.filter(product => product.rating >= 3).length})</option>
                  <option value="3.5">3.5+ Stars ({allProducts.filter(product => product.rating >= 3.5).length})</option>
                  <option value="4">4+ Stars ({allProducts.filter(product => product.rating >= 4).length})</option>
                  <option value="4.5">4.5+ Stars ({allProducts.filter(product => product.rating >= 4.5).length})</option>
                  <option value="5">5 Stars ({allProducts.filter(product => product.rating === 5).length})</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-lg"></div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-black mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filters or search terms.</p>
                <button
                  onClick={clearFilters}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
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