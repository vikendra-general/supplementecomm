'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/utils/api';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import {
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  TrendingDown,
  Eye,
  ArrowUpRight,
  Settings
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  revenueGrowth?: number;
  ordersGrowth?: number;
  usersGrowth?: number;
}

interface RecentOrder {
  _id: string;
  orderNumber: string;
  user: {
    name: string;
    email: string;
  };
  total: number;
  status: string;
  createdAt: string;
}

interface TopProduct {
  _id: string;
  product: {
    name: string;
    images: string[];
  };
  totalSold: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7days');

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchDashboardData();
    }
  }, [isAuthenticated, user, timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminDashboard();
      if (response.success && response.data) {
        const data = response.data as {
          stats?: DashboardStats;
          recentOrders?: RecentOrder[];
          topProducts?: TopProduct[];
        };
        setStats(data.stats || {} as DashboardStats);
        setRecentOrders(data.recentOrders || []);
        setTopProducts(data.topProducts || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'shipped':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const StatCard = ({ title, value, icon: Icon, growth, color }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<{ className?: string }>;
    growth?: number;
    color: string;
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {growth !== undefined && (
            <div className="flex items-center mt-2">
              {growth >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                growth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500 ml-1">vs last period</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  // Show loading state while user is being loaded
  if (!user) {
    return (
      <AdminProtectedRoute>
        <AdminLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading dashboard...</p>
            </div>
          </div>
        </AdminLayout>
      </AdminProtectedRoute>
    );
  }

  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Admin Mode Banner */}
          <div className="bg-green-50 rounded-lg p-4 mb-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 rounded-full p-2">
                  <Settings className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-green-900 font-semibold text-lg">Administrator Dashboard</h2>
                  <p className="text-green-700 text-sm">You are logged in as an administrator - manage your website, not place orders</p>
                </div>
              </div>
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Admin Mode
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-black">Website Management Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user?.name} - Manage your BBN Nutrition website</p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="7days">Last 7 days</option>
                <option value="30days">Last 30 days</option>
                <option value="90days">Last 90 days</option>
              </select>
              <button className="px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium">
                Export Report
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Revenue"
              value={formatCurrency(stats?.totalRevenue || 0)}
              icon={DollarSign}
              growth={stats?.revenueGrowth}
              color="bg-green-50"
            />
            <StatCard
              title="Total Orders"
              value={stats?.totalOrders || 0}
              icon={ShoppingCart}
              growth={stats?.ordersGrowth}
              color="bg-blue-50"
            />
            <StatCard
              title="Total Users"
              value={stats?.totalUsers || 0}
              icon={Users}
              growth={stats?.usersGrowth}
              color="bg-purple-50"
            />
            <StatCard
              title="Total Products"
              value={stats?.totalProducts || 0}
              icon={Package}
              color="bg-orange-50"
            />
          </div>

          {/* All Admin Tools & Features */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">All Admin Tools & Features</h2>
                <p className="text-gray-600 mt-1">Complete access to all administrative functions</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* PRODUCT OPERATIONS */}
              <div className="space-y-4 h-full">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-3 mb-4">PRODUCT OPERATIONS</h3>
                <div className="space-y-3 flex-1">
                  <Link href="/admin/products" className="flex items-center text-sm text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-200 p-2 rounded-md group">
                    <span className="mr-3 text-green-500 group-hover:text-green-600 font-medium">→</span> 
                    <span className="font-medium">View All Products</span>
                  </Link>
                  <Link href="/admin/products?action=add" className="flex items-center text-sm text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-200 p-2 rounded-md group">
                    <span className="mr-3 text-green-500 group-hover:text-green-600 font-medium">→</span> 
                    <span className="font-medium">Add New Product</span>
                  </Link>
                  <Link href="/admin/products?view=inventory" className="flex items-center text-sm text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-200 p-2 rounded-md group">
                    <span className="mr-3 text-green-500 group-hover:text-green-600 font-medium">→</span> 
                    <span className="font-medium">Manage Inventory</span>
                  </Link>
                  <Link href="/admin/products?view=categories" className="flex items-center text-sm text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-200 p-2 rounded-md group">
                    <span className="mr-3 text-green-500 group-hover:text-green-600 font-medium">→</span> 
                    <span className="font-medium">Product Categories</span>
                  </Link>
                  <Link href="/admin/products?view=bulk" className="flex items-center text-sm text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-200 p-2 rounded-md group">
                    <span className="mr-3 text-green-500 group-hover:text-green-600 font-medium">→</span> 
                    <span className="font-medium">Bulk Operations</span>
                  </Link>
                </div>
              </div>

              {/* ORDER MANAGEMENT */}
              <div className="space-y-4 h-full">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-3 mb-4">ORDER MANAGEMENT</h3>
                <div className="space-y-3 flex-1">
                  <Link href="/admin/orders" className="flex items-center text-sm text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-200 p-2 rounded-md group">
                    <span className="mr-3 text-green-500 group-hover:text-green-600 font-medium">→</span> 
                    <span className="font-medium">All Orders</span>
                  </Link>
                  <Link href="/admin/orders?status=pending" className="flex items-center text-sm text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-200 p-2 rounded-md group">
                    <span className="mr-3 text-green-500 group-hover:text-green-600 font-medium">→</span> 
                    <span className="font-medium">Pending Orders</span>
                  </Link>
                  <Link href="/admin/orders?status=processing" className="flex items-center text-sm text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-200 p-2 rounded-md group">
                    <span className="mr-3 text-green-500 group-hover:text-green-600 font-medium">→</span> 
                    <span className="font-medium">Processing Orders</span>
                  </Link>
                  <Link href="/admin/orders?status=shipped" className="flex items-center text-sm text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-200 p-2 rounded-md group">
                    <span className="mr-3 text-green-500 group-hover:text-green-600 font-medium">→</span> 
                    <span className="font-medium">Shipped Orders</span>
                  </Link>
                  <Link href="/admin/orders?view=refunds" className="flex items-center text-sm text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-200 p-2 rounded-md group">
                    <span className="mr-3 text-green-500 group-hover:text-green-600 font-medium">→</span> 
                    <span className="font-medium">Refunds & Returns</span>
                  </Link>
                </div>
              </div>

              {/* USER MANAGEMENT */}
              <div className="space-y-4 h-full mt-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-3 mb-4">USER MANAGEMENT</h3>
                <div className="space-y-3 flex-1">
                  <Link href="/admin/users" className="flex items-center text-sm text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-200 p-2 rounded-md group">
                    <span className="mr-3 text-green-500 group-hover:text-green-600 font-medium">→</span> 
                    <span className="font-medium">All Users</span>
                  </Link>
                  <Link href="/admin/users?action=add" className="flex items-center text-sm text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-200 p-2 rounded-md group">
                    <span className="mr-3 text-green-500 group-hover:text-green-600 font-medium">→</span> 
                    <span className="font-medium">Add New User</span>
                  </Link>
                  <Link href="/admin/users?role=customer" className="flex items-center text-sm text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-200 p-2 rounded-md group">
                    <span className="mr-3 text-green-500 group-hover:text-green-600 font-medium">→</span> 
                    <span className="font-medium">Customers</span>
                  </Link>
                  <Link href="/admin/users?role=admin" className="flex items-center text-sm text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-200 p-2 rounded-md group">
                    <span className="mr-3 text-green-500 group-hover:text-green-600 font-medium">→</span> 
                    <span className="font-medium">Admin Users</span>
                  </Link>
                  <Link href="/admin/users?view=permissions" className="flex items-center text-sm text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-200 p-2 rounded-md group">
                    <span className="mr-3 text-green-500 group-hover:text-green-600 font-medium">→</span> 
                    <span className="font-medium">User Permissions</span>
                  </Link>
                </div>
              </div>

              {/* ANALYTICS & REPORTS */}
              <div className="space-y-4 h-full">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-3 mb-4">ANALYTICS & REPORTS</h3>
                <div className="space-y-3 flex-1">
                  <Link href="/admin/analytics" className="flex items-center text-sm text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-200 p-2 rounded-md group">
                    <span className="mr-3 text-green-500 group-hover:text-green-600 font-medium">→</span> 
                    <span className="font-medium">Analytics Dashboard</span>
                  </Link>
                  <Link href="/admin/analytics?view=sales" className="flex items-center text-sm text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-200 p-2 rounded-md group">
                    <span className="mr-3 text-green-500 group-hover:text-green-600 font-medium">→</span> 
                    <span className="font-medium">Sales Reports</span>
                  </Link>
                  <Link href="/admin/analytics?view=performance" className="flex items-center text-sm text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-200 p-2 rounded-md group">
                    <span className="mr-3 text-green-500 group-hover:text-green-600 font-medium">→</span> 
                    <span className="font-medium">Product Performance</span>
                  </Link>
                  <Link href="/admin/analytics?view=customers" className="flex items-center text-sm text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-200 p-2 rounded-md group">
                    <span className="mr-3 text-green-500 group-hover:text-green-600 font-medium">→</span> 
                    <span className="font-medium">Customer Analytics</span>
                  </Link>
                  <Link href="/admin/analytics?action=export" className="flex items-center text-sm text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all duration-200 p-2 rounded-md group">
                    <span className="mr-3 text-green-500 group-hover:text-green-600 font-medium">→</span> 
                    <span className="font-medium">Export Reports</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders and Top Products */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                  <Link
                    href="/admin/orders"
                    className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center"
                  >
                    View all
                    <ArrowUpRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {recentOrders.slice(0, 5).map((order) => (
                      <div key={order._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <ShoppingCart className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">#{order.orderNumber}</p>
                            <p className="text-xs text-gray-500">{order.user?.name || 'Unknown User'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{formatCurrency(order.total)}</p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No recent orders</p>
                  </div>
                )}
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
                  <Link
                    href="/admin/products"
                    className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center"
                  >
                    View all
                    <ArrowUpRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-200 rounded"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : topProducts.length > 0 ? (
                  <div className="space-y-4">
                    {topProducts.slice(0, 5).map((item, index) => (
                      <div key={item._id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-bold text-gray-600">#{index + 1}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.product?.name || 'Unknown Product'}</p>
                            <p className="text-xs text-gray-500">{item.totalSold} sold</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{formatCurrency(item.totalRevenue)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No product data</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
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
                className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
              >
                <ShoppingCart className="w-5 h-5 text-blue-600 mr-3" />
                <span className="font-medium text-blue-900">View Orders</span>
              </Link>
              <Link
                href="/admin/users"
                className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors border border-purple-200"
              >
                <Users className="w-5 h-5 text-purple-600 mr-3" />
                <span className="font-medium text-purple-900">Manage Users</span>
              </Link>
              <Link
                href="/admin/analytics"
                className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors border border-orange-200"
              >
                <Eye className="w-5 h-5 text-orange-600 mr-3" />
                <span className="font-medium text-orange-900">View Analytics</span>
              </Link>
            </div>
          </div>
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}