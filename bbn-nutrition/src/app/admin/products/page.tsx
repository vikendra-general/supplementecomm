'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'next/navigation';
import { apiService } from '@/utils/api';
import { cache, CACHE_KEYS } from '@/utils/cache';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  ArrowLeft,
  Save,
  X,
  Upload,
  Star,
  Package,
  DollarSign,
  BarChart3,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { Product } from '@/types';

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  originalPrice?: string;
  category: string;
  brand: string;
  images: string[];
  imageFiles: File[];
  stockQuantity: string;
  tags: string;
  featured: boolean;
  bestSeller: boolean;
  todaysDeals: boolean;
}

export default function AdminProductsPage() {
  const { user, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [currentView, setCurrentView] = useState('products');

  // Handle URL parameters
  useEffect(() => {
    const action = searchParams.get('action');
    const view = searchParams.get('view');
    
    if (action === 'add') {
      setShowProductForm(true);
    }
    
    if (view) {
      setCurrentView(view);
    }
  }, [searchParams]);
  const [productFormData, setProductFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    brand: '',
    images: [],
    imageFiles: [],
    stockQuantity: '',
    tags: '',
    featured: false,
    bestSeller: false,
    todaysDeals: false
  });

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getProducts({ limit: 100 });
      if (response.success && response.data) {
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Load products on component mount
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchProducts();
    }
  }, [isAuthenticated, user]);

  // Get unique categories and brands
  const categories = Array.from(new Set(products.map(p => p.category)));
  const brands = Array.from(new Set(products.map(p => p.brand)));

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || product.category === filterCategory;
    const matchesBrand = !filterBrand || product.brand === filterBrand;
    
    return matchesSearch && matchesCategory && matchesBrand;
  });

  // Redirect if not admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <div className="text-center bg-dark-card p-8 rounded-lg shadow-lg border border-gray-700">
          <h1 className="text-3xl font-bold text-dark-text mb-4">Access Denied</h1>
          <p className="text-dark-text-secondary mb-8">You need admin privileges to access this page.</p>
          <Link 
            href="/login?redirect=/admin/products" 
            className="bg-gradient-to-r from-primary to-light-green text-dark font-semibold px-6 py-3 rounded-lg hover:from-dark-green hover:to-primary transition-all"
          >
            Login as Admin
          </Link>
        </div>
      </div>
    );
  }

  const handleSaveProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Frontend validation
      if (!productFormData.name.trim()) {
        setError('Product name is required');
        setLoading(false);
        return;
      }
      
      if (productFormData.name.trim().length < 2) {
        setError('Product name must be at least 2 characters');
        setLoading(false);
        return;
      }
      
      if (!productFormData.description.trim()) {
        setError('Product description is required');
        setLoading(false);
        return;
      }
      
      if (productFormData.description.trim().length < 10) {
        setError('Product description must be at least 10 characters');
        setLoading(false);
        return;
      }
      
      if (!productFormData.price || parseFloat(productFormData.price) <= 0) {
        setError('Valid price is required');
        setLoading(false);
        return;
      }
      
      if (!productFormData.category.trim()) {
        setError('Product category is required');
        setLoading(false);
        return;
      }
      
      if (!productFormData.brand.trim()) {
        setError('Product brand is required');
        setLoading(false);
        return;
      }
      
      if (!productFormData.stockQuantity || parseInt(productFormData.stockQuantity) < 0) {
        setError('Valid stock quantity is required');
        setLoading(false);
        return;
      }
      
      // Create FormData for API request
      const formData = new FormData();
      formData.append('name', productFormData.name);
      formData.append('description', productFormData.description);
      formData.append('price', productFormData.price);
      if (productFormData.originalPrice) {
        formData.append('originalPrice', productFormData.originalPrice);
      }
      formData.append('category', productFormData.category);
      formData.append('brand', productFormData.brand);
      formData.append('stockQuantity', productFormData.stockQuantity);
      formData.append('tags', productFormData.tags);
      formData.append('featured', productFormData.featured.toString());
      formData.append('bestSeller', productFormData.bestSeller.toString());
      formData.append('todaysDeals', productFormData.todaysDeals.toString());
      
      // Handle existing images (for editing)
      productFormData.images.forEach((image) => {
        formData.append('existingImages', image);
      });
      
      // Handle new image files
      productFormData.imageFiles.forEach((file) => {
        formData.append('images', file);
      });

      let result;
      if (editingProduct) {
        // Update existing product
        result = await apiService.updateProduct(editingProduct.id, formData);
      } else {
        // Create new product
        result = await apiService.createProduct(formData);
      }
      
      if (result.success) {
        // Clear product cache to ensure shop page gets fresh data
        cache.clear();
        
        // Refresh products list
        await fetchProducts();
        setShowProductForm(false);
        setEditingProduct(null);
        resetForm();
        
        // Show success message
        alert(`Product ${editingProduct ? 'updated' : 'created'} successfully!`);
      } else {
        setError(result.message || 'Failed to save product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      setError(error instanceof Error ? error.message : 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        originalPrice: product.originalPrice?.toString() || '',
        category: product.category,
        brand: product.brand,
        images: product.images || [],
        imageFiles: [],
        stockQuantity: product.stockQuantity?.toString() || '0',
        tags: product.tags?.join(', ') || '',
        featured: product.featured || false,
        bestSeller: product.bestSeller || false,
        todaysDeals: product.todaysDeals || false
      });
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiService.deleteProduct(productId);
        
        if (response.success) {
          // Clear product cache to ensure shop page gets fresh data
          cache.clear();
          
          // Refresh products list
          await fetchProducts();
        } else {
          setError(response.message || 'Failed to delete product');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        setError(error instanceof Error ? error.message : 'Failed to delete product');
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setProductFormData({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      category: '',
      brand: 'BBN',
      images: [],
      imageFiles: [],
      stockQuantity: '0',
      tags: '',
      featured: false,
      bestSeller: false,
      todaysDeals: false
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setProductFormData({
        ...productFormData,
        imageFiles: [...productFormData.imageFiles, ...newFiles]
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setProductFormData({
      ...productFormData,
      imageFiles: productFormData.imageFiles.filter((_, i) => i !== index)
    });
  };

  const handleRemoveExistingImage = (index: number) => {
    setProductFormData({
      ...productFormData,
      images: productFormData.images.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <div className="bg-dark-card border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin" 
                className="text-dark-text-secondary hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-dark-text">Product Management</h1>
                <p className="text-dark-text-secondary">Manage your product catalog</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchProducts}
                disabled={loading}
                className="bg-dark-gray text-dark-text px-4 py-2 rounded-lg hover:bg-hover-subtle hover:bg-opacity-50 transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => setShowProductForm(true)}
                disabled={loading}
                className="bg-gradient-to-r from-primary to-light-green text-dark font-semibold px-6 py-3 rounded-lg hover:from-dark-green hover:to-primary transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                <Plus className="w-5 h-5" />
                <span>Add Product</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-300 hover:text-red-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm text-dark-text-secondary">Total Products</p>
                <p className="text-2xl font-bold text-dark-text">{products.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
            <div className="flex items-center">
              <Star className="w-8 h-8 text-yellow-400" />
              <div className="ml-4">
                <p className="text-sm text-dark-text-secondary">Featured Products</p>
                <p className="text-2xl font-bold text-dark-text">{products.filter(p => p.featured).length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-green-400" />
              <div className="ml-4">
                <p className="text-sm text-dark-text-secondary">Best Sellers</p>
                <p className="text-2xl font-bold text-dark-text">{products.filter(p => p.bestSeller).length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm text-dark-text-secondary">Avg. Price</p>
                <p className="text-2xl font-bold text-dark-text">
                  ₹{Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-dark-card p-6 rounded-lg border border-gray-700 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-dark-text-secondary" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-gray border border-gray-600 rounded-lg text-dark-text placeholder-dark-text-secondary focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 bg-dark-gray border border-gray-600 rounded-lg text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option key="all-categories" value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <select
              value={filterBrand}
              onChange={(e) => setFilterBrand(e.target.value)}
              className="px-4 py-2 bg-dark-gray border border-gray-600 rounded-lg text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option key="all-brands" value="">All Brands</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
            
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterCategory('');
                setFilterBrand('');
              }}
              className="px-4 py-2 border border-gray-600 text-dark-text-secondary hover:text-primary hover:border-primary rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-dark-card rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-dark-gray">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-hover-subtle hover:bg-opacity-30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <div className="h-12 w-12 rounded-lg bg-gray-600 flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-dark-text">{product.name}</div>
                          <div className="text-sm text-dark-text-secondary">{product.brand}</div>
                          <div className="flex items-center space-x-2 mt-1">
                            {product.featured && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                Featured
                              </span>
                            )}
                            {product.bestSeller && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                Best Seller
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text">
                      <div>
                        <span className="font-semibold">₹{product.price}</span>
                        {product.originalPrice && (
                          <span className="ml-2 text-dark-text-secondary line-through">₹{product.originalPrice}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text">
                      {product.stockQuantity || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        product.inStock 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="text-primary hover:text-primary-dark transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Product Form Modal */}
      {showProductForm && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-300 my-4">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => {
                  setShowProductForm(false);
                  setEditingProduct(null);
                  resetForm();
                }}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {/* Error Display */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                    <p className="text-red-700 font-medium">Error</p>
                  </div>
                  <p className="text-red-600 mt-1">{error}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={productFormData.name}
                      onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter product name (min 2 characters)"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={productFormData.description}
                      onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter product description (min 10 characters)"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={productFormData.category}
                        onChange={(e) => setProductFormData({ ...productFormData, category: e.target.value })}
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option key="select-category" value="">Select Category</option>
                        <option key="protein" value="Protein">Protein</option>
                        <option key="pre-workout" value="Pre-Workout">Pre-Workout</option>
                        <option key="creatine" value="Creatine">Creatine</option>
                        <option key="amino-acids" value="Amino Acids">Amino Acids</option>
                        <option key="vitamins" value="Vitamins">Vitamins</option>
                        <option key="omega-3" value="Omega-3">Omega-3</option>
                        <option key="mass-gainer" value="Mass Gainer">Mass Gainer</option>
                        <option key="fat-burners" value="Fat Burners">Fat Burners</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Brand <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={productFormData.brand}
                        onChange={(e) => setProductFormData({ ...productFormData, brand: e.target.value })}
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter brand name"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma separated)</label>
                    <input
                      type="text"
                      value={productFormData.tags}
                      onChange={(e) => setProductFormData({ ...productFormData, tags: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g. protein, muscle building, recovery"
                    />
                  </div>
                </div>
                
                {/* Pricing and Inventory */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing & Inventory</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price (₹) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={productFormData.price}
                        onChange={(e) => setProductFormData({ ...productFormData, price: e.target.value })}
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Original Price (₹)</label>
                      <input
                        type="number"
                        value={productFormData.originalPrice}
                        onChange={(e) => setProductFormData({ ...productFormData, originalPrice: e.target.value })}
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00 (optional)"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={productFormData.stockQuantity}
                      onChange={(e) => {
                        const quantity = Math.max(0, parseInt(e.target.value) || 0);
                        const inStock = quantity > 0;
                        setProductFormData({ 
                          ...productFormData, 
                          stockQuantity: quantity.toString()
                        });
                      }}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Stock Status: <span className={`font-medium ${productFormData.stockQuantity && parseInt(productFormData.stockQuantity) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {productFormData.stockQuantity && parseInt(productFormData.stockQuantity) > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </p>
                  </div>
                  
                  {/* Product Images */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                    
                    {/* Existing Images (for editing) */}
                    {productFormData.images.length > 0 && (
                      <div className="mb-4">
                        <h5 className="text-sm text-gray-600 mb-2">Current Images:</h5>
                        <div className="space-y-2">
                          {productFormData.images.map((image, index) => (
                            <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                              <img src={image} alt={`Product ${index + 1}`} className="w-12 h-12 object-cover rounded" />
                              <span className="flex-1 text-sm text-gray-900 truncate">{image}</span>
                              <button
                                onClick={() => handleRemoveExistingImage(index)}
                                className="p-1 text-red-500 hover:text-red-700 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* New Image Files */}
                    {productFormData.imageFiles.length > 0 && (
                      <div className="mb-4">
                        <h5 className="text-sm text-gray-600 mb-2">New Images to Upload:</h5>
                        <div className="space-y-2">
                          {productFormData.imageFiles.map((file, index) => (
                            <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                              <img 
                                src={URL.createObjectURL(file)} 
                                alt={`New ${index + 1}`} 
                                className="w-12 h-12 object-cover rounded" 
                              />
                              <span className="flex-1 text-sm text-gray-900 truncate">{file.name}</span>
                              <span className="text-xs text-gray-600">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                              <button
                                onClick={() => handleRemoveImage(index)}
                                className="p-1 text-red-500 hover:text-red-700 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* File Upload Input */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                      <input
                        type="file"
                        id="image-upload"
                        multiple
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer flex flex-col items-center space-y-2"
                      >
                        <Upload className="w-8 h-8 text-gray-500" />
                        <span className="text-gray-700">Click to upload images</span>
                        <span className="text-xs text-gray-500">PNG, JPG, JPEG up to 5MB each (max 5 files)</span>
                      </label>
                    </div>
                  </div>
                  
                  {/* Product Flags */}
                  <div className="space-y-3">
                    <h4 className="text-md font-medium text-gray-900">Product Flags</h4>
                    

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={productFormData.featured}
                        onChange={(e) => setProductFormData({ ...productFormData, featured: e.target.checked })}
                        className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <label htmlFor="featured" className="text-sm text-gray-900">Featured Product</label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="bestSeller"
                        checked={productFormData.bestSeller}
                        onChange={(e) => setProductFormData({ ...productFormData, bestSeller: e.target.checked })}
                        className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <label htmlFor="bestSeller" className="text-sm text-gray-900">Best Seller</label>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="todaysDeals"
                        checked={productFormData.todaysDeals}
                        onChange={(e) => setProductFormData({ ...productFormData, todaysDeals: e.target.checked })}
                        className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <label htmlFor="todaysDeals" className="text-sm text-gray-900">Today&apos;s Deals</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowProductForm(false);
                  setEditingProduct(null);
                  resetForm();
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 hover:text-gray-900 hover:border-gray-400 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProduct}
                disabled={loading}
                className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Saving...' : 'Save Product'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}