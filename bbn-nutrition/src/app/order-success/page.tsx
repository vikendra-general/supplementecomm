'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, Truck, Mail, ArrowRight, Download } from 'lucide-react';
import { formatINR } from '@/utils/currency';

interface OrderDetails {
  orderNumber: string;
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  estimatedDelivery: string;
  trackingNumber?: string;
}

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const sessionId = searchParams.get('session_id');
    
    if (orderId || sessionId) {
      fetchOrderDetails(orderId || sessionId || '');
    } else {
      setError('Order ID not found');
      setLoading(false);
    }
  }, [searchParams]);

  const fetchOrderDetails = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view order details');
        setLoading(false);
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }

      const result = await response.json();
      
      if (result.success && result.order) {
         const order = result.order;
         const orderDetails: OrderDetails = {
           orderNumber: order._id,
           total: order.total,
           items: order.items.map((item: { name: string; quantity: number; price: number }) => ({
             name: item.name,
             quantity: item.quantity,
             price: item.price
           })),
           shippingAddress: {
             name: order.shippingAddress.fullName || 'N/A',
             address: order.shippingAddress.address || 'N/A',
             city: order.shippingAddress.city || 'N/A',
             state: order.shippingAddress.state || 'N/A',
             pincode: order.shippingAddress.pinCode || 'N/A'
           },
           estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'),
           trackingNumber: `TRK${order._id.slice(-8).toUpperCase()}`
         };
         
         setOrderDetails(orderDetails);
       } else {
         throw new Error('Invalid order data');
       }
    } catch (error) {
      setError('Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = () => {
    // Mock download - replace with actual invoice generation
    alert('Invoice download will be implemented');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <Package className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error || 'We couldn&apos;t find your order details. Please check your email for order confirmation.'}
          </p>
          <Link
            href="/orders"
            className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors inline-block text-center"
          >
            View All Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
          <p className="text-lg text-gray-600">
            Thank you for your purchase. Your order has been confirmed and is being processed.
          </p>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="bg-green-50 border-b border-green-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Order #{orderDetails.orderNumber}</h2>
                <p className="text-sm text-gray-600">Placed on {new Date().toLocaleDateString('en-IN')}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-green-600">{formatINR(orderDetails.total)}</p>
                <p className="text-sm text-gray-600">Total Amount</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Order Items */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-3">
                {orderDetails.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatINR(item.price * item.quantity)}</p>
                      <p className="text-sm text-gray-600">{formatINR(item.price)} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-gray-900">{orderDetails.shippingAddress.name}</p>
                <p className="text-gray-600">{orderDetails.shippingAddress.address}</p>
                <p className="text-gray-600">
                  {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} {orderDetails.shippingAddress.pincode}
                </p>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h3>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <Truck className="w-5 h-5 text-blue-600" />
                  <p className="font-medium text-gray-900">Estimated Delivery</p>
                </div>
                <p className="text-gray-600 ml-8">{orderDetails.estimatedDelivery}</p>
                {orderDetails.trackingNumber && (
                  <div className="mt-3 ml-8">
                    <p className="text-sm text-gray-600">Tracking Number: <span className="font-mono font-medium">{orderDetails.trackingNumber}</span></p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            href={`/track-order/${orderDetails.orderNumber}`}
            className="flex items-center justify-center space-x-2 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Truck className="w-5 h-5" />
            <span>Track Order</span>
          </Link>
          
          <button
            onClick={downloadInvoice}
            className="flex items-center justify-center space-x-2 bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>Download Invoice</span>
          </button>
          
          <Link
            href="/shop"
            className="flex items-center justify-center space-x-2 bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Email Confirmation Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Mail className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800">Order Confirmation Email</h4>
              <p className="text-sm text-yellow-700 mt-1">
                We&apos;ve sent a detailed order confirmation to your email address. 
                Please check your inbox and spam folder if you don&apos;t see it within a few minutes.
              </p>
            </div>
          </div>
        </div>

        {/* Customer Support */}
        <div className="text-center mt-8">
          <p className="text-gray-600 mb-4">
            Need help with your order? Our customer support team is here to assist you.
          </p>
          <Link
            href="/contact"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Contact Customer Support
          </Link>
        </div>
      </div>
    </div>
  );
}