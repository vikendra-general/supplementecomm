'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/utils/api';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign,
  Eye,
  Plus,
  BarChart3,
  AlertTriangle,
  Edit,
  Trash2,
  LogOut,
  Settings,
  X
} from 'lucide-react';
import Link from 'next/link';
import { Product, Order } from '@/types';
import AdminGuide from '@/components/admin/AdminGuide';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
}

interface RecentOrder {
  _id: string;
  orderNumber: string;
  user: {
    name: string;
    email: string;
    phone?: string;
  };
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  items: Array<{
    product: {
      name: string;
    };
    quantity: number;
  }>;
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

interface TopProduct {
  _id: string;
  product: {
    name: string;
    images: string[];
    stock: number;
  };
  totalSold: number;
  totalRevenue: number;
}

interface MonthlyRevenue {
  _id: string;
  revenue: number;
  orders: number;
}

export default function AdminDashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Product Management State
  const [products, setProducts] = useState<Product[]>([]);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productFormData, setProductFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    brand: '',
    images: [] as string[]
  });

  // Order Management State
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Inventory State
  const [inventoryData, setInventoryData] = useState<Product[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getAdminDashboard();
      
      if (response.success && response.data) {
        interface DashboardData {
          stats: {
            totalUsers: number;
            totalProducts: number;
            totalOrders: number;
            totalRevenue: number;
          };
          recentOrders: RecentOrder[];
          topProducts: TopProduct[];
          monthlyRevenue: MonthlyRevenue[];
        }
        
        const data = response.data as DashboardData;
        setStats(data.stats);
        setRecentOrders(data.recentOrders);
        setTopProducts(data.topProducts);
        setMonthlyRevenue(data.monthlyRevenue);
      }
    } catch (error: unknown) {
      console.error('Error fetching dashboard data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await apiService.getProducts({ limit: 50 });
      if (response.success && response.data) {
        setProducts(response.data);
        setInventoryData(response.data);
        // Consider products with stock less than 10 as low stock
        setLowStockProducts(response.data.filter(product => 
          !product.inStock || (product.stockQuantity !== undefined && product.stockQuantity < 10)
        ));
      }
    } catch (error: unknown) {
      console.error('Error fetching products:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch products');
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await apiService.getAdminOrders({ limit: 50 });
      if (response.success && response.data) {
        setOrders(response.data as Order[]);
      }
    } catch (error: unknown) {
      console.error('Error fetching orders:', error);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      return;
    }

    fetchDashboardData();
    fetchProducts();
    fetchOrders();
  }, [isAuthenticated, user, fetchDashboardData, fetchProducts, fetchOrders]);

  // Product Management Functions
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', productFormData.name);
      formData.append('description', productFormData.description);
      formData.append('price', productFormData.price);
      formData.append('stockQuantity', productFormData.stock); // Changed from 'stock' to 'stockQuantity'
      formData.append('category', productFormData.category);
      formData.append('brand', productFormData.brand);
      
      // Handle image uploads
      if (productFormData.images && productFormData.images.length > 0) {
        productFormData.images.forEach((image, index) => {
          formData.append(`images`, image);
        });
      }
      
      if (editingProduct) {
        await apiService.updateProduct(editingProduct.id, formData);
      } else {
        await apiService.createProduct(formData);
      }
      
      setShowProductForm(false);
      setEditingProduct(null);
      setProductFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        brand: '',
        images: []
      });
      fetchProducts();
    } catch (error: unknown) {
      console.error('Error saving product:', error);
      setError(error instanceof Error ? error.message : 'Failed to save product');
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stockQuantity ? product.stockQuantity.toString() : '0',
      category: product.category,
      brand: product.brand,
      images: product.images || []
    });
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await apiService.deleteProduct(productId);
        fetchProducts();
      } catch (error: unknown) {
        console.error('Error deleting product:', error);
      }
    }
  };

  // Order Management Functions
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await apiService.updateOrderStatus(orderId, status);
      fetchOrders();
    } catch (error: unknown) {
      console.error('Error updating order status:', error);
    }
  };

  // Redirect if not admin
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg border border-green-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-8">You need to be logged in to access this page.</p>
          <Link 
            href="/login?redirect=/admin" 
            className="btn-primary inline-flex items-center"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg border border-green-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-8">You don&apos;t have permission to access the admin dashboard.</p>
          <p className="text-gray-500 text-sm">If you believe you should have admin access, please contact support.</p>
          <div className="mt-6">
            <Link href="/" className="btn-outline inline-flex items-center">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg border border-red-200">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-green-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowProductForm(true)}
                className="btn-primary inline-flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </button>
              <button
                onClick={logout}
                className="btn-outline inline-flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
              {/* Admin Guide */}
              <AdminGuide />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalProducts || 0}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalOrders || 0}</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats?.totalRevenue || 0)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Management Section */}
        <div className="card mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Product Management</h2>
              <button
                onClick={() => setShowProductForm(true)}
                className="btn-primary inline-flex items-center text-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 rounded-lg mr-3"></div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.brand}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                          <span className="text-xs text-gray-500 mt-1">
                            Qty: {product.stockQuantity !== undefined ? product.stockQuantity : 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-900"
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

        {/* Inventory Overview */}
        <div className="card mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Inventory Overview</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-4">Low Stock Products</h3>
                <div className="space-y-3">
                  {lowStockProducts.slice(0, 5).map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-600">{product.brand}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-semibold ${!product.inStock ? 'text-red-600' : 'text-orange-600'}`}>
                          {!product.inStock ? 'Out of Stock' : 'Low Stock'}
                        </span>
                        {product.stockQuantity !== undefined && (
                          <p className="text-xs text-gray-600">Qty: {product.stockQuantity}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-4">Stock Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                    <span className="text-gray-900">In Stock</span>
                    <span className="text-green-600 font-semibold">
                      {inventoryData.filter(p => p.inStock).length} products
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <span className="text-gray-900">Out of Stock</span>
                    <span className="text-red-600 font-semibold">
                      {inventoryData.filter(p => !p.inStock).length} products
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <span className="text-gray-900">Low Stock</span>
                    <span className="text-orange-600 font-semibold">
                      {inventoryData.filter(p => p.inStock && p.stockQuantity !== undefined && p.stockQuantity < 10).length} products
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Management */}
        <div className="card mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Order Management</h2>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.slice(0, 10).map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                        <div className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.user}</div>
                        <div className="text-sm text-gray-500">{order.shippingAddress?.city}, {order.shippingAddress?.state}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setShowOrderDetails(true);
                            }}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1 focus-green"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link 
              href="/admin/products"
              className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
            >
              <Package className="w-5 h-5 text-green-600 mr-3" />
              <span className="font-medium text-green-900">Manage Products</span>
            </Link>
            
            <Link 
              href="/admin/orders"
              className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
            >
              <ShoppingCart className="w-5 h-5 text-green-600 mr-3" />
              <span className="font-medium text-green-900">Manage Orders</span>
            </Link>
            
            <Link 
              href="/admin/users"
              className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
            >
              <Users className="w-5 h-5 text-green-600 mr-3" />
              <span className="font-medium text-green-900">Manage Users</span>
            </Link>
            
            <Link 
              href="/admin/analytics"
              className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
            >
              <BarChart3 className="w-5 h-5 text-green-600 mr-3" />
              <span className="font-medium text-green-900">View Analytics</span>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Product Form Modal */}
      {showProductForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => {
                  setShowProductForm(false);
                  setEditingProduct(null);
                  setProductFormData({
                    name: '',
                    description: '',
                    price: '',
                    stock: '',
                    category: '',
                    brand: '',
                    images: []
                  });
                }}
                className="p-1 rounded-full hover:bg-gray-100"
                aria-label="Close form"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleProductSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={productFormData.name}
                      onChange={(e) => setProductFormData({...productFormData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      value={productFormData.description}
                      onChange={(e) => setProductFormData({...productFormData, description: e.target.value})}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                        Price (₹) *
                      </label>
                      <input
                        type="number"
                        id="price"
                        value={productFormData.price}
                        onChange={(e) => setProductFormData({...productFormData, price: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                        Stock Quantity *
                      </label>
                      <input
                        type="number"
                        id="stock"
                        value={productFormData.stock}
                        onChange={(e) => setProductFormData({...productFormData, stock: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        id="category"
                        value={productFormData.category}
                        onChange={(e) => setProductFormData({...productFormData, category: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      >
                        <option value="">Select Category</option>
                        <option value="protein">Protein</option>
                        <option value="pre-workout">Pre-Workout</option>
                        <option value="creatine">Creatine</option>
                        <option value="amino acids">Amino Acids</option>
                        <option value="vitamins">Vitamins</option>
                        <option value="omega-3">Omega-3</option>
                        <option value="mass gainer">Mass Gainer</option>
                        <option value="fat burners">Fat Burners</option>
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                        Brand *
                      </label>
                      <input
                        type="text"
                        id="brand"
                        value={productFormData.brand}
                        onChange={(e) => setProductFormData({...productFormData, brand: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product Images
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                          aria-hidden="true"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                          >
                            <span>Upload images</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProductForm(false);
                      setEditingProduct(null);
                      setProductFormData({
                        name: '',
                        description: '',
                        price: '',
                        stock: '',
                        category: '',
                        brand: '',
                        images: []
                      });
                    }}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                  >
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}