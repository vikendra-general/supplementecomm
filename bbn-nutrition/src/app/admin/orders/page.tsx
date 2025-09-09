'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/utils/api';
import { useSearchParams } from 'next/navigation';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import { 
  ArrowLeft,
  Search,
  Eye,
  Package,
  Truck,
  Clock,
  DollarSign,
  User,
  MapPin,
  Phone,
  Mail,
  X,
  Edit,
  Save
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

// Mock order data
const mockOrders: Order[] = [
  {
    _id: '1',
    orderNumber: 'BBN-2024-001',
    user: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+91 9876543210'
    },
    items: [
      {
        product: { name: 'BBN Whey Protein Isolate' },
        quantity: 2,
        price: 59.99
      },
      {
        product: { name: 'BBN Pre-Workout Elite' },
        quantity: 1,
        price: 44.99
      }
    ],
    subtotal: 164.97,
    tax: 29.69,
    shipping: 0,
    total: 194.66,
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'Credit Card',
    shippingAddress: {
      address: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pinCode: '400001',
        country: 'India'
      },
      billingAddress: {
        address: '123 Main St',
        city: 'Mumbai',
        state: 'Maharashtra',
        pinCode: '400001',
      country: 'India'
    },
    trackingNumber: 'TRK123456789',
    estimatedDelivery: '2024-01-25',
    createdAt: '2024-01-20T10:30:00Z',
    updatedAt: '2024-01-20T10:30:00Z'
  },
  {
    _id: '2',
    orderNumber: 'BBN-2024-002',
    user: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+91 9876543211'
    },
    items: [
      {
        product: { name: 'BBN Creatine Monohydrate' },
        quantity: 1,
        price: 24.99
      }
    ],
    subtotal: 24.99,
    tax: 4.50,
    shipping: 50,
    total: 79.49,
    status: 'processing',
    paymentStatus: 'paid',
    paymentMethod: 'UPI',
    shippingAddress: {
      address: '456 Park Avenue',
      city: 'Delhi',
      state: 'Delhi',
      pinCode: '110001',
        country: 'India'
      },
      billingAddress: {
        address: '456 Oak Ave',
        city: 'Delhi',
        state: 'Delhi',
        pinCode: '110001',
      country: 'India'
    },
    trackingNumber: null,
    estimatedDelivery: '2024-01-28',
    createdAt: '2024-01-21T14:15:00Z',
    updatedAt: '2024-01-21T14:15:00Z'
  },
  {
    _id: '3',
    orderNumber: 'BBN-2024-003',
    user: {
      name: 'Mike Johnson',
      email: 'mike@example.com',
      phone: '+91 9876543212'
    },
    items: [
      {
        product: { name: 'BBN Mass Gainer' },
        quantity: 1,
        price: 69.99
      },
      {
        product: { name: 'BBN BCAA Amino Acids' },
        quantity: 1,
        price: 34.99
      }
    ],
    subtotal: 104.98,
    tax: 18.90,
    shipping: 0,
    total: 123.88,
    status: 'shipped',
    paymentStatus: 'paid',
    paymentMethod: 'Debit Card',
    shippingAddress: {
      address: '789 Tech Park',
      city: 'Bangalore',
      state: 'Karnataka',
      pinCode: '560001',
        country: 'India'
      },
      billingAddress: {
        address: '789 Pine Rd',
        city: 'Bangalore',
        state: 'Karnataka',
        pinCode: '560001',
      country: 'India'
    },
    trackingNumber: 'TRK987654321',
    estimatedDelivery: '2024-01-24',
    createdAt: '2024-01-19T09:45:00Z',
    updatedAt: '2024-01-22T16:20:00Z'
  }
];

export default function AdminOrdersPage() {
  const { user, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [updating, setUpdating] = useState(false);
  const [currentView, setCurrentView] = useState('orders');

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

  // Remove old authentication logic - now handled by AdminProtectedRoute

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string, trackingNum?: string) => {
    try {
      setUpdating(true);
      setError(null);
      
      const updateData: { status: string; trackingNumber?: string } = { status: newStatus };
       if (trackingNum) {
         updateData.trackingNumber = trackingNum;
       }
      
      const response = await apiService.updateOrderStatus(orderId, newStatus);
      
      if (response.success) {
        // Refresh orders list
        await fetchOrders();
        setEditingStatus(null);
        setNewStatus('');
        setTrackingNumber('');
      } else {
        setError(response.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      setError(error instanceof Error ? error.message : 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const startEditingStatus = (orderId: string, currentStatus: string) => {
    setEditingStatus(orderId);
    setNewStatus(currentStatus);
  };

  const cancelEditing = () => {
    setEditingStatus(null);
    setNewStatus('');
    setTrackingNumber('');
  };

  const saveStatusUpdate = async (orderId: string) => {
    await handleUpdateOrderStatus(orderId, newStatus, trackingNumber || undefined);
  };



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminProtectedRoute>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin" 
                className="text-gray-600 hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
                <p className="text-gray-600">Manage customer orders and fulfillment</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm text-dark-text-secondary">Total Orders</p>
                <p className="text-2xl font-bold text-dark-text">{orders.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-yellow-400" />
              <div className="ml-4">
                <p className="text-sm text-dark-text-secondary">Pending Orders</p>
                <p className="text-2xl font-bold text-dark-text">
                  {orders.filter(o => o.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
            <div className="flex items-center">
              <Truck className="w-8 h-8 text-blue-400" />
              <div className="ml-4">
                <p className="text-sm text-dark-text-secondary">Shipped Orders</p>
                <p className="text-2xl font-bold text-dark-text">
                  {orders.filter(o => o.status === 'shipped').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-dark-card p-6 rounded-lg border border-gray-700">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-400" />
              <div className="ml-4">
                <p className="text-sm text-dark-text-secondary">Total Revenue</p>
                <p className="text-2xl font-bold text-dark-text">
                  ₹{orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
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
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-gray border border-gray-600 rounded-lg text-dark-text placeholder-dark-text-secondary focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-dark-gray border border-gray-600 rounded-lg text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-4 py-2 bg-dark-gray border border-gray-600 rounded-lg text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">All Payment Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setPaymentFilter('');
              }}
              className="px-4 py-2 border border-gray-600 text-dark-text-secondary hover:text-primary hover:border-primary rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-dark-card rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-dark-gray">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-dark-text-secondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-hover-subtle hover:bg-opacity-20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-dark-text">{order.orderNumber}</div>
                        <div className="text-sm text-dark-text-secondary">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-dark-text">{order.user.name}</div>
                        <div className="text-sm text-dark-text-secondary">{order.user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-dark-text">
                      ₹{order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                          className={`text-xs font-medium px-2 py-1 rounded-full border-0 focus:ring-2 focus:ring-primary ${getStatusColor(order.status)}`}
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-text">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowOrderDetails(true);
                        }}
                        className="text-primary hover:text-primary-dark transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-dark-card rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-700">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-dark-text">
                Order Details - {selectedOrder.orderNumber}
              </h2>
              <button
                onClick={() => {
                  setShowOrderDetails(false);
                  setSelectedOrder(null);
                }}
                className="p-2 rounded-full hover:bg-hover-subtle hover:bg-opacity-20 transition-colors"
              >
                <X className="w-6 h-6 text-dark-text-secondary" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Order Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-dark-text mb-4">Order Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-dark-text-secondary">Order Number:</span>
                        <span className="text-dark-text font-medium">{selectedOrder.orderNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dark-text-secondary">Status:</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                          {selectedOrder.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dark-text-secondary">Payment Status:</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                          {selectedOrder.paymentStatus}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dark-text-secondary">Payment Method:</span>
                        <span className="text-dark-text">{selectedOrder.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dark-text-secondary">Order Date:</span>
                        <span className="text-dark-text">{formatDate(selectedOrder.createdAt)}</span>
                      </div>
                      {selectedOrder.trackingNumber && (
                        <div className="flex justify-between">
                          <span className="text-dark-text-secondary">Tracking Number:</span>
                          <span className="text-dark-text font-medium">{selectedOrder.trackingNumber}</span>
                        </div>
                      )}
                      {selectedOrder.estimatedDelivery && (
                        <div className="flex justify-between">
                          <span className="text-dark-text-secondary">Est. Delivery:</span>
                          <span className="text-dark-text">{new Date(selectedOrder.estimatedDelivery).toLocaleDateString('en-IN')}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-dark-text mb-4">Customer Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <User className="w-4 h-4 text-dark-text-secondary" />
                        <span className="text-dark-text">{selectedOrder.user.name}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Mail className="w-4 h-4 text-dark-text-secondary" />
                        <span className="text-dark-text">{selectedOrder.user.email}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="w-4 h-4 text-dark-text-secondary" />
                        <span className="text-dark-text">{selectedOrder.user.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <h3 className="text-lg font-semibold text-dark-text mb-4">Shipping Address</h3>
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-4 h-4 text-dark-text-secondary mt-1" />
                      <div className="text-dark-text">
                        <p>{selectedOrder.shippingAddress.address}</p>
                        <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                        <p>{selectedOrder.shippingAddress.pinCode}, {selectedOrder.shippingAddress.country}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items and Summary */}
                <div className="space-y-6">
                  {/* Order Items */}
                  <div>
                    <h3 className="text-lg font-semibold text-dark-text mb-4">Order Items</h3>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item: OrderItem, index: number) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-dark-gray rounded-lg">
                          <div>
                            <p className="text-dark-text font-medium">{item.product.name}</p>
                            <p className="text-dark-text-secondary text-sm">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-dark-text font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div>
                    <h3 className="text-lg font-semibold text-dark-text mb-4">Order Summary</h3>
                    <div className="space-y-3 p-4 bg-dark-gray rounded-lg">
                      <div className="flex justify-between">
                        <span className="text-dark-text-secondary">Subtotal:</span>
                        <span className="text-dark-text">₹{selectedOrder.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dark-text-secondary">Tax:</span>
                        <span className="text-dark-text">₹{selectedOrder.tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-dark-text-secondary">Shipping:</span>
                        <span className="text-dark-text">
                          {selectedOrder.shipping === 0 ? 'Free' : `₹${selectedOrder.shipping.toFixed(2)}`}
                        </span>
                      </div>
                      <div className="border-t border-gray-600 pt-3">
                        <div className="flex justify-between">
                          <span className="text-dark-text font-semibold">Total:</span>
                          <span className="text-dark-text font-bold text-lg">₹{selectedOrder.total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </AdminProtectedRoute>
  );
}