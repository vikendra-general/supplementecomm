import { Product, Order, Address, Review } from '@/types';
import { cache, CACHE_KEYS } from './cache';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ msg: string }>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public errors?: Array<{ msg: string }>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ApiErrorResponse {
  message: string;
  errors?: Array<{ msg: string }>;
}

export type { ApiResponse, ApiErrorResponse };
export { ApiError };

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Get token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    // Use provided signal or create abort controller for timeout
    const controller = options.signal ? null : new AbortController();
    const signal = options.signal || controller?.signal;
    
    let timeoutId: NodeJS.Timeout | null = null;
    if (controller) {
      timeoutId = setTimeout(() => {
        if (!controller.signal.aborted) {
          controller.abort();
        }
      }, 15000); // Increased timeout to 15 seconds
    }
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      signal,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      if (timeoutId) clearTimeout(timeoutId);
      
      // Check if the request was aborted
      if (signal?.aborted) {
        throw new ApiError(0, 'Request was cancelled');
      }
      
      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(response.status, data.message || `HTTP error! status: ${response.status}`, data.errors);
      }

      return data;
    } catch (error) {
      if (timeoutId) clearTimeout(timeoutId);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Handle abort errors more gracefully
      if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('aborted'))) {
        // Don't throw an error for aborted requests - just return a default response
        // This prevents console errors during navigation
        return { success: false, message: 'Request aborted' } as ApiResponse<T>;
      }
      
      console.error('API request failed:', error);
      throw new ApiError(500, 'Network error - please check your connection');
    }
  }

  // Auth endpoints
  async register(userData: { name: string; email: string; password: string }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { email: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async updateProfile(profileData: {
    name?: string;
    email?: string;
    phone?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      pincode?: string;
      country?: string;
    };
  }) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(passwords: { currentPassword: string; newPassword: string }) {
    return this.request('/auth/password', {
      method: 'PUT',
      body: JSON.stringify(passwords),
    });
  }

  // Product endpoints
  async getProducts(params: {
    page?: number;
    limit?: number;
    category?: string;
    brand?: string;
    search?: string;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
  } = {}, signal?: AbortSignal): Promise<ApiResponse<Product[]>> {
    // Check cache first
    const cacheKey = `${CACHE_KEYS.PRODUCTS}_${JSON.stringify(params)}`;
    const cachedData = cache.get<ApiResponse<Product[]>>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const result = await this.request<Product[]>(`/products?${searchParams.toString()}`, { signal });
    
    // Handle null result from aborted requests
    if (result === null) {
      return { success: false, data: [], message: 'Request was cancelled' };
    }
    
    // Cache the response for 5 minutes
    cache.set(cacheKey, result, 5 * 60 * 1000);
    
    return result;
  }

  async getProduct(id: string) {
    return this.request(`/products/${id}`);
  }

  async createProduct(productData: FormData): Promise<ApiResponse<Product>> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    const response = await fetch(`${API_BASE_URL}/admin/products`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: productData,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new ApiError(response.status, data.message || `HTTP error! status: ${response.status}`, data.errors);
    }
    
    return data;
  }

  async updateProduct(id: string, productData: FormData): Promise<ApiResponse<Product>> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    const response = await fetch(`${API_BASE_URL}/admin/products/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: productData,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new ApiError(response.status, data.message || `HTTP error! status: ${response.status}`, data.errors);
    }
    
    return data;
  }

  async deleteProduct(id: string) {
    return this.request(`/admin/products/${id}`, {
      method: 'DELETE',
    });
  }

  async addProductReview(productId: string, reviewData: { rating: number; comment?: string }) {
    return this.request(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  async getProductCategories() {
    return this.request('/products/categories');
  }

  async getProductBrands() {
    return this.request('/products/brands');
  }

  // Order endpoints
  async createOrder(orderData: {
    items: Array<{
      product: string;
      name: string;
      price: number;
      quantity: number;
      variant?: {
        id: string;
        name: string;
        price: number;
      };
    }>;
    shippingAddress: Address;
    billingAddress: Address;
    paymentMethod: string;
    notes?: string;
  }): Promise<ApiResponse<Order>> {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    return this.request(`/orders?${searchParams.toString()}`);
  }

  async getOrder(id: string) {
    return this.request(`/orders/${id}`);
  }

  async updateOrder(id: string, orderData: {
    status?: string;
    paymentStatus?: string;
    shippingStatus?: string;
    trackingNumber?: string;
    notes?: string;
  }) {
    return this.request(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(orderData),
    });
  }

  // Payment endpoints
  async createPaymentIntent(paymentData: {
    amount: number;
    currency?: string;
    orderId?: string;
  }) {
    return this.request('/payments/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async confirmPayment(paymentData: {
    paymentIntentId: string;
    orderId: string;
  }) {
    return this.request('/payments/confirm', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async getPaymentHistory(params?: {
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    return this.request(`/payments/history?${searchParams.toString()}`);
  }

  async createStripeCustomer() {
    return this.request('/payments/create-customer', {
      method: 'POST',
    });
  }

  // Razorpay payment endpoints
  async createRazorpayOrder(orderData: {
    amount: number;
    currency?: string;
    orderId?: string;
  }) {
    return this.request('/payments/razorpay/create-order', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async verifyRazorpayPayment(paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    orderId: string;
  }) {
    return this.request('/payments/razorpay/verify', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async getRazorpayPayment(paymentId: string) {
    return this.request(`/payments/razorpay/payment/${paymentId}`);
  }

  // User endpoints
  async updateUserAddress(addressData: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    isDefault?: boolean;
  }) {
    return this.request('/user/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  }

  async updateUserAddressById(addressId: string, addressData: Partial<Address>) {
    return this.request(`/user/addresses/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(addressData),
    });
  }

  async deleteUserAddress(addressId: string) {
    return this.request(`/user/addresses/${addressId}`, {
      method: 'DELETE',
    });
  }

  async getWishlist(): Promise<ApiResponse<Product[]>> {
    return this.request('/wishlist');
  }

  async addToWishlist(productId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/wishlist/${productId}`, {
      method: 'POST',
    });
  }

  async removeFromWishlist(productId: string): Promise<ApiResponse<{ message: string }>> {
    return this.request(`/wishlist/${productId}`, {
      method: 'DELETE',
    });
  }

  // Admin endpoints
  async getAdminDashboard() {
    return this.request('/admin/dashboard');
  }

  async getAdminOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
    paymentStatus?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    return this.request(`/admin/orders?${searchParams.toString()}`);
  }

  async updateOrderStatus(orderId: string, status: string, note?: string): Promise<ApiResponse<Order>> {
    return this.request(`/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, note }),
    });
  }

  async updatePaymentStatus(orderId: string, paymentStatus: string, note?: string): Promise<ApiResponse<Order>> {
    return this.request(`/admin/orders/${orderId}/payment`, {
      method: 'PUT',
      body: JSON.stringify({ paymentStatus, notes: note }),
    });
  }

  async getAdminUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    return this.request(`/admin/users?${searchParams.toString()}`);
  }

  async updateUserRole(userId: string, role: string) {
    return this.request(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  async createUser(userData: {
    name: string;
    email: string;
    phone?: string;
    role: 'user' | 'admin';
    emailVerified?: boolean;
    isActive?: boolean;
  }) {
    return this.request('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId: string) {
    return this.request(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async getProductAnalytics() {
    return this.request('/admin/products/analytics');
  }

  async getAnalytics(timeRange: string = '12months') {
    return this.request(`/admin/analytics?timeRange=${timeRange}`);
  }

  async bulkUpdateStock(updates: Array<{ productId: string; stockQuantity: number }>) {
    return this.request('/admin/products/bulk-stock', {
      method: 'PUT',
      body: JSON.stringify({ updates }),
    });
  }

  async addReview(productId: string, reviewData: {
    rating: number;
    comment: string;
  }): Promise<ApiResponse<{ id: string }>> {
    return this.request(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  async getProductReviews(productId: string): Promise<ApiResponse<Review[]>> {
    return this.request(`/products/${productId}/reviews`);
  }

  // Cart operations
  async getCart() {
    return this.request('/cart');
  }

  async addToCart(cartData: {
    productId: string;
    quantity: number;
    variant?: {
      id: string;
      name: string;
      price: number;
    };
  }) {
    return this.request('/cart/add', {
      method: 'POST',
      body: JSON.stringify(cartData),
    });
  }

  async updateCartItem(cartData: {
    productId: string;
    quantity: number;
    variant?: {
      id: string;
      name: string;
      price: number;
    };
  }) {
    return this.request('/cart/update', {
      method: 'PUT',
      body: JSON.stringify(cartData),
    });
  }

  async removeFromCart(cartData: {
    productId: string;
    variant?: {
      id: string;
      name: string;
      price: number;
    };
  }) {
    return this.request('/cart/remove', {
      method: 'DELETE',
      body: JSON.stringify(cartData),
    });
  }

  async clearCart() {
    return this.request('/cart/clear', {
      method: 'DELETE',
    });
  }

  async syncCart(items: Array<{
    productId: string;
    quantity: number;
    variant?: {
      id: string;
      name: string;
      price: number;
    };
  }>) {
    return this.request('/cart/sync', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  }

  async getCartStats() {
    return this.request('/cart/stats');
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // Pincode lookup for Indian addresses
  async lookupPincode(pincode: string): Promise<{
    success: boolean;
    data?: {
      pincode: string;
      city: string;
      state: string;
      country: string;
      district?: string;
      region?: string;
    };
    message?: string;
  }> {
    try {
      // Validate pincode format (6 digits)
      if (!/^[0-9]{6}$/.test(pincode)) {
        return {
          success: false,
          message: 'Invalid pincode format. Please enter a 6-digit pincode.'
        };
      }

      // Use alternative pincode API that supports CORS
      const response = await fetch(`https://api.zippopotam.us/in/${pincode}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pincode data');
      }

      const data = await response.json();
      
      // Check if the API returned valid data (Zippopotamus format)
      if (data && data.country && data.places && data.places.length > 0) {
        const place = data.places[0];
        
        return {
          success: true,
          data: {
            pincode: pincode,
            city: place['place name'] || '',
            state: place['state'] || '',
            country: data.country || 'India',
            district: place['place name'] || '',
            region: place['state abbreviation'] || ''
          }
        };
      } else {
        return {
          success: false,
          message: 'No data found for this pincode. Please check and try again.'
        };
      }
    } catch (error) {
      console.error('Pincode lookup error:', error);
      return {
        success: false,
        message: 'Unable to fetch location data. Please enter details manually.'
      };
    }
  }
}

export const apiService = new ApiService();