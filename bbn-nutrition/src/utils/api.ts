const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
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
    public errors?: any[]
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Get token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          response.status,
          data.message || 'Something went wrong',
          data.errors
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Network error');
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

  async updateProfile(profileData: any) {
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
  async getProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    featured?: boolean;
    inStock?: boolean;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    return this.request(`/products?${searchParams.toString()}`);
  }

  async getProduct(id: string) {
    return this.request(`/products/${id}`);
  }

  async createProduct(productData: FormData) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    return fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: productData,
    });
  }

  async updateProduct(id: string, productData: FormData) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    return fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: productData,
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/products/${id}`, {
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
  async createOrder(orderData: any) {
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

  async updateOrder(id: string, orderData: any) {
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

  // User endpoints
  async updateUserAddress(addressData: any) {
    return this.request('/user/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  }

  async updateUserAddressById(addressId: string, addressData: any) {
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

  async addToWishlist(productId: string) {
    return this.request('/user/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  }

  async removeFromWishlist(productId: string) {
    return this.request(`/user/wishlist/${productId}`, {
      method: 'DELETE',
    });
  }

  async getWishlist() {
    return this.request('/user/wishlist');
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

  async updateOrderStatus(orderId: string, statusData: {
    status: string;
    trackingNumber?: string;
    notes?: string;
  }) {
    return this.request(`/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
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

  async getProductAnalytics() {
    return this.request('/admin/products/analytics');
  }

  async bulkUpdateStock(updates: Array<{ productId: string; stockQuantity: number }>) {
    return this.request('/admin/products/bulk-stock', {
      method: 'PUT',
      body: JSON.stringify({ updates }),
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export const apiService = new ApiService();
export { ApiError }; 