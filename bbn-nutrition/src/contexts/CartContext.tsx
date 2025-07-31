'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/types';
import { useAuth } from './AuthContext';

interface CartItem {
  product: Product;
  quantity: number;
  variant?: {
    id: string;
    name: string;
    price: number;
  };
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, variant?: CartItem['variant']) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartCount: () => number;
  getCartTotal: () => number;
  isInCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { isAuthenticated, user } = useAuth();

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      let savedCart: CartItem[] = [];
      
      if (isAuthenticated && user) {
        // Load user-specific cart
        const userCart = localStorage.getItem(`cart_${user.id}`);
        if (userCart) {
          savedCart = JSON.parse(userCart);
        }
      } else {
        // Load anonymous cart
        const anonymousCart = localStorage.getItem('cart_anonymous');
        if (anonymousCart) {
          savedCart = JSON.parse(anonymousCart);
        }
      }
      
      setItems(savedCart);
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      setItems([]);
    }
  }, [isAuthenticated, user]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      if (isAuthenticated && user) {
        // Save to user-specific storage
        localStorage.setItem(`cart_${user.id}`, JSON.stringify(items));
        // Clear anonymous cart after successful login
        localStorage.removeItem('cart_anonymous');
      } else {
        // Save to anonymous storage
        localStorage.setItem('cart_anonymous', JSON.stringify(items));
      }
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [items, isAuthenticated, user]);

  // Merge anonymous cart with user cart when user logs in
  useEffect(() => {
    if (isAuthenticated && user) {
      try {
        const anonymousCart = localStorage.getItem('cart_anonymous');
        if (anonymousCart) {
          const anonymousItems: CartItem[] = JSON.parse(anonymousCart);
          const userCart = localStorage.getItem(`cart_${user.id}`);
          let userItems: CartItem[] = [];
          
          if (userCart) {
            userItems = JSON.parse(userCart);
          }
          
          // Merge anonymous cart with user cart
          const mergedItems = [...userItems];
          
          anonymousItems.forEach(anonymousItem => {
            const existingIndex = mergedItems.findIndex(
              item => item.product.id === anonymousItem.product.id && 
              (!anonymousItem.variant || item.variant?.id === anonymousItem.variant.id)
            );
            
            if (existingIndex > -1) {
              // Add quantities if same product
              mergedItems[existingIndex].quantity += anonymousItem.quantity;
            } else {
              // Add new item
              mergedItems.push(anonymousItem);
            }
          });
          
          setItems(mergedItems);
          // Clear anonymous cart after merging
          localStorage.removeItem('cart_anonymous');
        }
      } catch (error) {
        console.error('Error merging anonymous cart:', error);
      }
    }
  }, [isAuthenticated, user]);

  // Clear cart when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      // Don't clear anonymous cart when logging out
      // Only clear user-specific carts
      try {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('cart_') && key !== 'cart_anonymous') {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      } catch (error) {
        console.error('Error clearing user cart data from localStorage:', error);
      }
    }
  }, [isAuthenticated]);

  const addToCart = (product: Product, quantity: number = 1, variant?: CartItem['variant']) => {
    setItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        item => item.product.id === product.id && 
        (!variant || item.variant?.id === variant.id)
      );

      if (existingItemIndex > -1) {
        // Update existing item
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        return updatedItems;
      } else {
        // Add new item
        return [...prevItems, { product, quantity, variant }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    // Clear from localStorage
    try {
      if (isAuthenticated && user) {
        localStorage.removeItem(`cart_${user.id}`);
      } else {
        localStorage.removeItem('cart_anonymous');
      }
    } catch (error) {
      console.error('Error clearing cart from localStorage:', error);
    }
  };

  const getCartCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    return items.reduce((total, item) => {
      const price = item.variant?.price || item.product.price;
      // Convert USD price to INR for cart total
      const inrPrice = price * 83; // USD to INR conversion
      return total + (inrPrice * item.quantity);
    }, 0);
  };

  const isInCart = (productId: string) => {
    return items.some(item => item.product.id === productId);
  };

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartCount,
    getCartTotal,
    isInCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}; 