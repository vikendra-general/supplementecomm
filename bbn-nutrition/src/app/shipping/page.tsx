'use client';

import { Truck, Clock, MapPin, Package, Shield, CreditCard } from 'lucide-react';

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Shipping Information</h1>
          
          {/* Shipping Methods */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <Truck className="w-6 h-6 mr-2 text-green-600" />
              Shipping Methods
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Standard Shipping</h3>
                <p className="text-gray-600 mb-3">5-7 business days</p>
                <p className="text-green-600 font-semibold">FREE on orders over ₹999</p>
                <p className="text-gray-500 text-sm">₹99 for orders under ₹999</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Express Shipping</h3>
                <p className="text-gray-600 mb-3">2-3 business days</p>
                <p className="text-blue-600 font-semibold">₹199</p>
                <p className="text-gray-500 text-sm">Available in major cities</p>
              </div>
            </div>
          </section>

          {/* Processing Time */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <Clock className="w-6 h-6 mr-2 text-blue-600" />
              Processing Time
            </h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                All orders are processed within 1-2 business days. Orders placed after 2 PM on Friday 
                will be processed on the next business day.
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Monday - Friday: Orders placed before 2 PM are processed the same day</li>
                <li>Saturday - Sunday: Orders are processed on the next business day</li>
                <li>Holidays: Processing may be delayed by 1-2 business days</li>
              </ul>
            </div>
          </section>

          {/* Delivery Areas */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <MapPin className="w-6 h-6 mr-2 text-red-600" />
              Delivery Areas
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Metro Cities</h3>
                <p className="text-sm text-gray-600">Mumbai, Delhi, Bangalore, Chennai, Kolkata, Hyderabad</p>
                <p className="text-green-600 font-semibold mt-2">1-2 days</p>
              </div>
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Tier 2 Cities</h3>
                <p className="text-sm text-gray-600">Pune, Ahmedabad, Jaipur, Lucknow, Kanpur</p>
                <p className="text-blue-600 font-semibold mt-2">2-4 days</p>
              </div>
              <div className="text-center p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold text-gray-800 mb-2">Other Areas</h3>
                <p className="text-sm text-gray-600">All other serviceable locations</p>
                <p className="text-orange-600 font-semibold mt-2">5-7 days</p>
              </div>
            </div>
          </section>

          {/* Packaging */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <Package className="w-6 h-6 mr-2 text-purple-600" />
              Packaging & Safety
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <Shield className="w-5 h-5 mr-2 text-green-600 mt-0.5" />
                  All products are securely packaged to prevent damage during transit
                </li>
                <li className="flex items-start">
                  <Shield className="w-5 h-5 mr-2 text-green-600 mt-0.5" />
                  Temperature-sensitive products are shipped with appropriate cooling packs
                </li>
                <li className="flex items-start">
                  <Shield className="w-5 h-5 mr-2 text-green-600 mt-0.5" />
                  Discreet packaging available upon request
                </li>
                <li className="flex items-start">
                  <Shield className="w-5 h-5 mr-2 text-green-600 mt-0.5" />
                  Eco-friendly packaging materials used wherever possible
                </li>
              </ul>
            </div>
          </section>

          {/* Payment & Shipping */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <CreditCard className="w-6 h-6 mr-2 text-indigo-600" />
              Payment & Shipping Policy
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>Cash on Delivery (COD):</strong> Available for orders up to ₹5,000. 
                COD charges of ₹50 apply for orders under ₹999.
              </p>
              <p>
                <strong>Prepaid Orders:</strong> Get additional 2% discount on prepaid orders. 
                Faster processing and priority shipping.
              </p>
              <p>
                <strong>International Shipping:</strong> Currently not available. 
                We only ship within India.
              </p>
              <p>
                <strong>Address Changes:</strong> Address changes are possible only before 
                the order is dispatched. Contact customer support immediately.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}