'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useOrder } from '@/contexts/OrderContext';
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
  DollarSign
} from 'lucide-react';
import Link from 'next/link';

interface TrackingStep {
  status: string;
  timestamp: string;
  description: string;
  location?: string;
}

export default function TrackOrder() {
  const params = useParams();
  const orderId = params.id as string;
  const { getOrderTracking } = useOrder();
  const [trackingData, setTrackingData] = useState<TrackingStep[]>([]);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrackingData = async () => {
      try {
        setLoading(true);
        const tracking = await getOrderTracking(orderId);
        if (tracking) {
          setTrackingData([tracking]);
        }
        // For demo purposes, we'll create some mock tracking data
        const mockTrackingData: TrackingStep[] = [
          {
            status: 'confirmed',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            description: 'Order confirmed and payment received',
            location: 'Mumbai, Maharashtra'
          },
          {
            status: 'processing',
            timestamp: new Date(Date.now() - 43200000).toISOString(),
            description: 'Order is being processed and prepared for shipping',
            location: 'Mumbai, Maharashtra'
          },
          {
            status: 'shipped',
            timestamp: new Date(Date.now() - 21600000).toISOString(),
            description: 'Order has been shipped and is in transit',
            location: 'Delhi, Delhi'
          }
        ];
        setTrackingData(mockTrackingData);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'processing':
        return <Package className="w-6 h-6 text-blue-500" />;
      case 'shipped':
        return <Truck className="w-6 h-6 text-purple-500" />;
      case 'delivered':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      default:
        return <Clock className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
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
              <p className="text-lg font-semibold text-gray-900">#{orderId}</p>
            </div>
            <div>
              <div className="flex items-center mb-2">
                <Calendar className="w-5 h-5 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Order Date</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {new Date().toLocaleDateString('en-IN')}
              </p>
            </div>
            <div>
              <div className="flex items-center mb-2">
                <DollarSign className="w-5 h-5 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Total Amount</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">₹2,499.00</p>
            </div>
            <div>
              <div className="flex items-center mb-2">
                <Truck className="w-5 h-5 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Current Status</span>
              </div>
              <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-purple-100 text-purple-800">
                Shipped
              </span>
            </div>
          </div>
        </div>

        {/* Tracking Timeline */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Tracking Timeline</h2>
          <div className="space-y-6">
            {trackingData.map((step, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
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
        </div>

        {/* Estimated Delivery */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Estimated Delivery</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="w-6 h-6 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-700">Expected Delivery Date</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(Date.now() + 86400000).toLocaleDateString('en-IN')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Within 1-2 business days</p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center">
              <Phone className="w-5 h-5 text-gray-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-700">Customer Support</p>
                <p className="text-gray-900">+91 98765 43210</p>
              </div>
            </div>
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-gray-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-700">Email Support</p>
                <p className="text-gray-900">support@boosterboxnutrition.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 