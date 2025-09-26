'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'next/navigation';
import { apiService } from '@/utils/api';
import { 
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  PieChart,
  Activity,
  Star,
  AlertTriangle,
  RefreshCw,
  Download
} from 'lucide-react';
import Link from 'next/link';

interface AnalyticsData {
  totalRevenue: number;
  revenueGrowth: number;
  totalOrders: number;
  ordersGrowth: number;
  totalCustomers: number;
  customersGrowth: number;
  totalProducts: number;
  productsGrowth: number;
  averageOrderValue: number;
  conversionRate: number;
  topSellingProducts: {
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }[];
  revenueByMonth: {
    month: string;
    revenue: number;
    orders: number;
  }[];
  ordersByStatus: {
    status: string;
    count: number;
    percentage: number;
  }[];
  topCategories: {
    category: string;
    sales: number;
    revenue: number;
  }[];
  lowStockProducts?: {
    _id: string;
    name: string;
    stockQuantity: number;
  }[];
  outOfStockProducts?: {
    _id: string;
    name: string;
  }[];
}

// Mock analytics data


export default function AdminAnalyticsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading analytics...</div>}>
      <AdminAnalyticsContent />
    </Suspense>
  );
}

function AdminAnalyticsContent() {
  const { user, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('12months');
  const [refreshing, setRefreshing] = useState(false);

  // Handle URL parameters
  useEffect(() => {
    const view = searchParams.get('view');
    const action = searchParams.get('action');
    
    // URL parameters are available but not currently used
    // Can be implemented later for view switching and export functionality
  }, [searchParams]);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getAnalytics(timeRange);
      if (response.success && response.data) {
        setAnalytics(response.data as AnalyticsData);
      } else {
        setError('Failed to fetch analytics data');
        setAnalytics(null);
      }
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError('Failed to load analytics data. Please check your connection and try again.');
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchAnalytics();
    }
  }, [isAuthenticated, user, timeRange, fetchAnalytics]);

  const handleTimeRangeChange = (newRange: string) => {
    setTimeRange(newRange);
  };

  // Redirect if not admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <div className="text-center bg-dark-card p-8 rounded-lg shadow-lg border border-gray-700">
          <h1 className="text-3xl font-bold text-dark-text mb-4">Access Denied</h1>
          <p className="text-dark-text-secondary mb-8">You need admin privileges to access this page.</p>
          <Link 
            href="/login?redirect=/admin/analytics" 
            className="bg-gradient-to-r from-primary to-light-green text-dark font-semibold px-6 py-3 rounded-lg hover:from-dark-green hover:to-primary transition-all"
          >
            Login as Admin
          </Link>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <div className="text-center bg-dark-card p-8 rounded-lg shadow-lg border border-gray-700">
          <RefreshCw className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
          <h1 className="text-3xl font-bold text-dark-text mb-4">Loading Analytics</h1>
          <p className="text-dark-text-secondary">Please wait while we fetch your analytics data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-bg">
        <div className="text-center bg-dark-card p-8 rounded-lg shadow-lg border border-gray-700">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-dark-text mb-4">Error Loading Analytics</h1>
          <p className="text-dark-text-secondary mb-8">{error}</p>
          <button 
            onClick={handleRefresh} 
            className="bg-gradient-to-r from-primary to-light-green text-dark font-semibold px-6 py-3 rounded-lg hover:from-dark-green hover:to-primary transition-all inline-flex items-center"
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Retrying...' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  // Ensure analytics data exists
  if (!analytics) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <TrendingUp className="w-4 h-4 text-green-400" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-400" />
    );
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-400' : 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <div className="bg-dark-card border-b border-blue-700">
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
                <h1 className="text-3xl font-bold text-dark-text">Analytics Dashboard</h1>
                <p className="text-dark-text-secondary">Business insights and performance metrics</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {error && (
                <div className="flex items-center space-x-2 text-red-400 text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Using cached data</span>
                </div>
              )}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-4 py-2 bg-blue-900/20 border border-blue-600 rounded-lg text-dark-text hover:bg-blue-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <select
                value={timeRange}
                onChange={(e) => handleTimeRangeChange(e.target.value)}
                className="px-4 py-2 bg-blue-900/20 border border-blue-600 rounded-lg text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="12months">Last 12 Months</option>
              </select>
              <button
                className="px-4 py-2 bg-primary text-dark rounded-lg hover:bg-dark-green transition-colors inline-flex items-center"
                onClick={() => window.print()}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-dark-card p-6 rounded-lg border border-blue-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dark-text-secondary">Total Revenue</p>
                <p className="text-2xl font-bold text-dark-text">{formatCurrency(analytics.totalRevenue)}</p>
                <div className="flex items-center space-x-1 mt-2">
                  {getGrowthIcon(analytics.revenueGrowth)}
                  <span className={`text-sm font-medium ${getGrowthColor(analytics.revenueGrowth)}`}>
                    {analytics.revenueGrowth > 0 ? '+' : ''}{analytics.revenueGrowth}%
                  </span>
                  <span className="text-xs text-dark-text-secondary">vs last period</span>
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-primary" />
            </div>
          </div>

          <div className="bg-dark-card p-6 rounded-lg border border-blue-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dark-text-secondary">Total Orders</p>
                <p className="text-2xl font-bold text-dark-text">{formatNumber(analytics.totalOrders)}</p>
                <div className="flex items-center space-x-1 mt-2">
                  {getGrowthIcon(analytics.ordersGrowth)}
                  <span className={`text-sm font-medium ${getGrowthColor(analytics.ordersGrowth)}`}>
                    {analytics.ordersGrowth > 0 ? '+' : ''}{analytics.ordersGrowth}%
                  </span>
                  <span className="text-xs text-dark-text-secondary">vs last period</span>
                </div>
              </div>
              <ShoppingCart className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-dark-card p-6 rounded-lg border border-blue-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dark-text-secondary">Total Customers</p>
                <p className="text-2xl font-bold text-dark-text">{formatNumber(analytics.totalCustomers)}</p>
                <div className="flex items-center space-x-1 mt-2">
                  {getGrowthIcon(analytics.customersGrowth)}
                  <span className={`text-sm font-medium ${getGrowthColor(analytics.customersGrowth)}`}>
                    {analytics.customersGrowth > 0 ? '+' : ''}{analytics.customersGrowth}%
                  </span>
                  <span className="text-xs text-dark-text-secondary">vs last period</span>
                </div>
              </div>
              <Users className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-dark-card p-6 rounded-lg border border-blue-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dark-text-secondary">Avg. Order Value</p>
                <p className="text-2xl font-bold text-dark-text">{formatCurrency(analytics.averageOrderValue)}</p>
                <div className="flex items-center space-x-1 mt-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-medium text-purple-400">
                    {analytics.conversionRate}%
                  </span>
                  <span className="text-xs text-dark-text-secondary">conversion rate</span>
                </div>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <div className="bg-dark-card p-6 rounded-lg border border-blue-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-dark-text">Revenue Trend</h3>
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-4">
              {analytics.revenueByMonth.slice(-6).map((data) => (
                <div key={data.month} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-dark-text-secondary w-8">{data.month}</span>
                    <div className="flex-1 bg-blue-900/20 rounded-full h-2 max-w-xs">
                      <div 
                        className="bg-gradient-to-r from-primary to-light-green h-2 rounded-full"
                        style={{ width: `${(data.revenue / 20000) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-dark-text">{formatCurrency(data.revenue)}</p>
                    <p className="text-xs text-dark-text-secondary">{data.orders} orders</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Status Distribution */}
          <div className="bg-dark-card p-6 rounded-lg border border-blue-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-dark-text">Order Status Distribution</h3>
              <PieChart className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-4">
              {analytics.ordersByStatus.map((status, index) => {
                const colors = [
                  'bg-green-500',
                  'bg-blue-500', 
                  'bg-purple-500',
                  'bg-yellow-500',
                  'bg-red-500'
                ];
                return (
                  <div key={status.status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${colors[index]}`} />
                      <span className="text-sm text-dark-text">{status.status}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-dark-text">{status.count}</p>
                      <p className="text-xs text-dark-text-secondary">{status.percentage}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tables Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Selling Products */}
          <div className="bg-dark-card p-6 rounded-lg border border-blue-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-dark-text">Top Selling Products</h3>
              <Star className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-4">
              {analytics.topSellingProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-blue-900/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary to-light-green rounded-lg flex items-center justify-center">
                      <span className="text-dark font-bold text-xs">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-dark-text">{product.name}</p>
                      <p className="text-xs text-dark-text-secondary">{product.sales} units sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">{formatCurrency(product.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Categories */}
          <div className="bg-dark-card p-6 rounded-lg border border-blue-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-dark-text">Top Categories</h3>
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-4">
              {analytics.topCategories.map((category, categoryIndex) => (
                <div key={category.category} className="flex items-center justify-between p-3 bg-blue-900/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary to-light-green rounded-lg flex items-center justify-center">
                      <span className="text-dark font-bold text-xs">{categoryIndex + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-dark-text">{category.category}</p>
                      <p className="text-xs text-dark-text-secondary">{category.sales} units sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">{formatCurrency(category.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Inventory Alerts */}
        {(analytics.lowStockProducts?.length || analytics.outOfStockProducts?.length) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* Low Stock Alerts */}
            {analytics.lowStockProducts && analytics.lowStockProducts.length > 0 && (
              <div className="bg-dark-card p-6 rounded-lg border border-blue-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-dark-text">Low Stock Alerts</h3>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm text-yellow-500 font-medium">{analytics.lowStockProducts.length} items</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {analytics.lowStockProducts.slice(0, 5).map((product) => (
                    <div key={product._id} className="flex items-center justify-between p-3 bg-blue-900/20 rounded-lg border-l-4 border-yellow-500">
                      <div>
                        <p className="text-sm font-medium text-dark-text">{product.name}</p>
                        <p className="text-xs text-dark-text-secondary">Stock running low</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-yellow-500">{product.stockQuantity} left</p>
                        <p className="text-xs text-dark-text-secondary">Reorder soon</p>
                      </div>
                    </div>
                  ))}
                </div>
                {analytics.lowStockProducts.length > 5 && (
                  <div className="mt-4 text-center">
                    <Link 
                      href="/admin/products?filter=lowStock" 
                      className="text-primary hover:text-light-green text-sm font-medium"
                    >
                      View all {analytics.lowStockProducts.length} low stock items →
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Out of Stock Alerts */}
            {analytics.outOfStockProducts && analytics.outOfStockProducts.length > 0 && (
              <div className="bg-dark-card p-6 rounded-lg border border-blue-700">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-dark-text">Out of Stock</h3>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <span className="text-sm text-red-500 font-medium">{analytics.outOfStockProducts.length} items</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {analytics.outOfStockProducts.slice(0, 5).map((product) => (
                    <div key={product._id} className="flex items-center justify-between p-3 bg-blue-900/20 rounded-lg border-l-4 border-red-500">
                      <div>
                        <p className="text-sm font-medium text-dark-text">{product.name}</p>
                        <p className="text-xs text-dark-text-secondary">Currently unavailable</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-red-500">0 in stock</p>
                        <p className="text-xs text-dark-text-secondary">Restock needed</p>
                      </div>
                    </div>
                  ))}
                </div>
                {analytics.outOfStockProducts.length > 5 && (
                  <div className="mt-4 text-center">
                    <Link 
                      href="/admin/products?filter=outOfStock" 
                      className="text-primary hover:text-light-green text-sm font-medium"
                    >
                      View all {analytics.outOfStockProducts.length} out of stock items →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Performance Insights */}
        <div className="mt-8 bg-dark-card p-6 rounded-lg border border-blue-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-dark-text">Performance Insights</h3>
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-primary mb-2">{analytics.conversionRate.toFixed(1)}%</div>
              <div className="text-sm text-dark-text-secondary">Conversion Rate</div>
              <div className="text-xs text-dark-text-secondary mt-1">Orders per customer</div>
            </div>
            <div className="text-center p-4 bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-primary mb-2">{formatCurrency(analytics.averageOrderValue)}</div>
              <div className="text-sm text-dark-text-secondary">Avg. Order Value</div>
              <div className="text-xs text-dark-text-secondary mt-1">Revenue per order</div>
            </div>
            <div className="text-center p-4 bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-primary mb-2">{analytics.totalProducts}</div>
              <div className="text-sm text-dark-text-secondary">Total Products</div>
              <div className="text-xs text-dark-text-secondary mt-1">In catalog</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}