'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  ArrowLeft,
  MapPin,
  CreditCard,
  User,
  Phone,
  Mail
} from 'lucide-react';

interface OrderItem {
  product: { 
    name: string; 
    images: string[];
    _id: string;
  } | null;
  quantity: number;
  price: number;
}

interface OrderDetails {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  status: string;
  paymentStatus: string;
  trackingNumber?: string;
  estimatedDelivery: string;
  createdAt: string;
  shippingAddress?: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
  };
  billingAddress?: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  paymentMethod?: string;
  customerEmail?: string;
}

export default function OrderDetailsPage() {
  const { user, isAuthenticated } = useAuth();
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && params.id) {
      fetchOrderDetails();
    }
  }, [isAuthenticated, params.id]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/orders/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Calculate proper estimated delivery date
          const processedOrder = {
            ...result.order,
            estimatedDelivery: calculateEstimatedDelivery(result.order.createdAt, result.order.status)
          };
          setOrder(processedOrder);
        } else {
          setError(result.message || 'Failed to fetch order details');
        }
      } else {
        setError('Failed to fetch order details');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('An error occurred while fetching order details');
    } finally {
      setLoading(false);
    }
  };

  const calculateEstimatedDelivery = (createdAt: string, status: string) => {
    const orderDate = new Date(createdAt);
    const deliveryDate = new Date(orderDate);
    
    // Add 7 days for estimated delivery
    deliveryDate.setDate(orderDate.getDate() + 7);
    
    // If order is already delivered, return the current date
    if (status === 'delivered') {
      return new Date().toISOString().split('T')[0];
    }
    
    return deliveryDate.toISOString().split('T')[0];
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'shipped': return 'text-blue-600 bg-blue-100';
      case 'processing': return 'text-yellow-600 bg-yellow-100';
      case 'pending': return 'text-orange-600 bg-orange-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getOrderTimeline = (status: string, createdAt: string) => {
    const orderDate = new Date(createdAt);
    const steps = [
      { 
        status: 'Order Placed', 
        date: orderDate.toLocaleDateString(), 
        completed: true 
      },
      { 
        status: 'Processing', 
        date: new Date(orderDate.getTime() + 24 * 60 * 60 * 1000).toLocaleDateString(), 
        completed: ['processing', 'shipped', 'delivered'].includes(status.toLowerCase()) 
      },
      { 
        status: 'Shipped', 
        date: new Date(orderDate.getTime() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString(), 
        completed: ['shipped', 'delivered'].includes(status.toLowerCase()) 
      },
      { 
        status: 'Delivered', 
        date: new Date(orderDate.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(), 
        completed: status.toLowerCase() === 'delivered' 
      }
    ];
    return steps;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-8">Please log in to view your order details.</p>
          <Link 
            href="/login" 
            className="bg-orange-400 text-white px-6 py-3 rounded-lg hover:bg-orange-500 transition-colors"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
          <p className="text-gray-600 mb-8">{error || 'The order you are looking for could not be found.'}</p>
          <Link 
            href="/orders" 
            className="bg-orange-400 text-white px-6 py-3 rounded-lg hover:bg-orange-500 transition-colors"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const timeline = getOrderTimeline(order.status, order.createdAt);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/orders" 
            className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
              <p className="text-gray-600">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                Payment: {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Items</h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 pb-4 border-b border-gray-100 last:border-b-0">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {item.product?.name || 'Product name unavailable'}
                      </h3>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₹{item.price}</p>
                      <p className="text-sm text-gray-600">₹{(item.price / item.quantity).toFixed(2)} each</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                  <span className="text-xl font-bold text-gray-900">₹{order.total}</span>
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Timeline</h2>
              <div className="space-y-4">
                {timeline.map((step, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {step.completed ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${step.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                        {step.status}
                      </p>
                      <p className="text-sm text-gray-600">{step.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Delivery Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Truck className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Estimated Delivery</p>
                    <p className="font-medium text-gray-900">
                      {new Date(order.estimatedDelivery).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {order.trackingNumber && (
                  <div className="flex items-center space-x-3">
                    <Package className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Tracking Number</p>
                      <p className="font-medium text-gray-900">{order.trackingNumber}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
                <div className="space-y-2">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">{order.shippingAddress.fullName}</p>
                      <p className="text-sm text-gray-600">{order.shippingAddress.address}</p>
                      <p className="text-sm text-gray-600">
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                      </p>
                      {order.shippingAddress.phone && (
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <Phone className="w-4 h-4 mr-1" />
                          {order.shippingAddress.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="font-medium text-gray-900">{order.paymentMethod || 'Not specified'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`w-5 h-5 rounded-full ${getPaymentStatusColor(order.paymentStatus).includes('green') ? 'bg-green-400' : getPaymentStatusColor(order.paymentStatus).includes('yellow') ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Status</p>
                    <p className="font-medium text-gray-900">
                      {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Customer</p>
                    <p className="font-medium text-gray-900">{user?.name || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">{order.customerEmail || user?.email || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}