'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useOrders } from '@/contexts/OrderContext';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  MessageCircle
} from 'lucide-react';
import Link from 'next/link';

interface TrackingStep {
  status: string;
  timestamp: string;
  description: string;
  location?: string;
}

interface StatusHistoryItem {
  status: string;
  timestamp: string;
  note?: string;
}

interface OrderTracking {
  status: string;
  location?: string;
  timestamp: string;
  description: string;
  statusHistory: StatusHistoryItem[];
  estimatedDelivery?: string;
  trackingNumber?: string;
  notes?: string;
  _id: string;
  total: number;
  orderNumber?: string;
}

export default function TrackOrder() {
  const params = useParams();
  const orderId = params.id as string;
  const { getOrderTracking } = useOrders();
  const [trackingData, setTrackingData] = useState<TrackingStep[]>([]);
  const [orderDetails, setOrderDetails] = useState<OrderTracking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrackingData = async () => {
      try {
        setLoading(true);
        const tracking = await getOrderTracking(orderId);
        if (tracking) {
          // Create a proper OrderTracking object with all required properties
          const extendedTracking: OrderTracking = {
            status: tracking.status,
            location: tracking.location,
            timestamp: tracking.timestamp,
            description: tracking.description,
            statusHistory: [],
            estimatedDelivery: undefined,
            trackingNumber: undefined,
            notes: undefined,
            _id: orderId,
            total: 0,
            orderNumber: orderId
          };
          
          // Convert status history to tracking steps
          const steps = extendedTracking.statusHistory.map((historyItem: StatusHistoryItem) => ({
            status: historyItem.status,
            timestamp: historyItem.timestamp,
            description: historyItem.note || getStatusDescription(historyItem.status),
            location: tracking.location || 'Processing Center'
          }));
          
          // Sort by timestamp (newest first)
          steps.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          
          setTrackingData(steps);
          setOrderDetails(extendedTracking);
        } else {
          setError('No tracking information available');
        }
      } catch (error: unknown) {
        console.error('Error fetching tracking data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load tracking data');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchTrackingData();
    }
  }, [orderId, getOrderTracking]);
  
  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Order has been placed and is awaiting confirmation';
      case 'confirmed':
        return 'Order confirmed and payment received';
      case 'processing':
        return 'Order is being processed and prepared for shipping';
      case 'shipped':
        return 'Order has been shipped and is in transit';
      case 'delivered':
        return 'Order has been delivered successfully';
      case 'cancelled':
        return 'Order has been cancelled';
      case 'returned':
        return 'Order has been returned';
      default:
        return 'Status update';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-6 h-6 text-yellow-500" />;
      case 'confirmed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'processing':
        return <Package className="w-6 h-6 text-blue-500" />;
      case 'shipped':
        return <Truck className="w-6 h-6 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'cancelled':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      case 'returned':
        return <AlertCircle className="w-6 h-6 text-orange-500" />;
      default:
        return <Clock className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'returned':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-8">{error}</p>
          <Link 
            href="/orders" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order Tracking</h1>
              <p className="text-gray-600 mt-1">Track your order status and delivery progress</p>
            </div>
            <Link 
              href="/orders" 
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Back to Orders
            </Link>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center mb-2">
                <Package className="w-5 h-5 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Order Number</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">#{orderDetails?.orderNumber || orderId}</p>
            </div>
            <div>
              <div className="flex items-center mb-2">
                <Calendar className="w-5 h-5 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Order Date</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {orderDetails?.statusHistory && orderDetails.statusHistory.length > 0 
                  ? new Date(orderDetails.statusHistory[orderDetails.statusHistory.length - 1].timestamp).toLocaleDateString('en-IN')
                  : new Date().toLocaleDateString('en-IN')}
              </p>
            </div>
            <div>
              <div className="flex items-center mb-2">
                <DollarSign className="w-5 h-5 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Total Amount</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">{formatCurrency(orderDetails?.total || 0)}</p>
            </div>
            <div>
              <div className="flex items-center mb-2">
                <Truck className="w-5 h-5 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Current Status</span>
              </div>
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(orderDetails?.status || 'pending')}`}>
                {orderDetails?.status ? orderDetails.status.charAt(0).toUpperCase() + orderDetails.status.slice(1) : 'Pending'}
              </span>
            </div>
            {orderDetails?.trackingNumber && (
              <div>
                <div className="flex items-center mb-2">
                  <Truck className="w-5 h-5 text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Tracking Number</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{orderDetails.trackingNumber}</p>
              </div>
            )}
          </div>
        </div>

        {/* Tracking Timeline */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Tracking Timeline</h2>
          {trackingData.length > 0 ? (
            <div className="space-y-6">
              {trackingData.map((step, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full bg-white border-2 ${index === 0 ? 'border-blue-500' : 'border-gray-200'} flex items-center justify-center`}>
                      {getStatusIcon(step.status)}
                    </div>
                    {index < trackingData.length - 1 && (
                      <div className="w-0.5 h-12 bg-gray-200 mx-auto mt-2"></div>
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 capitalize">
                          {step.status}
                        </h3>
                        <p className="text-gray-600 mt-1">{step.description}</p>
                        {step.location && (
                          <div className="flex items-center mt-2">
                            <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                            <span className="text-sm text-gray-500">{step.location}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          {new Date(step.timestamp).toLocaleDateString('en-IN')}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(step.timestamp).toLocaleTimeString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No tracking information available yet</p>
            </div>
          )}
        </div>

        {/* Estimated Delivery */}
        {orderDetails?.estimatedDelivery && orderDetails.status !== 'delivered' && orderDetails.status !== 'cancelled' && orderDetails.status !== 'returned' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Estimated Delivery</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Calendar className="w-6 h-6 text-green-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Expected Delivery Date</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(orderDetails.estimatedDelivery).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">
                  {orderDetails.status === 'shipped' ? 'In transit' : 'Processing'}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Delivery Confirmation */}
        {orderDetails?.status === 'delivered' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery Confirmation</h2>
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-700">Delivered On</p>
                <p className="text-lg font-semibold text-gray-900">
                  {orderDetails.statusHistory
                    .filter((history: StatusHistoryItem) => history.status === 'delivered')
                    .map((history: StatusHistoryItem) => new Date(history.timestamp).toLocaleDateString('en-IN'))[0] || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Cancellation/Return Information */}
        {(orderDetails?.status === 'cancelled' || orderDetails?.status === 'returned') && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {orderDetails.status === 'cancelled' ? 'Cancellation' : 'Return'} Information
            </h2>
            <div className="flex items-center">
              <AlertCircle className="w-6 h-6 text-red-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-700">
                  {orderDetails.status === 'cancelled' ? 'Cancelled On' : 'Returned On'}
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {orderDetails.statusHistory
                    .filter((history: StatusHistoryItem) => history.status === orderDetails.status)
                    .map((history: StatusHistoryItem) => new Date(history.timestamp).toLocaleDateString('en-IN'))[0] || 'N/A'}
                </p>
                {orderDetails.notes && (
                  <p className="text-sm text-gray-600 mt-2">{orderDetails.notes}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <Mail className="w-5 h-5 text-gray-500 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-700">Email Support</p>
                <p className="text-sm text-gray-600">support@boosterboxnutrition.com</p>
                <p className="text-xs text-gray-500 mt-1">Response time: Within 24 hours</p>
              </div>
            </div>
            <div className="flex items-start">
              <Phone className="w-5 h-5 text-gray-500 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-700">Phone Support</p>
                <p className="text-sm text-gray-600">+91 9876543210</p>
                <p className="text-xs text-gray-500 mt-1">Available Mon-Fri, 9am-6pm IST</p>
              </div>
            </div>
            <div className="flex items-start">
              <MessageCircle className="w-5 h-5 text-gray-500 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-700">Live Chat</p>
                <p className="text-sm text-gray-600">Available on our website</p>
                <p className="text-xs text-gray-500 mt-1">Available 24/7</p>
              </div>
            </div>
          </div>
          
          {orderDetails?.trackingNumber && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-start">
                <Truck className="w-5 h-5 text-gray-500 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Shipping Carrier</p>
                  <p className="text-sm text-gray-600">
                    {orderDetails.trackingNumber.startsWith('IN') ? 'India Post' : 
                     orderDetails.trackingNumber.startsWith('DL') ? 'Delhivery' : 
                     orderDetails.trackingNumber.startsWith('BD') ? 'BlueDart' : 
                     'Standard Shipping'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Tracking #: {orderDetails.trackingNumber}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}