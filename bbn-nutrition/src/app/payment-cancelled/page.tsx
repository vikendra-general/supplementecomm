'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, ArrowLeft, RefreshCw, CreditCard, HelpCircle } from 'lucide-react';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderDetails {
  orderNumber: string;
  total: number;
  reason: string;
  items: OrderItem[];
}

export default function PaymentCancelledPage() {
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const orderId = searchParams.get('orderId');
    const reason = searchParams.get('reason');
    
    // Mock order details - replace with actual API call
    if (sessionId || orderId) {
      setTimeout(() => {
        setOrderDetails({
          orderNumber: orderId || `BBN-${Date.now()}`,
          total: 4999,
          reason: reason || 'payment_cancelled',
          items: [
            {
              name: 'BBN Whey Protein Isolate - Chocolate',
              quantity: 2,
              price: 2499
            }
          ]
        });
        setLoading(false);
      }, 1000);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  const getReasonMessage = (reason: string) => {
    switch (reason) {
      case 'payment_failed':
        return 'Your payment could not be processed. Please check your payment details and try again.';
      case 'insufficient_funds':
        return 'Your payment was declined due to insufficient funds. Please try a different payment method.';
      case 'card_declined':
        return 'Your card was declined. Please contact your bank or try a different payment method.';
      case 'payment_cancelled':
      default:
        return 'You cancelled the payment process. Your order has not been placed.';
    }
  };

  const getReasonTitle = (reason: string) => {
    switch (reason) {
      case 'payment_failed':
      case 'insufficient_funds':
      case 'card_declined':
        return 'Payment Failed';
      case 'payment_cancelled':
      default:
        return 'Payment Cancelled';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <XCircle className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getReasonTitle(orderDetails?.reason || 'payment_cancelled')}
          </h1>
          <p className="text-lg text-gray-600">
            {getReasonMessage(orderDetails?.reason || 'payment_cancelled')}
          </p>
        </div>

        {/* Order Summary */}
        {orderDetails && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
            <div className="bg-red-50 border-b border-red-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Order #{orderDetails.orderNumber}</h2>
                  <p className="text-sm text-gray-600">Payment was not completed</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">₹{orderDetails.total.toLocaleString()}</p>
                  <p className="text-sm text-red-600">Payment Required</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Items in Your Cart</h3>
              <div className="space-y-3">
                {orderDetails.items.map((item: OrderItem, index: number) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                      <p className="text-sm text-gray-600">₹{item.price.toLocaleString()} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link
            href="/checkout"
            className="flex items-center justify-center space-x-2 bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Try Payment Again</span>
          </Link>
          
          <Link
            href="/cart"
            className="flex items-center justify-center space-x-2 bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Cart</span>
          </Link>
        </div>

        {/* Payment Methods Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-3">
            <CreditCard className="w-6 h-6 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Payment Methods We Accept</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Credit Cards (Visa, MasterCard, American Express)</li>
                <li>• Debit Cards</li>
                <li>• UPI (Google Pay, PhonePe, Paytm)</li>
                <li>• Net Banking</li>
                <li>• Digital Wallets</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Troubleshooting Tips */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-3">
            <HelpCircle className="w-6 h-6 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 mb-2">Payment Troubleshooting Tips</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Check if your card has sufficient balance</li>
                <li>• Ensure your card is enabled for online transactions</li>
                <li>• Verify that you entered the correct card details</li>
                <li>• Try using a different payment method</li>
                <li>• Contact your bank if the issue persists</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Continue Shopping */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Need more time to decide? You can continue shopping and complete your purchase later.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <span>Continue Shopping</span>
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </Link>
        </div>

        {/* Customer Support */}
        <div className="text-center mt-8 pt-8 border-t border-gray-200">
          <p className="text-gray-600 mb-4">
            Still having trouble with your payment? Our customer support team is here to help.
          </p>
          <div className="space-x-4">
            <Link
              href="/contact"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Contact Support
            </Link>
            <span className="text-gray-400">|</span>
            <a
              href="tel:+919876543210"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Call +91 98765 43210
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}