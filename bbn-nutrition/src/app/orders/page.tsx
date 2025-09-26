'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  Search,
  Phone,
  Mail,
  MessageCircle,
  ArrowLeft,
  Eye,
  Download
} from 'lucide-react';

interface Order {
  _id: string;
  orderNumber: string;
  items: {
    product: { name: string; images: string[] } | null;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: string;
  paymentStatus: string;
  trackingNumber?: string;
  estimatedDelivery: string;
  createdAt: string;
}

const mockOrders: Order[] = [
  {
    _id: '1',
    orderNumber: 'BBN-2024-001',
    items: [
      {
        product: { name: 'BBN Whey Protein Isolate', images: ['/images/whey-protein.jpg'] },
        quantity: 2,
        price: 59.99
      }
    ],
    total: 119.98,
    status: 'delivered',
    paymentStatus: 'paid',
    trackingNumber: 'TRK123456789',
    estimatedDelivery: '2024-01-25',
    createdAt: '2024-01-20T10:30:00Z'
  },
  {
    _id: '2',
    orderNumber: 'BBN-2024-002',
    items: [
      {
        product: { name: 'BBN Pre-Workout Elite', images: ['/images/pre-workout.jpg'] },
        quantity: 1,
        price: 44.99
      }
    ],
    total: 44.99,
    status: 'shipped',
    paymentStatus: 'paid',
    trackingNumber: 'TRK987654321',
    estimatedDelivery: '2024-01-28',
    createdAt: '2024-01-21T14:15:00Z'
  }
];

export default function OrdersPage() {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingResult, setTrackingResult] = useState<{
    orderNumber?: string;
    status?: string;
    estimatedDelivery?: string;
    trackingSteps?: Array<{
      status: string;
      date: string;
      completed: boolean;
    }>;
    error?: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState('orders');
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState<Order | null>(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [returnDescription, setReturnDescription] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Process orders to calculate proper estimated delivery dates
          const processedOrders = (result.orders || []).map((order: Order) => ({
            ...order,
            estimatedDelivery: calculateEstimatedDelivery(order.createdAt, order.status)
          }));
          setOrders(processedOrders);
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
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

  const handleTrackOrder = () => {
    if (trackingNumber) {
      // Simulate tracking lookup
      const order = orders.find(o => o.trackingNumber === trackingNumber);
      if (order) {
        setTrackingResult({
          orderNumber: order.orderNumber,
          status: order.status,
          estimatedDelivery: order.estimatedDelivery,
          trackingSteps: [
            { status: 'Order Placed', date: '2024-01-20', completed: true },
            { status: 'Processing', date: '2024-01-21', completed: true },
            { status: 'Shipped', date: '2024-01-22', completed: order.status !== 'processing' },
            { status: 'Out for Delivery', date: '2024-01-25', completed: order.status === 'delivered' },
            { status: 'Delivered', date: '2024-01-25', completed: order.status === 'delivered' }
          ]
        });
      } else {
        setTrackingResult({ error: 'Tracking number not found' });
      }
    }
  };

  const handleTrackPackage = async (order: Order) => {
    if (order.trackingNumber) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/orders/track/${order.trackingNumber}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();

        if (result.success) {
          // Display tracking information in a more user-friendly way
          const trackingInfo = result.data.trackingSteps.map((step: any) => 
            `${step.date}: ${step.status} - ${step.description}`
          ).join('\n');
          
          alert(`Tracking Information for ${order.trackingNumber}:\n\n${trackingInfo}`);
        } else {
          alert(result.message || 'Failed to retrieve tracking information.');
        }
      } catch (error) {
        console.error('Tracking error:', error);
        alert('Failed to retrieve tracking information. Please try again.');
      }
    } else {
      alert('No tracking number available for this order.');
    }
  };

  const handleReturnItem = async (order: Order) => {
    if (order.status === 'delivered') {
      // Check if order is within return window (30 days)
      const deliveryDate = new Date(order.estimatedDelivery);
      const currentDate = new Date();
      const daysDifference = Math.floor((currentDate.getTime() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDifference <= 30) {
        setSelectedOrderForReturn(order);
        setShowReturnModal(true);
      } else {
        alert('Return window has expired. Returns are only accepted within 30 days of delivery.');
      }
    } else {
      alert('Returns can only be initiated for delivered orders.');
    }
  };

  const submitReturnRequest = async () => {
    if (!selectedOrderForReturn || !returnReason) {
      alert('Please select a reason for return.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/orders/${selectedOrderForReturn._id}/return`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: returnReason,
          description: returnDescription
        })
      });

      const result = await response.json();

      if (result.success) {
        alert(result.message);
        // Refresh orders to show updated status
        fetchOrders();
      } else {
        alert(result.message || 'Failed to submit return request.');
      }
    } catch (error) {
      console.error('Return request error:', error);
      alert('Failed to submit return request. Please try again.');
    }

    // Reset form and close modal
    setReturnReason('');
    setReturnDescription('');
    setSelectedOrderForReturn(null);
    setShowReturnModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'shipped': return 'text-blue-600 bg-blue-100';
      case 'processing': return 'text-yellow-600 bg-yellow-100';
      case 'pending': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Sign In Required</h1>
          <p className="text-gray-600 mb-8">Please sign in to view your orders and track shipments.</p>
          <Link 
            href="/login?redirect=/orders" 
            className="bg-orange-400 text-white px-6 py-3 rounded-lg hover:bg-orange-500 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-orange-600 transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Your Orders & Returns</h1>
                <p className="text-gray-600 mt-1">Track orders, manage returns, and get customer support</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'orders'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Your Orders
            </button>
            <button
              onClick={() => setActiveTab('track')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'track'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Track Your Order
            </button>
            <button
              onClick={() => setActiveTab('support')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'support'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Customer Service
            </button>
          </nav>
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading your orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-600 mb-8">When you place your first order, it will appear here.</p>
                <Link 
                  href="/shop" 
                  className="bg-orange-400 text-white px-6 py-3 rounded-lg hover:bg-orange-500 transition-colors"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Order #{order.orderNumber}</h3>
                          <p className="text-sm text-gray-600">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                          <Link 
                            href={`/orders/${order._id}`}
                            className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                          >
                            <Eye className="w-4 h-4 inline mr-1" />
                            View Details
                          </Link>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex items-center space-x-4 mb-4">
                              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Package className="w-8 h-8 text-gray-400" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">
                                  {item.product?.name || 'Product name unavailable'}
                                </h4>
                                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                <p className="text-sm font-medium text-gray-900">₹{item.price}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-gray-600">Total Amount</p>
                            <p className="text-lg font-semibold text-gray-900">₹{order.total}</p>
                          </div>
                          
                          {order.trackingNumber && (
                            <div>
                              <p className="text-sm text-gray-600">Tracking Number</p>
                              <p className="text-sm font-medium text-gray-900">{order.trackingNumber}</p>
                            </div>
                          )}
                          
                          <div>
                            <p className="text-sm text-gray-600">Estimated Delivery</p>
                            <p className="text-sm font-medium text-gray-900">{new Date(order.estimatedDelivery).toLocaleDateString()}</p>
                          </div>
                          
                          <div className="space-y-2">
                            <button 
                              onClick={() => handleTrackPackage(order)}
                              className="w-full bg-orange-400 text-white py-2 px-4 rounded-lg hover:bg-orange-500 transition-colors text-sm"
                            >
                              Track Package
                            </button>
                            <button 
                              onClick={() => handleReturnItem(order)}
                              className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                            >
                              Return Item
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Track Order Tab */}
        {activeTab === 'track' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Track Your Order</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Tracking Number or Order Number
                  </label>
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="e.g., TRK123456789 or BBN-2024-001"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleTrackOrder}
                      className="bg-orange-400 text-white px-6 py-2 rounded-lg hover:bg-orange-500 transition-colors flex items-center space-x-2"
                    >
                      <Search className="w-4 h-4" />
                      <span>Track</span>
                    </button>
                  </div>
                </div>
                
                {trackingResult && (
                  <div className="mt-6">
                    {trackingResult.error ? (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-600">{trackingResult.error}</p>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Order #{trackingResult.orderNumber}
                        </h3>
                        
                        <div className="space-y-4">
                          {trackingResult.trackingSteps?.map((step, index: number) => (
                            <div key={index} className="flex items-center space-x-4">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                step.completed ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                              }`}>
                                {step.completed ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                              </div>
                              <div className="flex-1">
                                <p className={`font-medium ${
                                  step.completed ? 'text-gray-900' : 'text-gray-500'
                                }`}>
                                  {step.status}
                                </p>
                                <p className="text-sm text-gray-600">{step.date}</p>
                              </div>
                            </div>
                          )) || []}
                        </div>
                        
                        {trackingResult.estimatedDelivery && (
                          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                              <strong>Estimated Delivery:</strong> {new Date(trackingResult.estimatedDelivery).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Customer Service Tab */}
        {activeTab === 'support' && (
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Contact Options */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Contact Customer Service</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <Phone className="w-6 h-6 text-orange-500" />
                    <div>
                      <h3 className="font-medium text-gray-900">Phone Support</h3>
                      <p className="text-sm text-gray-600">+91 1800-123-4567</p>
                      <p className="text-xs text-gray-500">Mon-Fri 9AM-6PM IST</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <Mail className="w-6 h-6 text-orange-500" />
                    <div>
                      <h3 className="font-medium text-gray-900">Email Support</h3>
                      <p className="text-sm text-gray-600">support@bbn-nutrition.com</p>
                      <p className="text-xs text-gray-500">Response within 24 hours</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <MessageCircle className="w-6 h-6 text-orange-500" />
                    <div>
                      <h3 className="font-medium text-gray-900">Live Chat</h3>
                      <p className="text-sm text-gray-600">Chat with our support team</p>
                      <p className="text-xs text-gray-500">Available 24/7</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* FAQ Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
                
                <div className="space-y-4">
                  <div className="border-b border-gray-200 pb-4">
                    <h3 className="font-medium text-gray-900 mb-2">How can I track my order?</h3>
                    <p className="text-sm text-gray-600">Use the &apos;Track Your Order&apos; tab above with your tracking number or order number.</p>
                  </div>
                  
                  <div className="border-b border-gray-200 pb-4">
                    <h3 className="font-medium text-gray-900 mb-2">What is your return policy?</h3>
                    <p className="text-sm text-gray-600">We offer 30-day returns for unopened products. Contact us to initiate a return.</p>
                  </div>
                  
                  <div className="border-b border-gray-200 pb-4">
                    <h3 className="font-medium text-gray-900 mb-2">How long does shipping take?</h3>
                    <p className="text-sm text-gray-600">Standard shipping takes 3-5 business days. Express shipping is available for faster delivery.</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Can I modify my order?</h3>
                    <p className="text-sm text-gray-600">Orders can be modified within 1 hour of placement. Contact us immediately for changes.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Return Modal */}
      {showReturnModal && selectedOrderForReturn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Return Request - Order #{selectedOrderForReturn.orderNumber}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Return
                </label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select a reason</option>
                  <option value="defective">Defective/Damaged Product</option>
                  <option value="wrong-item">Wrong Item Received</option>
                  <option value="not-as-described">Not as Described</option>
                  <option value="quality-issues">Quality Issues</option>
                  <option value="changed-mind">Changed Mind</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={returnDescription}
                  onChange={(e) => setReturnDescription(e.target.value)}
                  placeholder="Please provide additional details about your return request..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Return Policy:</strong> Items must be unopened and in original packaging. 
                  Return shipping label will be provided via email within 24 hours.
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => submitReturnRequest()}
                className="flex-1 bg-orange-400 text-white py-2 px-4 rounded-lg hover:bg-orange-500 transition-colors"
              >
                Submit Return Request
              </button>
              <button
                onClick={() => {
                  setReturnReason('');
                  setReturnDescription('');
                  setSelectedOrderForReturn(null);
                  setShowReturnModal(false);
                }}
                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}