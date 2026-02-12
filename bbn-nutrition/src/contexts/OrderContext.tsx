'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Order } from '@/types';
import { useAuth } from './AuthContext';

interface OrderContextType {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  getOrders: (page?: number, limit?: number, status?: string) => Promise<void>;
  getOrder: (orderId: string) => Promise<Order | null>;
  cancelOrder: (orderId: string) => Promise<void>;
  requestReturn: (orderId: string, reason: string, items: string[]) => Promise<void>;
  getOrderTracking: (orderId: string) => Promise<{
    status: string;
    location?: string;
    timestamp: string;
    description: string;
  } | null>;
  clearError: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

interface OrderProviderProps {
  children: React.ReactNode;
}

export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token, isAuthenticated } = useAuth();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

  const getOrders = useCallback(async (page = 1, limit = 10, status?: string) => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      if (status && status !== 'all') {
        params.append('status', status);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${API_BASE_URL}/orders?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const data = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error: unknown) {
      console.error('Error fetching orders:', error);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          setError('Request timeout. Please check your connection and try again.');
        } else {
          setError(error.message);
        }
      } else {
        setError('Failed to fetch orders. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [token, API_BASE_URL]);

  const getOrder = async (orderId: string): Promise<Order | null> => {
    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch order');
      }

      return data.order;
    } catch (error) {
      console.error('Get order error:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch order');
      return null;
    }
  };

  const cancelOrder = async (orderId: string) => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel order');
      }

      // Update the order in the local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId ? { ...order, status: 'cancelled' } : order
        )
      );
    } catch (error) {
      console.error('Cancel order error:', error);
      setError(error instanceof Error ? error.message : 'Failed to cancel order');
    } finally {
      setIsLoading(false);
    }
  };

  const requestReturn = async (orderId: string, reason: string, items: string[]) => {
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/return`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason, items }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to request return');
      }

      // Update the order in the local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId ? { ...order, status: 'returned' } : order
        )
      );
    } catch (error) {
      console.error('Request return error:', error);
      setError(error instanceof Error ? error.message : 'Failed to request return');
    } finally {
      setIsLoading(false);
    }
  };

  const getOrderTracking = async (orderId: string): Promise<{
    status: string;
    location?: string;
    timestamp: string;
    description: string;
  } | null> => {
    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/tracking`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch tracking info');
      }

      return data.tracking;
    } catch (error) {
      console.error('Get tracking error:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch tracking info');
      return null;
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Load orders when token is available with a small delay to ensure backend is ready
  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        getOrders();
      }, 500); // 500ms delay to ensure backend is ready
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, getOrders]);

  const value: OrderContextType = {
    orders,
    isLoading,
    error,
    getOrders,
    getOrder,
    cancelOrder,
    requestReturn,
    getOrderTracking,
    clearError,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};