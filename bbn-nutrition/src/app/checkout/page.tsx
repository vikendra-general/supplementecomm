'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Truck, Shield, Lock } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatINR } from '@/utils/currency';
import { apiService } from '@/utils/api';
import { Address } from '@/types';
import Script from 'next/script';

// Declare Razorpay for TypeScript
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
}

interface RazorpayInstance {
  open(): void;
  close(): void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface OrderData {
  _id: string;
  user: string;
  items: Array<{
    product: string;
    name: string;
    price: number;
    quantity: number;
    variant?: {
      id: string;
      name: string;
      price: number;
    } | null;
  }>;
  shippingAddress: {
    fullName: string;
    street: string;
    landmark: string;
    city: string;
    district: string;
    state: string;
    pincode: string;
    country: string;
    email?: string;
    phone?: string;
  };
  billingAddress: {
    fullName: string;
    street: string;
    landmark: string;
    city: string;
    district: string;
    state: string;
    pincode: string;
    country: string;
    email?: string;
    phone?: string;
  };
  paymentMethod: string;
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
}



export default function CheckoutPage() {
  const { items, getCartTotal, clearCart } = useCart();
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedShippingAddress, setSelectedShippingAddress] = useState<Address | null>(null);
  const [selectedBillingAddress, setSelectedBillingAddress] = useState<Address | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressFormType, setAddressFormType] = useState('shipping'); // 'shipping' or 'billing'
  const [formData, setFormData] = useState({
    // Billing Info
    fullName: '',
    email: '',
    phone: '',
    street: '',
    landmark: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    country: 'India',
    
    // Shipping
    sameAsBilling: true,
    shippingFullName: '',
    shippingStreet: '',
    shippingLandmark: '',
    shippingCity: '',
    shippingDistrict: '',
    shippingState: '',
    shippingPincode: '',
    
    // Payment
    paymentMethod: 'razorpay'
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/checkout');
    }
  }, [isAuthenticated, isLoading, router]);

  // Load user data and addresses
  useEffect(() => {
    if (isAuthenticated && user) {
      // Pre-fill form with user data
      setFormData(prev => ({
        ...prev,
        fullName: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || ''
      }));

      // Load user addresses
      const loadAddresses = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            console.log('No token found, skipping address loading');
            return;
          }

          console.log('Loading addresses for user:', user?.email);
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/user/addresses`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const result = await response.json();
            console.log('Address API response:', result);
            if (result.success && result.addresses) {
              console.log('Found addresses:', result.addresses.length);
              setAddresses(result.addresses);
              
              // Auto-select default address if available
               const defaultAddress = result.addresses.find((addr: Address) => addr.isDefault);
              if (defaultAddress) {
                console.log('Auto-selecting default address:', defaultAddress);
                setSelectedShippingAddress(defaultAddress);
                setSelectedBillingAddress(defaultAddress);
              }
            } else {
              console.log('No addresses found or API response structure unexpected');
            }
          } else {
            console.error('Failed to load addresses:', response.status, response.statusText);
          }
        } catch (error) {
          console.error('Error loading addresses:', error);
        }
      };

      loadAddresses();
    }
  }, [isAuthenticated, user]);
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Show authentication required message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-6">
            Please log in to your account to proceed with checkout.
          </p>
          <Link
            href="/login?redirect=/checkout"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let value = e.target.value;
    
    // Special handling for PIN code fields
    if (e.target.name === 'pincode' || e.target.name === 'shippingPincode') {
      // Remove any non-numeric characters and trim whitespace
      value = value.replace(/[^0-9]/g, '').trim();
      // Limit to 6 digits
      value = value.slice(0, 6);
    }
    
    setFormData(prev => ({
      ...prev,
      [e.target.name]: value
    }));
  };

  // Validate Indian phone number (10 digits, optionally with +91 prefix)
  // Handle Razorpay payment
  const handleRazorpayPayment = async (order: OrderData) => {
    try {
      console.log('Creating Razorpay order for:', order._id, 'Amount:', order.total);
      
      // Create Razorpay order
      const response = await apiService.createRazorpayOrder({
        amount: order.total,
        currency: 'INR',
        orderId: order._id
      });

      console.log('Razorpay order response:', response);

      if (!response || !response.success) {
        console.error('Razorpay order creation failed:', response);
        throw new Error(response?.message || 'Failed to create Razorpay order');
      }

      if (!response.data) {
        console.error('Razorpay response missing data:', response);
        throw new Error('Invalid response from payment service');
      }

      const razorpayData = response.data as {
         amount: number;
         currency: string;
         orderId: string;
         key: string;
       };

       // Validate required fields
       if (!razorpayData.amount || !razorpayData.orderId) {
         console.error('Missing required Razorpay data:', razorpayData);
         throw new Error('Invalid payment data received');
       }

       console.log('Razorpay data:', razorpayData);

       const options: RazorpayOptions = {
         key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
         amount: razorpayData.amount,
         currency: razorpayData.currency,
         name: 'BBN Nutrition',
         description: `Order #${order._id}`,
         order_id: razorpayData.orderId,
        handler: async (paymentResponse) => {
          try {
            // Verify payment
            const verifyResult = await apiService.verifyRazorpayPayment({
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature,
              orderId: order._id
            });

            if (verifyResult.success) {
              await sendOrderNotifications(order);
              clearCart();
              router.push(`/order-success?orderId=${order._id}`);
            } else {
              alert('Payment verification failed. Please contact support.');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: formData.fullName,
          email: formData.email || '',
          contact: formData.phone || ''
        },
        theme: {
          color: '#16a34a'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Razorpay payment error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment initialization failed';
      alert(`Payment Error: ${errorMessage}. Please try again.`);
      
      // Optional: Show a more user-friendly error message
      import('react-hot-toast').then(({ default: toast }) => {
        toast.error(`Payment failed: ${errorMessage}`);
      });
    }
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/;
    return phoneRegex.test(phone);
  };

  // Validate Indian PIN code (6 digits)
  const validatePincode = (pincode: string) => {
    if (!pincode) return false;
    
    // Remove any whitespace
    const cleanPincode = pincode.trim();
    
    // Check if it's exactly 6 digits
    const pincodeRegex = /^[0-9]{6}$/;
    const isValid = pincodeRegex.test(cleanPincode);
    
    // Debug logging
    if (!isValid && cleanPincode.length === 6) {
      console.log('PIN code validation failed:', {
        original: pincode,
        cleaned: cleanPincode,
        length: cleanPincode.length,
        characters: cleanPincode.split('').map(c => ({ char: c, code: c.charCodeAt(0) }))
      });
    }
    
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data based on current step
    if (step === 1) {
      // Validate phone and pincode for billing address
      if (!validatePhone(formData.phone)) {
        alert('Please enter a valid Indian phone number');
        return;
      }
      
      if (!validatePincode(formData.pincode)) {
        alert('Please enter a valid 6-digit PIN code');
        return;
      }
      
      setStep(2);
    } else if (step === 2) {
      // Validate shipping address pincode if different from billing
      if (!formData.sameAsBilling && !validatePincode(formData.shippingPincode)) {
        alert('Please enter a valid 6-digit PIN code for shipping address');
        return;
      }
      
      setStep(3);
    } else {
      // Process order
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('Please log in to place an order');
          return;
        }

        // Create order data
        const orderData = {
          items: items.map(item => ({
            product: item.product.id,
            quantity: item.quantity
          })),
          shippingAddress: {
            fullName: formData.fullName,
            address: `${formData.street}, ${formData.landmark}`.replace(', ,', ',').replace(/^,|,$/g, ''),
            city: formData.city,
            state: formData.state,
            pinCode: formData.pincode,
            country: formData.country
          },
          billingAddress: formData.sameAsBilling ? {
            fullName: formData.fullName,
            address: `${formData.street}, ${formData.landmark}`.replace(', ,', ',').replace(/^,|,$/g, ''),
            city: formData.city,
            state: formData.state,
            pinCode: formData.pincode,
            country: formData.country
          } : {
            fullName: formData.shippingFullName,
            address: `${formData.shippingStreet}, ${formData.shippingLandmark}`.replace(', ,', ',').replace(/^,|,$/g, ''),
            city: formData.shippingCity,
            state: formData.shippingState,
            pinCode: formData.shippingPincode,
            country: formData.country
          },
          paymentMethod: formData.paymentMethod
        };

        // Create order in backend first
        const orderResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          body: JSON.stringify(orderData)
        });

        const orderResult = await orderResponse.json();

        if (!orderResponse.ok) {
          throw new Error(orderResult.message || 'Failed to create order');
        }

        if (orderResult.success && orderResult.order) {
          const order = orderResult.order;
          
          // Handle payment based on method
          if (formData.paymentMethod === 'razorpay') {
            await handleRazorpayPayment(order);
          } else {
            // For other payment methods (COD, etc.)
            await sendOrderNotifications(order);
            clearCart();
            router.push(`/order-success?orderId=${order._id}`);
          }
        } else {
          throw new Error('Order creation failed');
        }
      } catch (error) {
          console.error('Error processing order:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          alert(`Error placing order: ${errorMessage}`);
        }
    }
  };

  const sendOrderNotifications = async (orderData: OrderData) => {
    try {
      // Send email to admin
      await fetch('/api/notifications/admin-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderData,
          adminEmail: 'admin@boosterboxnutrition.com'
        })
      });

      // Send confirmation email to customer
      await fetch('/api/notifications/customer-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderData,
          customerEmail: formData.email,
          customerName: formData.fullName
        })
      });

      // Send SMS to customer
      await fetch('/api/notifications/customer-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderData,
          customerPhone: formData.phone,
          customerName: formData.fullName
        })
      });
    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  };

  // Use actual cart data
  const subtotal = getCartTotal();
  const shipping = subtotal > 4000 ? 0 : 500; // Free shipping over ₹4000
  const tax = Math.round(subtotal * 0.18); // 18% GST rounded to nearest integer
  const total = subtotal + shipping + tax;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/cart" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Cart
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {[
                { number: 1, title: 'Billing', icon: '📝' },
                { number: 2, title: 'Shipping', icon: '🚚' },
                { number: 3, title: 'Payment', icon: '💳' }
              ].map((stepItem) => (
                <div key={stepItem.number} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step >= stepItem.number 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {stepItem.number}
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-600">
                    {stepItem.title}
                  </span>
                  {stepItem.number < 3 && (
                    <div className="w-16 h-0.5 bg-gray-200 mx-4"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Billing Information */}
            {step === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Billing Information</h2>
                
                {/* Address Selection */}
                {addresses.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Billing Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {addresses.map((address) => (
                        <div
                          key={address._id}
                          onClick={() => {
                            setSelectedBillingAddress(address);
                            setFormData(prev => ({
                              ...prev,
                              street: address.address || '',
                              city: address.city || '',
                              state: address.state || '',
                              pincode: address.pinCode || '',
                              country: address.country || 'India'
                            }));
                          }}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                            selectedBillingAddress?._id === address._id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{address.type.charAt(0).toUpperCase() + address.type.slice(1)}</p>
                              <p className="text-sm text-gray-600 mt-1">
                                {address.address}<br/>
                                {address.city}, {address.state} {address.pinCode}<br/>
                                {address.country}
                              </p>
                              {address.isDefault && (
                                <span className="inline-block mt-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <input
                              type="radio"
                              checked={selectedBillingAddress?._id === address._id}
                              onChange={() => {}}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddressForm(true);
                        setAddressFormType('billing');
                      }}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      + Add New Address
                    </button>
                  </div>
                )}
                
                {/* Manual Address Form */}
                {(addresses.length === 0 || showAddressForm) && (
                  <div>
                    {addresses.length > 0 && (
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Add New Address</h3>
                        <button
                          type="button"
                          onClick={() => setShowAddressForm(false)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="your.email@example.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-gray-500">+91</span>
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="9876543210"
                        pattern="[6789][0-9]{9}"
                        maxLength={10}
                        className="w-full pl-12 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Enter 10-digit mobile number without country code</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleChange}
                      required
                      placeholder="House/Flat number, Street name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleChange}
                      placeholder="Near hospital, school, etc."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      placeholder="Mumbai"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      District *
                    </label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      required
                      placeholder="Mumbai"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select State</option>
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                      <option value="Assam">Assam</option>
                      <option value="Bihar">Bihar</option>
                      <option value="Chhattisgarh">Chhattisgarh</option>
                      <option value="Goa">Goa</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Haryana">Haryana</option>
                      <option value="Himachal Pradesh">Himachal Pradesh</option>
                      <option value="Jharkhand">Jharkhand</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Madhya Pradesh">Madhya Pradesh</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Manipur">Manipur</option>
                      <option value="Meghalaya">Meghalaya</option>
                      <option value="Mizoram">Mizoram</option>
                      <option value="Nagaland">Nagaland</option>
                      <option value="Odisha">Odisha</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Sikkim">Sikkim</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Tripura">Tripura</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Uttarakhand">Uttarakhand</option>
                      <option value="West Bengal">West Bengal</option>
                      <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                      <option value="Chandigarh">Chandigarh</option>
                      <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                      <option value="Ladakh">Ladakh</option>
                      <option value="Lakshadweep">Lakshadweep</option>
                      <option value="Puducherry">Puducherry</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      required
                      placeholder="400001"
                      maxLength={6}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                        formData.pincode && formData.pincode.length === 6 && !validatePincode(formData.pincode)
                          ? 'border-red-300 focus:ring-red-500'
                          : formData.pincode && formData.pincode.length > 0 && formData.pincode.length < 6
                          ? 'border-yellow-300 focus:ring-yellow-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {formData.pincode && formData.pincode.length === 6 && !validatePincode(formData.pincode) ? (
                      <p className="mt-1 text-xs text-red-600">PIN code must be exactly 6 digits</p>
                    ) : formData.pincode && formData.pincode.length > 0 && formData.pincode.length < 6 ? (
                      <p className="mt-1 text-xs text-yellow-600">PIN code should be 6 digits</p>
                    ) : (
                      <p className="mt-1 text-xs text-gray-500">Enter 6-digit PIN code</p>
                    )}
                  </div>
                </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Shipping Information */}
            {step === 2 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Information</h2>
                
                {/* Same as Billing Option */}
                <div className="mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.sameAsBilling}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, sameAsBilling: e.target.checked }));
                        if (e.target.checked && selectedBillingAddress) {
                          setSelectedShippingAddress(selectedBillingAddress);
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Same as billing address</span>
                  </label>
                </div>
                
                {/* Address Selection for Shipping */}
                {!formData.sameAsBilling && addresses.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Shipping Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {addresses.map((address) => (
                        <div
                          key={address._id}
                          onClick={() => {
                            setSelectedShippingAddress(address);
                            setFormData(prev => ({
                              ...prev,
                              shippingStreet: address.address || '',
                              shippingCity: address.city || '',
                              shippingState: address.state || '',
                              shippingPincode: address.pinCode || ''
                            }));
                          }}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                            selectedShippingAddress?._id === address._id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{address.type.charAt(0).toUpperCase() + address.type.slice(1)}</p>
                              <p className="text-sm text-gray-600 mt-1">
                                {address.address}<br/>
                                {address.city}, {address.state} {address.pinCode}<br/>
                                {address.country}
                              </p>
                              {address.isDefault && (
                                <span className="inline-block mt-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                                  Default
                                </span>
                              )}
                            </div>
                            <input
                              type="radio"
                              checked={selectedShippingAddress?._id === address._id}
                              onChange={() => {}}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddressForm(true);
                        setAddressFormType('shipping');
                      }}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      + Add New Shipping Address
                    </button>
                  </div>
                )}
                
                {!formData.sameAsBilling && (addresses.length === 0 || (showAddressForm && addressFormType === 'shipping')) && (
                   <div>
                     {addresses.length > 0 && (
                       <div className="flex items-center justify-between mb-4">
                         <h3 className="text-lg font-semibold text-gray-900">Add New Shipping Address</h3>
                         <button
                           type="button"
                           onClick={() => setShowAddressForm(false)}
                           className="text-gray-500 hover:text-gray-700"
                         >
                           Cancel
                         </button>
                       </div>
                     )}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="shippingFullName"
                        value={formData.shippingFullName}
                        onChange={handleChange}
                        required={!formData.sameAsBilling}
                        placeholder="Enter recipient's full name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        name="shippingStreet"
                        value={formData.shippingStreet}
                        onChange={handleChange}
                        required={!formData.sameAsBilling}
                        placeholder="House/Flat number, Street name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Landmark (Optional)
                      </label>
                      <input
                        type="text"
                        name="shippingLandmark"
                        value={formData.shippingLandmark}
                        onChange={handleChange}
                        placeholder="Near hospital, school, etc."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="shippingCity"
                        value={formData.shippingCity}
                        onChange={handleChange}
                        required={!formData.sameAsBilling}
                        placeholder="Mumbai"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        District *
                      </label>
                      <input
                        type="text"
                        name="shippingDistrict"
                        value={formData.shippingDistrict}
                        onChange={handleChange}
                        required={!formData.sameAsBilling}
                        placeholder="Mumbai"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State *
                      </label>
                      <select
                        name="shippingState"
                        value={formData.shippingState}
                        onChange={handleChange}
                        required={!formData.sameAsBilling}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select State</option>
                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                        <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                        <option value="Assam">Assam</option>
                        <option value="Bihar">Bihar</option>
                        <option value="Chhattisgarh">Chhattisgarh</option>
                        <option value="Goa">Goa</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Haryana">Haryana</option>
                        <option value="Himachal Pradesh">Himachal Pradesh</option>
                        <option value="Jharkhand">Jharkhand</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Kerala">Kerala</option>
                        <option value="Madhya Pradesh">Madhya Pradesh</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Manipur">Manipur</option>
                        <option value="Meghalaya">Meghalaya</option>
                        <option value="Mizoram">Mizoram</option>
                        <option value="Nagaland">Nagaland</option>
                        <option value="Odisha">Odisha</option>
                        <option value="Punjab">Punjab</option>
                        <option value="Rajasthan">Rajasthan</option>
                        <option value="Sikkim">Sikkim</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Telangana">Telangana</option>
                        <option value="Tripura">Tripura</option>
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                        <option value="Uttarakhand">Uttarakhand</option>
                        <option value="West Bengal">West Bengal</option>
                        <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                        <option value="Chandigarh">Chandigarh</option>
                        <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                        <option value="Ladakh">Ladakh</option>
                        <option value="Lakshadweep">Lakshadweep</option>
                        <option value="Puducherry">Puducherry</option>
                      </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pincode *
                        </label>
                        <input
                          type="text"
                          name="shippingPincode"
                          value={formData.shippingPincode}
                          onChange={handleChange}
                          required={!formData.sameAsBilling}
                          placeholder="400001"
                          maxLength={6}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent ${
                            formData.shippingPincode && formData.shippingPincode.length === 6 && !validatePincode(formData.shippingPincode)
                              ? 'border-red-300 focus:ring-red-500'
                              : formData.shippingPincode && formData.shippingPincode.length > 0 && formData.shippingPincode.length < 6
                              ? 'border-yellow-300 focus:ring-yellow-500'
                              : 'border-gray-300 focus:ring-blue-500'
                          }`}
                        />
                        {formData.shippingPincode && formData.shippingPincode.length === 6 && !validatePincode(formData.shippingPincode) ? (
                           <p className="mt-1 text-xs text-red-600">PIN code must be exactly 6 digits</p>
                         ) : formData.shippingPincode && formData.shippingPincode.length > 0 && formData.shippingPincode.length < 6 ? (
                           <p className="mt-1 text-xs text-yellow-600">PIN code should be 6 digits</p>
                         ) : (
                           <p className="mt-1 text-xs text-gray-500">Enter 6-digit PIN code</p>
                         )}
                      </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

            {/* Step 3: Payment Information */}
            {step === 3 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Information</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <div className="space-y-3">

                      <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-green-500">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="razorpay"
                          checked={formData.paymentMethod === 'razorpay'}
                          onChange={handleChange}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                        />
                        <div className="ml-3 flex items-center">
                          <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold mr-2">
                            R
                          </div>
                          <span className="text-sm font-medium text-gray-700">Razorpay (UPI, Cards, Net Banking)</span>
                        </div>
                      </label>
                      <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:border-blue-500">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={formData.paymentMethod === 'cod'}
                          onChange={handleChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-3 text-sm font-medium text-gray-700">Cash on Delivery</span>
                      </label>
                    </div>
                  </div>


                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t border-gray-200">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
              )}
              <button
                type="submit"
                className="ml-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                {step === 3 ? 'Place Order' : 'Continue'}
              </button>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
            
            {/* Order Items */}
            <div className="space-y-3 mb-6">
              {items.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.product.name}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    {item.variant && (
                      <p className="text-xs text-gray-500">Flavor: {item.variant.name}</p>
                    )}
                  </div>
                  <span className="font-medium text-gray-900">
                    {formatINR((item.variant?.price || item.product.price) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-3 border-t border-gray-200 pt-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium text-green-600">
                  {shipping === 0 ? 'Free' : formatINR(shipping)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">GST (18%)</span>
                <span className="font-medium">{formatINR(tax)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-lg font-semibold text-gray-900">{formatINR(total)}</span>
                </div>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <Shield className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-600">Secure Checkout</p>
                </div>
                <div>
                  <Truck className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-600">Free Shipping</p>
                </div>
                <div>
                  <Shield className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-600">30-Day Returns</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
    </div>
  );
}