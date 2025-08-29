'use client';

import { useState } from 'react';
import { X, HelpCircle, Info } from 'lucide-react';

interface AdminGuideProps {
  title?: string;
}

export default function AdminGuide({ title = 'Admin Guide' }: AdminGuideProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(true)}
        className="p-1.5 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
        aria-label="Open admin guide"
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-3 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <Info className="w-4 h-4 mr-2 text-green-600" />
                {title}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100"
                aria-label="Close guide"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto">
              <div className="space-y-4">
                <section>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">Admin Login</h3>
                  <p className="text-gray-600 mb-2 text-sm">
                    To access the admin panel, use the following credentials:
                  </p>
                  <div className="bg-gray-50 p-2 rounded-md border border-gray-200">
                    <p className="font-mono text-xs">Email: admin@bbn-nutrition.com</p>
                    <p className="font-mono text-xs">Password: Admin123!</p>
                  </div>
                </section>
                
                <section>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">Dashboard Overview</h3>
                  <p className="text-gray-600 mb-2 text-sm">
                    The dashboard provides an overview of your store&apos;s performance with key metrics:
                  </p>
                  <ul className="list-disc pl-4 space-y-0.5 text-gray-600 text-sm">
                    <li>Total users registered</li>
                    <li>Total products in inventory</li>
                    <li>Total orders placed</li>
                    <li>Total revenue generated</li>
                  </ul>
                </section>
                
                <section>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">Product Management</h3>
                  <p className="text-gray-600 mb-2 text-sm">
                    You can manage your product inventory through the admin panel:
                  </p>
                  <ul className="list-disc pl-4 space-y-0.5 text-gray-600 text-sm">
                    <li>Add new products with details and images</li>
                    <li>Edit existing product information</li>
                    <li>Delete products from inventory</li>
                    <li>Monitor low stock products</li>
                  </ul>
                </section>
                
                <section>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">Order Management</h3>
                  <p className="text-gray-600 mb-2 text-sm">
                    Track and manage customer orders efficiently:
                  </p>
                  <ul className="list-disc pl-4 space-y-0.5 text-gray-600 text-sm">
                    <li>View recent orders and their details</li>
                    <li>Update order status (pending, confirmed, processing, shipped, delivered)</li>
                    <li>Access customer information for each order</li>
                  </ul>
                </section>
                
                <section>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">Need Help?</h3>
                  <p className="text-gray-600 text-sm">
                    If you encounter any issues or have questions about the admin panel, please contact our support team at <a href="mailto:support@bbn-nutrition.com" className="text-green-600 hover:underline">support@bbn-nutrition.com</a>.
                  </p>
                </section>
              </div>
            </div>
            
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-1.5 px-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors text-sm"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}