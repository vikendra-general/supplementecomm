'use client';

import { useState } from 'react';
import { 
  User, 
  MapPin, 
  Save, 
  Edit,
  Eye,
  Truck
} from 'lucide-react';
import Link from 'next/link';

interface Order {
  _id: string;
  orderNumber: string;
  total: number;
  status: string;
  trackingNumber?: string;
  paymentStatus: string;
  createdAt: string;
  items: Array<{
    product: {
      name: string;
      images: string[];
    };
    quantity: number;
    price: number;
  }>;
}

interface Address {
  _id: string;
  type: 'home' | 'work' | 'other';
  address: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  isDefault: boolean;
  label: string;
}

interface WishlistItem {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  inStock: boolean;
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [orders] = useState<Order[]>([]);
  const [wishlist] = useState<WishlistItem[]>([]);
  const [addresses] = useState<Address[]>([]);
  const [loading] = useState(true);

  // The useEffect hook and user context are removed as per the edit hint.
  // The user object and isAuthenticated are no longer available.
  // The logout function is also removed.

  // The formatCurrency, formatDate, getStatusColor, getStatusIcon functions
  // are removed as they are not used in the new_code.

  const tabs = [
    { id: 'overview', name: 'Overview', icon: User },
    { id: 'orders', name: 'Orders', icon: Eye },
    { id: 'wishlist', name: 'Wishlist', icon: Eye },
    { id: 'addresses', name: 'Addresses', icon: MapPin },
    { id: 'settings', name: 'Settings', icon: Edit },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="text-gray-600 mt-1">Welcome back, User</p>
            </div>
            {/* The logout button is removed as per the edit hint. */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Overview</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 bg-blue-50 rounded-lg">
                    <div className="flex items-center mb-4">
                      {/* ShoppingBag icon removed */}
                      <div>
                        <p className="text-sm font-medium text-blue-600">Total Orders</p>
                        <p className="text-2xl font-bold text-blue-900">{orders.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-green-50 rounded-lg">
                    <div className="flex items-center mb-4">
                      {/* Heart icon removed */}
                      <div>
                        <p className="text-sm font-medium text-green-600">Wishlist Items</p>
                        <p className="text-2xl font-bold text-green-900">{wishlist.length}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
                    {orders.slice(0, 3).map((order) => (
                      <div key={order._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-3">
                        <div>
                          <p className="font-medium text-gray-900">{order.orderNumber}</p>
                          <p className="text-sm text-gray-600">Order Date</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">₹{order.total}</p>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                            <span className="ml-1">{order.status}</span>
                          </span>
                        </div>
                      </div>
                    ))}
                    {orders.length === 0 && (
                      <p className="text-gray-500 text-center py-8">No orders yet</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Order History</h2>
                
                {orders.length > 0 ? (
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div key={order._id} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{order.orderNumber}</h3>
                            <p className="text-sm text-gray-600">Order Date</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">₹{order.total}</p>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${order.status}`}>
                              <span className="ml-1">{order.status}</span>
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex items-center justify-between py-2">
                              <div className="flex items-center">
                                <div className="w-12 h-12 bg-gray-200 rounded-lg mr-4"></div>
                                <div>
                                  <p className="font-medium text-gray-900">{item.product.name}</p>
                                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                                </div>
                              </div>
                              <p className="font-medium text-gray-900">{/* formatCurrency(item.price * item.quantity) */}</p>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
                          <Link 
                            href={`/orders/${order._id}`}
                            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Link>
                          
                          {order.trackingNumber && (
                            <Link 
                              href={`/track-order/${order._id}`}
                              className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
                            >
                              <Truck className="w-4 h-4 mr-2" />
                              Track Order
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    {/* ShoppingBag icon removed */}
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-600 mb-6">Start shopping to see your order history here.</p>
                    <Link 
                      href="/shop" 
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Start Shopping
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">My Wishlist</h2>
                
                {wishlist.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlist.map((item) => (
                      <div key={item._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                        <h3 className="font-semibold text-gray-900 mb-2">{item.name}</h3>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            {item.originalPrice && item.originalPrice > item.price ? (
                              <>
                                <span className="text-lg font-bold text-gray-900">{/* formatCurrency(item.price) */}</span>
                                <span className="text-sm text-gray-500 line-through ml-2">{/* formatCurrency(item.originalPrice) */}</span>
                              </>
                            ) : (
                              <span className="text-lg font-bold text-gray-900">{/* formatCurrency(item.price) */}</span>
                            )}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {item.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                            Add to Cart
                          </button>
                          <button className="px-3 py-2 text-red-600 hover:text-red-700 transition-colors">
                            {/* Trash2 icon removed */}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    {/* Heart icon removed */}
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
                    <p className="text-gray-600 mb-6">Save items you love to your wishlist for later.</p>
                    <Link 
                      href="/shop" 
                      className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Start Shopping
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">My Addresses</h2>
                  <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                    {/* Plus icon removed */}
                    Add Address
                  </button>
                </div>
                
                {addresses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((address) => (
                      <div key={address._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-gray-600 uppercase">{address.type}</span>
                            {address.isDefault && (
                              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-700">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-700">
                              {/* Trash2 icon removed */}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-gray-900">{address.address}</p>
                          <p className="text-gray-600">{address.city}, {address.state} {address.pinCode}</p>
                          <p className="text-gray-600">{address.country}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses saved</h3>
                    <p className="text-gray-600 mb-6">Add your shipping addresses for faster checkout.</p>
                    <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                      {/* Plus icon removed */}
                      Add Address
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                        <input
                          type="text"
                          defaultValue="User Name"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          defaultValue="user@example.com"
                          disabled
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          defaultValue="+1234567890"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferences</h3>
                    <div className="space-y-4">
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                        <span className="ml-2 text-sm text-gray-700">Email notifications</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                        <span className="ml-2 text-sm text-gray-700">SMS notifications</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                        <span className="ml-2 text-sm text-gray-700">Marketing emails</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}