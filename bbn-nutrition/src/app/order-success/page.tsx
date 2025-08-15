'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { CheckCircle, ShoppingBag, Home } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export default function OrderSuccessPage() {
  const { clearCart } = useCart();
  
  // Clear the cart when the success page loads
  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Order Placed Successfully!
        </h1>
        <p className="mt-4 text-lg text-gray-500">
          Thank you for your purchase. We&apos;ve received your order and are processing it now.
        </p>
        <p className="mt-2 text-md text-gray-500">
          A confirmation email has been sent to your email address.
        </p>
        <p className="mt-2 text-md text-gray-500">
          You will also receive SMS updates about your order status.
        </p>

        <div className="mt-10 border-t border-gray-200 pt-10">
          <h2 className="text-xl font-semibold text-gray-900">What&apos;s Next?</h2>
          <p className="mt-2 text-gray-500">
            You can track your order status in your account dashboard. We&apos;ll also send you updates via email and SMS.
          </p>
        </div>

        <div className="mt-10 flex justify-center space-x-6">
          <Link href="/" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
            <Home className="mr-2 h-5 w-5" />
            Return Home
          </Link>
          <Link href="/profile" className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <ShoppingBag className="mr-2 h-5 w-5" />
            View Orders
          </Link>
        </div>
      </div>
    </div>
  );
}