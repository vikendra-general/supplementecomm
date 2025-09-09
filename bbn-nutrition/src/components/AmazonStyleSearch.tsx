'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Clock, TrendingUp, X, Filter, ChevronDown } from 'lucide-react';
import { Product } from '@/types';
import { apiService } from '@/utils/api';
// Simple debounce function
const debounce = <T extends unknown[]>(func: (...args: T) => void, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: T) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'product' | 'category' | 'brand' | 'trending';
  count?: number;
  product?: Product;
}

interface AmazonStyleSearchProps {
  onClose?: () => void;
  className?: string;
}

export default function AmazonStyleSearch({ onClose, className = '' }: AmazonStyleSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingSearches] = useState<string[]>([
    'whey protein',
    'pre workout',
    'creatine',
    'bcaa',
    'multivitamin',
    'protein powder',
    'mass gainer',
    'fat burner'
  ]);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();



  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('searchHistory');
    const recent = localStorage.getItem('recentSearches');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
    if (recent) {
      setRecentSearches(JSON.parse(recent));
    }
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch products for suggestions
        const response = await apiService.getProducts({ limit: 100 });
        if (response.success && response.data) {
          const products = response.data;
          const searchTerm = query.toLowerCase();
          
          // Product suggestions
          const productSuggestions: SearchSuggestion[] = products
            .filter((product: Product) => 
              product.name.toLowerCase().includes(searchTerm) ||
              product.description.toLowerCase().includes(searchTerm) ||
              product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            )
            .slice(0, 5)
            .map((product: Product) => ({
              id: `product-${product.id}`,
              text: product.name,
              type: 'product' as const,
              product
            }));

          // Category suggestions (removed - using sidebar filter instead)

          // Brand suggestions
          const brands = [...new Set(products.map((p: Product) => p.brand))];
          const brandSuggestions: SearchSuggestion[] = brands
            .filter(brand => brand.toLowerCase().includes(searchTerm))
            .slice(0, 2)
            .map(brand => ({
              id: `brand-${brand}`,
              text: `${brand} products`,
              type: 'brand' as const,
              count: products.filter((p: Product) => p.brand === brand).length
            }));

          // Trending suggestions
          const trendingSuggestions: SearchSuggestion[] = trendingSearches
            .filter(trend => trend.toLowerCase().includes(searchTerm))
            .slice(0, 3)
            .map(trend => ({
              id: `trending-${trend}`,
              text: trend,
              type: 'trending' as const
            }));

          setSuggestions([
            ...productSuggestions,
            ...brandSuggestions,
            ...trendingSuggestions
          ]);
        }
      } catch (error) {
        console.error('Search suggestions error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [trendingSearches]
  );

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSuggestions(true);
    debouncedSearch(value);
  };

  // Handle search submission
  const handleSearch = (query?: string) => {
    const searchTerm = query || searchQuery;
    if (!searchTerm.trim()) return;

    // Add to search history
    const newHistory = [searchTerm, ...searchHistory.filter(h => h !== searchTerm)].slice(0, 10);
    const newRecent = [searchTerm, ...recentSearches.filter(r => r !== searchTerm)].slice(0, 5);
    
    setSearchHistory(newHistory);
    setRecentSearches(newRecent);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    localStorage.setItem('recentSearches', JSON.stringify(newRecent));

    // Navigate to search results
    router.push(`/shop?q=${encodeURIComponent(searchTerm)}`);
    
    setShowSuggestions(false);
    onClose?.();
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'product' && suggestion.product) {
      router.push(`/product/${suggestion.product.id}`);
    } else {
      setSearchQuery(suggestion.text);
      handleSearch(suggestion.text);
    }
    setShowSuggestions(false);
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clear search history
  const clearSearchHistory = () => {
    setSearchHistory([]);
    setRecentSearches([]);
    localStorage.removeItem('searchHistory');
    localStorage.removeItem('recentSearches');
  };

  // Get suggestion icon
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'product':
        return <Search className="w-4 h-4 text-gray-400" />;
      case 'category':
        return <Filter className="w-4 h-4 text-blue-500" />;
      case 'brand':
        return <div className="w-4 h-4 bg-purple-500 rounded text-white text-xs flex items-center justify-center font-bold">B</div>;
      case 'trending':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      default:
        return <Search className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div ref={searchRef} className={`relative w-full max-w-2xl ${className}`}>
      {/* Search Input Container */}
      <div className="flex bg-white rounded-md shadow-md border border-gray-200 overflow-hidden">

        
        {/* Search Input */}
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search supplements, vitamins, protein..."
            className="w-full h-9 px-3 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-orange-500 rounded-l-md font-plus-jakarta-sans"
          />
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="absolute right-3 top-2.5">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-orange-500"></div>
            </div>
          )}
        </div>
        
        {/* Search Button */}
        <button 
          onClick={() => handleSearch()}
          className="h-9 px-4 bg-green-500 hover:bg-green-600 transition-colors flex items-center justify-center rounded-r-md"
        >
          <Search className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-md shadow-lg z-50 max-h-80 overflow-y-auto font-plus-jakarta-sans">
          {/* Recent Searches */}
          {searchQuery.length === 0 && recentSearches.length > 0 && (
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-medium text-gray-700 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Recent Searches
                </h3>
                <button 
                  onClick={clearSearchHistory}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-1">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(search)}
                    className="block w-full text-left px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-50 rounded"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trending Searches */}
          {searchQuery.length === 0 && (
            <div className="p-3 border-b border-gray-100">
              <h3 className="text-xs font-medium text-gray-700 mb-2 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                Trending Searches
              </h3>
              <div className="grid grid-cols-2 gap-1.5">
                {trendingSearches.slice(0, 6).map((trend, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(trend)}
                    className="text-left px-2 py-1.5 text-xs text-gray-700 hover:bg-gray-50 rounded border border-gray-200"
                  >
                    {trend}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full flex items-center px-2 py-2 text-left hover:bg-gray-50 rounded transition-colors"
                >
                  <div className="mr-2">
                    {getSuggestionIcon(suggestion.type)}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-900">
                      {suggestion.text}
                    </div>
                    {suggestion.count && (
                      <div className="text-xs text-gray-500">
                        {suggestion.count} products
                      </div>
                    )}
                    {suggestion.type === 'product' && suggestion.product && (
                      <div className="text-xs text-gray-500">
                        ₹{suggestion.product.price.toLocaleString()}
                      </div>
                    )}
                  </div>
                  {suggestion.type === 'trending' && (
                    <div className="text-xs text-green-600 font-medium">
                      Trending
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* No suggestions */}
          {searchQuery.length > 0 && suggestions.length === 0 && !isLoading && (
            <div className="p-3 text-center text-gray-500">
              <Search className="w-6 h-6 mx-auto mb-2 text-gray-300" />
              <p className="text-xs">No suggestions found for &ldquo;{searchQuery}&rdquo;</p>
              <button
                onClick={() => handleSearch()}
                className="mt-2 text-blue-600 hover:text-blue-800 text-xs"
              >
                Search anyway
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}