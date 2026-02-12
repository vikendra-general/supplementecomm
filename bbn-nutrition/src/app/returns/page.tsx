'use client';

import { RotateCcw, CheckCircle, XCircle, Clock, Package, CreditCard, AlertTriangle } from 'lucide-react';

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Returns & Exchanges</h1>
          
          {/* Return Policy Overview */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <RotateCcw className="w-6 h-6 mr-2 text-blue-600" />
              Return Policy Overview
            </h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <p className="text-gray-700 mb-4">
                We offer a <strong>30-day return policy</strong> for most products. Items must be 
                returned in their original condition with all packaging and labels intact.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span>30-day return window</span>
                </div>
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span>Free return shipping</span>
                </div>
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span>Full refund or exchange</span>
                </div>
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span>Easy online process</span>
                </div>
              </div>
            </div>
          </section>

          {/* Eligible Items */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Eligible for Returns</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-green-200 bg-green-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Returnable Items
                </h3>
                <ul className="space-y-2 text-green-700">
                  <li>• Unopened supplement containers</li>
                  <li>• Damaged or defective products</li>
                  <li>• Wrong items shipped</li>
                  <li>• Accessories and equipment</li>
                  <li>• Apparel with tags attached</li>
                </ul>
              </div>
              <div className="border border-red-200 bg-red-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
                  <XCircle className="w-5 h-5 mr-2" />
                  Non-Returnable Items
                </h3>
                <ul className="space-y-2 text-red-700">
                  <li>• Opened supplement containers</li>
                  <li>• Perishable items</li>
                  <li>• Custom or personalized products</li>
                  <li>• Items damaged by misuse</li>
                  <li>• Products past 30-day window</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Return Process */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <Package className="w-6 h-6 mr-2 text-purple-600" />
              How to Return Items
            </h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-semibold">1</div>
                <div>
                  <h3 className="font-semibold text-gray-800">Initiate Return Request</h3>
                  <p className="text-gray-600">Log into your account and go to &apos;My Orders&apos;. Select the item you want to return and click &apos;Return Item&apos;.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-semibold">2</div>
                <div>
                  <h3 className="font-semibold text-gray-800">Select Return Reason</h3>
                  <p className="text-gray-600">Choose the reason for return and provide any additional details. Upload photos if the item is damaged.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-semibold">3</div>
                <div>
                  <h3 className="font-semibold text-gray-800">Print Return Label</h3>
                  <p className="text-gray-600">We&apos;ll email you a prepaid return shipping label. Print it and attach it to the package.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center font-semibold">4</div>
                <div>
                  <h3 className="font-semibold text-gray-800">Ship the Item</h3>
                  <p className="text-gray-600">Package the item securely and drop it off at any authorized shipping location or schedule a pickup.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Refund Information */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <CreditCard className="w-6 h-6 mr-2 text-green-600" />
              Refund Information
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Processing Time</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-blue-600" />
                      Credit/Debit Cards: 5-7 business days
                    </li>
                    <li className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-blue-600" />
                      UPI/Net Banking: 3-5 business days
                    </li>
                    <li className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-blue-600" />
                      Wallet: 1-2 business days
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Refund Method</h3>
                  <p className="text-gray-600 mb-2">
                    Refunds are processed to the original payment method used for the purchase.
                  </p>
                  <p className="text-gray-600">
                    For COD orders, refunds are processed via bank transfer or store credit.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Exchange Policy */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Exchange Policy</h2>
            <div className="border border-orange-200 bg-orange-50 rounded-lg p-6">
              <p className="text-orange-800 mb-4">
                <strong>Size/Flavor Exchanges:</strong> Available for unopened products within 30 days. 
                Price differences may apply for upgraded products.
              </p>
              <ul className="space-y-2 text-orange-700">
                <li>• Same product, different size or flavor</li>
                <li>• Upgrade to premium variant (pay difference)</li>
                <li>• Defective item replacement</li>
                <li>• Wrong item shipped</li>
              </ul>
            </div>
          </section>

          {/* Important Notes */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center">
              <AlertTriangle className="w-6 h-6 mr-2 text-yellow-600" />
              Important Notes
            </h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600 mt-0.5" />
                  Return shipping is free for defective or wrong items. Customer pays return shipping for other reasons.
                </li>
                <li className="flex items-start">
                  <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600 mt-0.5" />
                  Items must be returned in original packaging with all labels and seals intact.
                </li>
                <li className="flex items-start">
                  <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600 mt-0.5" />
                  Refunds exclude original shipping charges unless the return is due to our error.
                </li>
                <li className="flex items-start">
                  <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600 mt-0.5" />
                  Contact customer support for any questions about returns or exchanges.
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}