'use client';

import { useState, useEffect } from 'react';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle,
  Truck,
  MapPin,
  AlertCircle,
  Heart,
  Settings,
  Users,
  ShoppingBag,
  BarChart3,
  FileText,
  Shield,
  Star,
  Trash2,
  Plus,
  X,
  Navigation,
  Edit3
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/contexts/OrderContext';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Product } from '@/types';
import { formatPrice } from '@/utils/currency';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

export default function DashboardPage() {
  const { user } = useAuth();
  const { orders, isLoading, error, cancelOrder, requestReturn } = useOrders();
  const { addToCart } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('orders');
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const [addresses, setAddresses] = useState<{
    _id: string;
    type: 'home' | 'work' | 'other';
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
  }[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressMethod, setAddressMethod] = useState<'manual' | 'location' | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [addressForm, setAddressForm] = useState({
    type: 'home' as 'home' | 'work' | 'other',
    flatNumber: '',
    building: '',
    address: '',
    landmark: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    isDefault: false
  });

  // Set default tab based on user role and URL params
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    } else if (user) {
      setActiveTab(user.role === 'admin' ? 'overview' : 'orders');
    }
  }, [user, searchParams]);

  // Load wishlist items from localStorage
  useEffect(() => {
    const loadWishlist = () => {
      try {
        const userId = user?.id || 'anonymous';
        const wishlistKey = `wishlist_${userId}`;
        const savedWishlist = localStorage.getItem(wishlistKey);
        
        if (savedWishlist) {
           const wishlistData: Array<{product: Product, addedAt: string}> = JSON.parse(savedWishlist);
           const products = wishlistData.map((item) => item.product);
           setWishlistItems(products);
         }
      } catch (error) {
        console.error('Error loading wishlist:', error);
      } finally {
        setWishlistLoading(false);
      }
    };

    if (user) {
      loadWishlist();
    } else {
      setWishlistLoading(false);
    }
  }, [user]);

  // Initialize profile form with user data
  useEffect(() => {
    if (user) {
      const nameParts = user.name?.split(' ') || [''];
      setProfileForm({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  // Load addresses from API
  useEffect(() => {
    const loadAddresses = async () => {
      try {
         setAddressesLoading(true);
         if (user) {
          const token = localStorage.getItem('token');
          if (token) {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/user/addresses`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (response.ok) {
              const result = await response.json();
              if (result.success) {
                setAddresses(result.addresses || []);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading addresses:', error);
      } finally {
        setAddressesLoading(false);
      }
    };

    loadAddresses();
  }, [user]);

  // Remove item from wishlist
  const removeFromWishlist = (productId: string) => {
    try {
      const userId = user?.id || 'anonymous';
      const wishlistKey = `wishlist_${userId}`;
      const savedWishlist = localStorage.getItem(wishlistKey);
      
      if (savedWishlist) {
         const wishlistData: Array<{product: Product, addedAt: string}> = JSON.parse(savedWishlist);
         const updatedWishlist = wishlistData.filter((item) => item.product.id !== productId);
         localStorage.setItem(wishlistKey, JSON.stringify(updatedWishlist));
         
         const products = updatedWishlist.map((item) => item.product);
         setWishlistItems(products);
         toast.success('Removed from wishlist');
       }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
    }
  };

  // Add to cart from wishlist
   const handleAddToCartFromWishlist = async (product: Product) => {
     try {
       await addToCart(product, 1);
       toast.success('Added to cart');
     } catch (error) {
       console.error('Error adding to cart:', error);
       toast.error('Failed to add to cart');
     }
   };

  // Address management functions
  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowAddressModal(true);
    setAddressMethod(null);
  };

  const handleEditAddress = (address: typeof addresses[0]) => {
    setEditingAddress(address._id);
    
    // Parse the combined address back into components
     const addressParts = address.address.split(', ');
     const flatNumber = '';
     const building = '';
     let streetAddress = address.address;
     let landmark = '';
    
    // Try to extract flat number, building, and landmark if they exist
    // This is a best-effort parsing since we combined them when saving
    if (addressParts.length > 1) {
      streetAddress = addressParts.slice(0, -1).join(', ');
      // If the last part looks like a landmark (contains common landmark words)
      const lastPart = addressParts[addressParts.length - 1];
      if (lastPart.toLowerCase().includes('near') || lastPart.toLowerCase().includes('opposite') || 
          lastPart.toLowerCase().includes('behind') || lastPart.toLowerCase().includes('metro')) {
        landmark = lastPart;
        streetAddress = addressParts.slice(0, -2).join(', ');
      }
    }
    
    setAddressForm({
      type: address.type,
      flatNumber: flatNumber,
      building: building,
      address: streetAddress,
      landmark: landmark,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      isDefault: address.isDefault
    });
    
    setShowAddressModal(true);
    setAddressMethod('manual');
  };

  const handleCloseAddressModal = () => {
    setShowAddressModal(false);
    setAddressMethod(null);
    setLocationLoading(false);
    setEditingAddress(null);
    setAddressForm({
      type: 'home',
      flatNumber: '',
      building: '',
      address: '',
      landmark: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'India',
      isDefault: false
    });
  };

  const handleGetCurrentLocation = () => {
     setAddressMethod('location');
     setLocationLoading(true);
     
     if (!navigator.geolocation) {
       toast.error('Geolocation is not supported by this browser');
       setLocationLoading(false);
       return;
     }

     navigator.geolocation.getCurrentPosition(
       async (position) => {
         try {
           const { latitude, longitude } = position.coords;
           
           // Use a free reverse geocoding service (Nominatim by OpenStreetMap)
           const response = await fetch(
             `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
           );
           
           if (response.ok) {
             const data = await response.json();
             if (data && data.address) {
               const addr = data.address;
               
               // Extract address components
               const houseNumber = addr.house_number || '';
               const road = addr.road || addr.street || '';
               const neighbourhood = addr.neighbourhood || addr.suburb || addr.quarter || '';
               const city = addr.city || addr.town || addr.village || addr.municipality || '';
               const state = addr.state || addr.province || '';
               const postcode = addr.postcode || '';
               const country = addr.country || 'India';
               
               // Construct full address
               const fullAddress = [houseNumber, road, neighbourhood].filter(Boolean).join(' ');
               
               setAddressForm({
                 ...addressForm,
                 address: fullAddress || `${road} ${neighbourhood}`.trim() || 'Address detected',
                 city: city || 'City detected',
                 state: state || 'State detected',
                 zipCode: postcode || '',
                 country: country
               });
               
               toast.success('Location detected and address filled automatically! You can edit any details if needed.');
             } else {
               // Fallback with basic location info
               setAddressForm({
                 ...addressForm,
                 address: `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
                 city: 'Please enter city',
                 state: 'Please enter state',
                 zipCode: '',
                 country: 'India'
               });
               toast.success('Location detected! Please fill in the address details.');
             }
           } else {
             // Fallback: set basic location info
             setAddressForm({
               ...addressForm,
               address: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
               city: 'Please enter city',
               state: 'Please enter state',
               zipCode: '',
               country: 'India'
             });
             toast.success('Location detected! Please fill in the address details.');
           }
         } catch (error) {
           console.error('Error getting address from coordinates:', error);
           // Even on error, we can still use the coordinates
           const { latitude, longitude } = position.coords;
           setAddressForm({
             ...addressForm,
             address: `Location detected (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
             city: 'Please enter city',
             state: 'Please enter state',
             zipCode: '',
             country: 'India'
           });
           toast.success('Location detected! Please fill in the address details.');
         } finally {
           setLocationLoading(false);
         }
       },
       (error) => {
         console.error('Error getting location:', error);
         let errorMessage = 'Could not get your location. ';
         
         switch (error.code) {
           case error.PERMISSION_DENIED:
             errorMessage += 'Please allow location access and try again.';
             break;
           case error.POSITION_UNAVAILABLE:
             errorMessage += 'Location information is unavailable.';
             break;
           case error.TIMEOUT:
             errorMessage += 'Location request timed out.';
             break;
           default:
             errorMessage += 'An unknown error occurred.';
             break;
         }
         
         toast.error(errorMessage);
         setLocationLoading(false);
         setAddressMethod(null); // Go back to method selection
       },
       {
         enableHighAccuracy: true,
         timeout: 15000,
         maximumAge: 60000
       }
     );
   };

  const handleManualAddress = () => {
    setAddressMethod('manual');
  };

  const handleAddressFormChange = (field: string, value: string | boolean) => {
    setAddressForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveAddress = async () => {
    // Validate form - only essential fields are required
    if (!addressForm.address || !addressForm.city || !addressForm.state || !addressForm.zipCode) {
      toast.error('Please fill in all required fields (Street Address, City, State, ZIP Code)');
      return;
    }

    try {
      // Prepare address data for API
      const addressData = {
        type: addressForm.type,
        address: `${addressForm.flatNumber ? addressForm.flatNumber + ', ' : ''}${addressForm.building ? addressForm.building + ', ' : ''}${addressForm.address}${addressForm.landmark ? ', ' + addressForm.landmark : ''}`,
        city: addressForm.city,
        state: addressForm.state,
        zipCode: addressForm.zipCode,
        country: addressForm.country,
        isDefault: addressForm.isDefault
      };

      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to save address');
        return;
      }

      const isEditing = editingAddress !== null;
      const apiUrl = isEditing 
        ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/user/addresses/${editingAddress}`
        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/user/addresses`;

      const response = await fetch(apiUrl, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(addressData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(isEditing ? 'Address updated successfully!' : 'Address saved successfully!');
        handleCloseAddressModal();
        setEditingAddress(null);
        // Refresh the addresses list
        setAddresses(result.addresses || []);
      } else {
        toast.error(result.message || 'Failed to save address');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('Failed to save address. Please try again.');
    }
  };

  // Profile management functions
  const handleProfileFormChange = (field: string, value: string) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileForm.firstName || !profileForm.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setProfileLoading(true);
      
      const profileData = {
        name: `${profileForm.firstName} ${profileForm.lastName}`.trim(),
        email: profileForm.email,
        phone: profileForm.phone
      };

      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to update profile');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('Profile updated successfully!');
        // Update the user context if available
        if (result.user) {
          // The AuthContext should handle this update
        }
      } else {
        toast.error(result.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setProfileLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'shipped':
        return 'text-primary bg-primary/10';
      case 'processing':
      case 'confirmed':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      case 'returned':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'processing':
      case 'confirmed':
        return <Clock className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      case 'returned':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (confirm('Are you sure you want to cancel this order?')) {
      await cancelOrder(orderId);
    }
  };

  const handleReturnOrder = async (orderId: string) => {
    const reason = prompt('Please provide a reason for the return:');
    if (reason) {
      await requestReturn(orderId, reason, []);
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {user?.role === 'admin' ? 'Admin Dashboard' : 'My Dashboard'}
          </h1>
          <p className="text-gray-600 mb-6">
            {user?.role === 'admin' 
              ? 'Welcome to the admin panel! Manage your store, products, orders, and users from here.'
              : 'Welcome back! Here\'s an overview of your account and recent orders.'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              {/* User Info */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-light rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg ring-4 ring-primary/20">
                  <span className="text-white font-bold text-xl">{user?.name?.charAt(0) || 'U'}</span>
                </div>
                <h3 className="font-semibold text-gray-900">{user?.name}</h3>
                <p className="text-sm text-gray-600">{user?.email}</p>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {(user?.role === 'admin' ? [
                  { id: 'overview', label: 'Admin Overview', icon: BarChart3 },
                  { id: 'products', label: 'Manage Products', icon: ShoppingBag },
                  { id: 'orders', label: 'All Orders', icon: Package },
                  { id: 'users', label: 'Manage Users', icon: Users },
                  { id: 'reports', label: 'Reports', icon: FileText },
                  { id: 'settings', label: 'Admin Settings', icon: Shield }
                ] : [
                  { id: 'orders', label: 'My Orders', icon: Package },
                  { id: 'wishlist', label: 'Wishlist', icon: Heart },
                  { id: 'addresses', label: 'Addresses', icon: MapPin },
                  { id: 'settings', label: 'Account Settings', icon: Settings }
                ]).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === item.id
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Admin Overview Tab */}
            {activeTab === 'overview' && user?.role === 'admin' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Admin Overview</h2>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Products</p>
                        <p className="text-2xl font-bold text-gray-900">--</p>
                      </div>
                      <ShoppingBag className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Orders</p>
                        <p className="text-2xl font-bold text-gray-900">--</p>
                      </div>
                      <Package className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Users</p>
                        <p className="text-2xl font-bold text-gray-900">--</p>
                      </div>
                      <Users className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">₹--</p>
                      </div>
                      <BarChart3 className="w-8 h-8 text-orange-600" />
                    </div>
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Link href="/admin/products" className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <ShoppingBag className="w-6 h-6 text-primary" />
                      <span className="font-medium text-gray-900">Manage Products</span>
                    </Link>
                    
                    <Link href="/admin/orders" className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <Package className="w-6 h-6 text-green-600" />
                      <span className="font-medium text-gray-900">View All Orders</span>
                    </Link>
                    
                    <Link href="/admin/users" className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <Users className="w-6 h-6 text-purple-600" />
                      <span className="font-medium text-gray-900">Manage Users</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
            
            {/* Admin Products Tab */}
            {activeTab === 'products' && user?.role === 'admin' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Manage Products</h2>
                  <Link href="/admin/products" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                    Go to Product Management
                  </Link>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <p className="text-gray-600 mb-4">Access the full product management interface to:</p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>Add new products</li>
                    <li>Edit existing products</li>
                    <li>Manage inventory</li>
                    <li>Set pricing and discounts</li>
                    <li>Upload product images</li>
                  </ul>
                </div>
              </div>
            )}
            
            {/* Admin Users Tab */}
            {activeTab === 'users' && user?.role === 'admin' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Manage Users</h2>
                  <Link href="/admin/users" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                    Go to User Management
                  </Link>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <p className="text-gray-600 mb-4">Access the user management interface to:</p>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>View all registered users</li>
                    <li>Manage user roles and permissions</li>
                    <li>Handle user support requests</li>
                    <li>Monitor user activity</li>
                  </ul>
                </div>
              </div>
            )}
            
            {/* Admin Reports Tab */}
            {activeTab === 'reports' && user?.role === 'admin' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Reports</h3>
                    <p className="text-gray-600 mb-4">View detailed sales analytics and revenue reports.</p>
                    <button className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                      View Sales Reports
                    </button>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Analytics</h3>
                    <p className="text-gray-600 mb-4">Analyze product performance and inventory trends.</p>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      View Product Analytics
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {user?.role === 'admin' ? 'All Orders' : 'My Orders'}
                  </h2>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700">{error}</p>
                  </div>
                )}

                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading orders...</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                    <p className="text-gray-600 mb-4">You haven&apos;t placed any orders yet.</p>
                    <Link 
                      href="/shop"
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block"
                    >
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order._id} className="bg-white border border-gray-200 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-gray-900">Order #{order.orderNumber}</h3>
                              <p className="text-sm text-gray-600">
                                Placed on {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                              {order.trackingNumber && (
                                <p className="text-sm text-gray-500">
                                  Tracking: {order.trackingNumber}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">${order.total.toFixed(2)}</p>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                {getStatusIcon(order.status)}
                                <span className="ml-1">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                              </span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">
                                  {item.name} {item.variant && `(${item.variant.name})`} (Qty: {item.quantity})
                                </span>
                                <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                              <p>Subtotal: ${order.subtotal.toFixed(2)}</p>
                              <p>Tax: ${order.tax.toFixed(2)}</p>
                              <p>Shipping: ${order.shipping.toFixed(2)}</p>
                            </div>
                            <div className="flex space-x-2">
                              <button className="text-primary hover:text-primary-dark font-medium text-sm">
                                View Details
                              </button>
                              {order.trackingNumber && (
                                <Link 
                                  href={`/track-order/${order._id}`}
                                  className="text-green-600 hover:text-green-700 font-medium text-sm flex items-center"
                                >
                                  <Truck className="w-3 h-3 mr-1" />
                                  Track Order
                                </Link>
                              )}
                              {order.status === 'pending' || order.status === 'confirmed' || order.status === 'processing' ? (
                                <button 
                                  onClick={() => handleCancelOrder(order._id)}
                                  className="text-red-600 hover:text-red-700 font-medium text-sm"
                                >
                                  Cancel Order
                                </button>
                              ) : order.status === 'delivered' ? (
                                <button 
                                  onClick={() => handleReturnOrder(order._id)}
                                  className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                                >
                                  Request Return
                                </button>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">My Wishlist</h2>
                </div>
                
                {wishlistLoading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading wishlist...</p>
                  </div>
                ) : wishlistItems.length === 0 ? (
                  <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
                    <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
                    <p className="text-gray-600 mb-4">Start adding products to your wishlist to see them here.</p>
                    <Link 
                      href="/shop"
                      className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors inline-block"
                    >
                      Browse Products
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlistItems.map((product) => (
                      <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                        {/* Product Image */}
                        <div className="relative aspect-square mb-4 overflow-hidden rounded-lg">
                          <Image
                            src={product.images[0] || '/images/products/placeholder.svg'}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                        
                        {/* Product Info */}
                        <div className="space-y-2">
                          <p className="text-sm text-gray-500">{product.brand}</p>
                          <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
                          
                          {/* Rating */}
                          <div className="flex items-center">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.floor(product.rating)
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500 ml-1">({product.reviews})</span>
                          </div>
                          
                          {/* Price */}
                          <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-gray-900">
                              {formatPrice(product.price)}
                            </span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-sm text-gray-500 line-through">
                                {formatPrice(product.originalPrice)}
                              </span>
                            )}
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex space-x-2 mt-4">
                            <button
                              onClick={() => handleAddToCartFromWishlist(product)}
                              disabled={!product.inStock}
                              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                                product.inStock
                                  ? 'bg-primary text-white hover:bg-primary-dark'
                                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              }`}
                            >
                              {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                            </button>
                            <button
                              onClick={() => removeFromWishlist(product.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove from wishlist"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">My Addresses</h2>
                  <button 
                    onClick={handleAddAddress}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Address</span>
                  </button>
                </div>
                
                {addressesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-3 text-gray-600">Loading addresses...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.length > 0 ? (
                      addresses.map((address) => (
                        <div key={address._id} className="bg-white border border-gray-200 rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900">
                              {address.type.charAt(0).toUpperCase() + address.type.slice(1)} Address
                              {address.isDefault && (
                                <span className="ml-2 bg-primary/10 text-primary text-xs px-2 py-1 rounded">
                                  Default
                                </span>
                              )}
                            </h3>
                            <button 
                              onClick={() => handleEditAddress(address)}
                              className="text-primary hover:text-primary-dark text-sm font-medium"
                            >
                              Edit
                            </button>
                          </div>
                          <div className="space-y-2 text-gray-600">
                            <p>{address.address}</p>
                            <p>{address.city}, {address.state} {address.zipCode}</p>
                            <p>{address.country}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full bg-white border border-gray-200 rounded-lg p-8 text-center">
                        <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="font-semibold text-gray-900 mb-2">No addresses yet</h3>
                        <p className="text-gray-600 mb-6">Add your first shipping address to get started</p>
                        <button 
                          onClick={handleAddAddress}
                          className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors flex items-center space-x-2 mx-auto"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Your First Address</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
                
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          value={profileForm.firstName}
                          onChange={(e) => handleProfileFormChange('firstName', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={profileForm.lastName}
                          onChange={(e) => handleProfileFormChange('lastName', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => handleProfileFormChange('email', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => handleProfileFormChange('phone', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t border-gray-200">
                      <button
                        type="submit"
                        disabled={profileLoading}
                        className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {profileLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Saving...</span>
                          </>
                        ) : (
                          <span>Save Changes</span>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </h2>
                <button
                  onClick={handleCloseAddressModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {!addressMethod ? (
                <div className="space-y-4">
                  <p className="text-gray-600 mb-6">How would you like to add your address?</p>
                  
                  <button
                    onClick={handleGetCurrentLocation}
                    disabled={locationLoading}
                    className="w-full p-4 border-2 border-primary rounded-lg hover:bg-primary/5 transition-colors flex items-center space-x-3"
                  >
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      {locationLoading ? (
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Navigation className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">
                        {locationLoading ? 'Getting Location...' : 'Use Current Location'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {locationLoading ? 'Please wait while we detect your location' : 'We\'ll automatically detect your address'}
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={handleManualAddress}
                    className="w-full p-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-3"
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Edit3 className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-gray-900">Enter Manually</h3>
                      <p className="text-sm text-gray-600">Type your address details</p>
                    </div>
                  </button>
                </div>
              ) : (
                 <div className="space-y-4">
                   {addressMethod === 'location' && (
                     <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                       <div className="flex items-center space-x-2">
                         <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                         <p className="text-sm text-green-800 font-medium">
                           Address auto-filled from your location
                         </p>
                       </div>
                       <p className="text-xs text-green-600 mt-1">
                         You can edit any field below if the information needs correction
                       </p>
                     </div>
                   )}
                   
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Address Type
                     </label>
                    <select
                      value={addressForm.type}
                      onChange={(e) => handleAddressFormChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="home">Home</option>
                      <option value="work">Work</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Flat/Room Number
                        </label>
                        <input
                          type="text"
                          value={addressForm.flatNumber}
                          onChange={(e) => handleAddressFormChange('flatNumber', e.target.value)}
                          placeholder="Flat 101, Room 5A"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Building Name
                        </label>
                        <input
                          type="text"
                          value={addressForm.building}
                          onChange={(e) => handleAddressFormChange('building', e.target.value)}
                          placeholder="Building name/number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>

                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Street Address *
                     </label>
                     <input
                       type="text"
                       value={addressForm.address}
                       onChange={(e) => handleAddressFormChange('address', e.target.value)}
                       placeholder="Street name, Area"
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                     />
                   </div>

                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Landmark (Optional)
                     </label>
                     <input
                       type="text"
                       value={addressForm.landmark}
                       onChange={(e) => handleAddressFormChange('landmark', e.target.value)}
                       placeholder="Near metro station, mall, etc."
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                     />
                   </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        value={addressForm.city}
                        onChange={(e) => handleAddressFormChange('city', e.target.value)}
                        placeholder="City"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        value={addressForm.state}
                        onChange={(e) => handleAddressFormChange('state', e.target.value)}
                        placeholder="State"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP Code *
                      </label>
                      <input
                        type="text"
                        value={addressForm.zipCode}
                        onChange={(e) => handleAddressFormChange('zipCode', e.target.value)}
                        placeholder="ZIP Code"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        value={addressForm.country}
                        onChange={(e) => handleAddressFormChange('country', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={addressForm.isDefault}
                      onChange={(e) => handleAddressFormChange('isDefault', e.target.checked)}
                      className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                    />
                    <label htmlFor="isDefault" className="text-sm text-gray-700">
                      Set as default address
                    </label>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => setAddressMethod(null)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSaveAddress}
                      className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      Save Address
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}