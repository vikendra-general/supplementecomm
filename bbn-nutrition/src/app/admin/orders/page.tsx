'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/utils/api';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import { 
  ArrowLeft,
  Search,
  Eye,
  Package,
  Edit,
  Trash2,
  Save,
  X
} from 'lucide-react';
import Link from 'next/link';

interface OrderItem {
  product: { name: string };
  quantity: number;
  price: number;
}

interface Address {
  address: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  user: {
    name: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingAddress: Address;
  billingAddress: Address;
  trackingNumber: string | null;
  estimatedDelivery: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminOrdersPage() {
  return (
    <AdminProtectedRoute>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading orders...</div>}>
        <AdminOrdersContent />
      </Suspense>
    </AdminProtectedRoute>
  );
}

function AdminOrdersContent() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [updating, setUpdating] = useState(false);
  const [currentView, setCurrentView] = useState('orders');
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<'status' | 'payment' | null>(null);
  const [tempStatus, setTempStatus] = useState('');
  const [tempPaymentStatus, setTempPaymentStatus] = useState('');

  // Handle URL parameters for filtering
  useEffect(() => {
    const status = searchParams.get('status');
    const view = searchParams.get('view');
    
    if (status) {
      setStatusFilter(status);
    }
    
    if (view === 'refunds') {
      setCurrentView('refunds');
      setPaymentFilter('refunded');
    } else if (view) {
      setCurrentView(view);
    }
  }, [searchParams]);

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getAdminOrders({ limit: 100 });
      if (response.success && response.data) {
        setOrders(response.data as Order[]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // Load orders on component mount
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchOrders();
    }
  }, [isAuthenticated, user]);

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || order.status === statusFilter;
    const matchesPayment = !paymentFilter || order.paymentStatus === paymentFilter;
    
    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Update order status
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdating(true);
      const response = await apiService.updateOrderStatus(orderId, newStatus);
      
      if (response.success) {
        // Update the order in the local state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId 
              ? { ...order, status: newStatus }
              : order
          )
        );
        setEditingOrder(null);
        setEditingField(null);
      } else {
        console.error('Failed to update order status:', response.message);
        alert('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status');
    } finally {
      setUpdating(false);
    }
  };

  // Update payment status
  const updatePaymentStatus = async (orderId: string, newPaymentStatus: string) => {
    try {
      setUpdating(true);
      const response = await apiService.updatePaymentStatus(orderId, newPaymentStatus);
      
      if (response.success) {
        // Update the order in the local state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId 
              ? { ...order, paymentStatus: newPaymentStatus }
              : order
          )
        );
        setEditingOrder(null);
        setEditingField(null);
      } else {
        console.error('Failed to update payment status:', response.message);
        alert('Failed to update payment status');
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('Error updating payment status');
    } finally {
      setUpdating(false);
    }
  };

  // Handle edit start
  const startEdit = (orderId: string, field: 'status' | 'payment', currentValue: string) => {
    setEditingOrder(orderId);
    setEditingField(field);
    if (field === 'status') {
      setTempStatus(currentValue);
    } else {
      setTempPaymentStatus(currentValue);
    }
  };

  // Handle edit cancel
  const cancelEdit = () => {
    setEditingOrder(null);
    setEditingField(null);
    setTempStatus('');
    setTempPaymentStatus('');
  };

  // Handle order actions
  const handleViewOrder = (orderId: string) => {
    // Navigate to order details page or open modal
    router.push(`/admin/orders/${orderId}`);
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      // Note: You may need to implement delete order API endpoint
      // await apiService.deleteOrder(orderId);
      
      // For now, just remove from local state
      setOrders(orders.filter(order => order._id !== orderId));
      
      // Show success message (you can implement toast notifications)
      alert('Order deleted successfully');
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Failed to delete order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit save
  const saveEdit = async (field?: 'status' | 'payment') => {
    if (!editingOrder) return;
    
    const fieldToUpdate = field || editingField;
    
    if (fieldToUpdate === 'status') {
      await updateOrderStatus(editingOrder, tempStatus);
    } else if (fieldToUpdate === 'payment') {
      await updatePaymentStatus(editingOrder, tempPaymentStatus);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black">Order Management</h1>
              <p className="text-gray-600 mt-1">Manage customer orders and track deliveries</p>
            </div>
            <Link
              href="/admin/dashboard"
              className="bg-blue-50 text-black border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-100 transition-all flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Payment Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Payments</option>
              <option value="pending">Payment Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setPaymentFilter('');
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading orders...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchOrders}
                className="mt-4 px-4 py-2 bg-green-50 text-black border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.orderNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingOrder === order._id && editingField === 'status' ? (
                          <div className="flex items-center space-x-2">
                            <select
                              value={tempStatus}
                              onChange={(e) => setTempStatus(e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                            <button
                               onClick={() => saveEdit('status')}
                               className="text-green-600 hover:text-green-800"
                             >
                               <Save size={16} />
                             </button>
                            <button
                              onClick={cancelEdit}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'confirmed' ? 'bg-purple-100 text-purple-800' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status}
                            </span>
                            <button
                              onClick={() => startEdit(order._id, 'status', order.status)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <Edit size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingOrder === order._id && editingField === 'payment' ? (
                          <div className="flex items-center space-x-2">
                            <select
                              value={tempPaymentStatus}
                              onChange={(e) => setTempPaymentStatus(e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                            >
                              <option value="pending">Pending</option>
                              <option value="paid">Paid</option>
                              <option value="failed">Failed</option>
                              <option value="refunded">Refunded</option>
                            </select>
                            <button
                               onClick={() => saveEdit('payment')}
                               className="text-green-600 hover:text-green-800"
                             >
                               <Save size={16} />
                             </button>
                            <button
                              onClick={cancelEdit}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                              order.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                              order.paymentStatus === 'refunded' ? 'bg-orange-100 text-orange-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {order.paymentStatus}
                            </span>
                            <button
                              onClick={() => startEdit(order._id, 'payment', order.paymentStatus)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <Edit size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{order.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleViewOrder(order._id)}
                            className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                          >
                            <Eye size={16} />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(order._id)}
                            className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                          >
                            <Trash2 size={16} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}