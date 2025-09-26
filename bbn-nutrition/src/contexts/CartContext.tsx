'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Product } from '@/types';
import { useAuth } from './AuthContext';
import { apiService } from '@/utils/api';

interface CartItem {
  product: Product;
  quantity: number;
  variant?: {
    id: string;
    name: string;
    price: number;
    inStock?: boolean;
    stockQuantity?: number;
  };
}

interface ServerCartItem {
  productId: Product | string;
  productName: string;
  price: number;
  quantity: number;
  variant?: {
    id: string;
    name: string;
    price: number;
  };
  addedAt: string;
  updatedAt: string;
}

interface ServerCart {
  userId: string;
  items: ServerCartItem[];
  updatedAt: string;
}

interface CartApiResponse {
  success: boolean;
  cart: ServerCart;
  message?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, variant?: CartItem['variant']) => Promise<void>;
  removeFromCart: (productId: string, variant?: CartItem['variant']) => Promise<void>;
  updateQuantity: (productId: string, quantity: number, variant?: CartItem['variant']) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartCount: () => number;
  getCartTotal: () => number;
  isInCart: (productId: string) => boolean;
  getAvailableStock: (product: Product, variant?: CartItem['variant']) => number;
  getMaxQuantityCanAdd: (product: Product, variant?: CartItem['variant']) => number;
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
  const [isInitialized, setIsInitialized] = useState(false);
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  
  // Track previous auth state to detect logout
  const prevAuthStateRef = useRef<{ isAuthenticated: boolean; userId: string | undefined } | null>(null);

  // Load cart from server for authenticated users
  const loadCartFromServer = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setItems([]);
      return;
    }

    try {
      const response = await apiService.getCart();
      
      if (response && response.success && (response as CartApiResponse).cart) {
        const serverCart = (response as CartApiResponse).cart;
        const serverItems = serverCart.items || [];

        // Convert server cart items to our format
        const cartItems = serverItems.map((serverItem: ServerCartItem) => {
          // The backend populates productId with the full product data
          const product = typeof serverItem.productId === 'string' ? null : serverItem.productId;
          
          if (!product) {
            console.warn('Cart item missing product data:', serverItem);
            return null;
          }
          
          return {
            product: {
              id: product.id,
              name: product.name,
              description: product.description || '',
              price: product.price,
              images: product.images || [],
              category: product.category,
              brand: product.brand,
              inStock: product.inStock,
              stockQuantity: product.stockQuantity,
              variants: product.variants || [],
              rating: product.rating || 0,
              reviews: product.reviews || 0,
              tags: product.tags || []
            },
            quantity: serverItem.quantity,
            variant: serverItem.variant
          } as CartItem;
        }).filter((item): item is NonNullable<typeof item> => item !== null);

        setItems(cartItems);
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  }, [isAuthenticated, user?.id]);

  // Initialize cart when component mounts or auth state changes
  useEffect(() => {
    if (isInitialized) {
      return;
    }

    if (authLoading) {
      return;
    }

    const initializeCart = async () => {
      if (isAuthenticated && user?.id) {
        // Load from database for authenticated users
        await loadCartFromServer();
        
        // Clear any anonymous cart data
        const keysToRemove = ['cart_items', 'anonymous_cart_items'];
        keysToRemove.forEach(key => {
          try {
            localStorage.removeItem(key);
          } catch {
            // Ignore localStorage errors
          }
        });
      } else {
        // Load from localStorage for anonymous users
        try {
          const savedCart = JSON.parse(localStorage.getItem('anonymous_cart_items') || '[]');
          setItems(savedCart);
        } catch {
          setItems([]);
        }
      }

      setIsInitialized(true);
    };

    initializeCart();
  }, [isAuthenticated, user?.id, authLoading, isInitialized, loadCartFromServer]);

  // Fallback initialization after 3 seconds
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (!isInitialized) {
        setIsInitialized(true);
      }
    }, 3000);

    return () => clearTimeout(fallbackTimer);
  }, [isInitialized]);

  // Auto-save cart changes
  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    if (!isAuthenticated) {
      // Save to localStorage for anonymous users
      try {
        localStorage.setItem('anonymous_cart_items', JSON.stringify(items));
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [items, isAuthenticated, isInitialized]);

  // Handle auth state changes
  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    const currentAuthState = { isAuthenticated, userId: user?.id };
    
    if (!prevAuthStateRef.current) {
      prevAuthStateRef.current = currentAuthState;
      return;
    }

    const prevAuth = prevAuthStateRef.current;
    
    if (prevAuth.isAuthenticated && !isAuthenticated) {
      // User logged out - clear cart state
      setItems([]);
      
      // Clear localStorage cart keys
      const keysToRemove = ['cart_items', 'anonymous_cart_items'];
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch {
          // Ignore localStorage errors
        }
      });
    }

    prevAuthStateRef.current = currentAuthState;
  }, [isAuthenticated, user?.id, isInitialized]);

  const addToCart = useCallback(async (product: Product, quantity: number = 1, variant?: CartItem['variant']) => {
    if (isAuthenticated && user?.id) {
      try {
        const response = await apiService.addToCart({
          productId: product.id,
          quantity,
          variant
        });
        
        if (response && response.success) {
          const updatedCart = await apiService.getCart();
          if (updatedCart && updatedCart.success && (updatedCart as CartApiResponse).cart) {
            const serverItems = (updatedCart as CartApiResponse).cart.items || [];
            const cartItems = serverItems.map((serverItem: ServerCartItem) => {
              // The backend populates productId with the full product data
              const product = typeof serverItem.productId === 'string' ? null : serverItem.productId;
              
              if (!product) {
                console.warn('Cart item missing product data:', serverItem);
                return null;
              }
              
              return {
                product: {
                  id: product.id,
                  name: product.name,
                  description: product.description || '',
                  price: product.price,
                  images: product.images || [],
                  category: product.category,
                  brand: product.brand,
                  inStock: product.inStock,
                  stockQuantity: product.stockQuantity,
                  variants: product.variants || [],
                  rating: product.rating || 0,
                  reviews: product.reviews || 0,
                  tags: product.tags || []
                },
                quantity: serverItem.quantity,
                variant: serverItem.variant
              } as CartItem;
            }).filter((item): item is NonNullable<typeof item> => item !== null);
            setItems(cartItems);
          }
          return;
        }
      } catch (error) {
        console.error('Failed to add to cart:', error);
      }
    }

    // localStorage cart logic for anonymous users or server fallback
    const currentItems = [...items];
    const existingItemIndex = currentItems.findIndex(item => 
      item.product.id === product.id && 
      JSON.stringify(item.variant) === JSON.stringify(variant)
    );

    if (existingItemIndex > -1) {
      const existingItem = currentItems[existingItemIndex];
      const availableStock = variant ? 
        (variant.stockQuantity || product.stockQuantity) : 
        product.stockQuantity;

      if ((availableStock || 0) > 0) {
        const newQuantity = Math.min(existingItem.quantity + quantity, availableStock || 0);
        
        if (newQuantity === availableStock && existingItem.quantity < (availableStock || 0)) {
          currentItems[existingItemIndex] = { ...existingItem, quantity: newQuantity };
        } else if (existingItem.quantity < (availableStock || 0)) {
          currentItems[existingItemIndex] = { ...existingItem, quantity: newQuantity };
        }
      }
    } else {
      const availableStock = variant ? 
        (variant.stockQuantity || product.stockQuantity) : 
        product.stockQuantity;

      if ((availableStock || 0) > 0) {
        const quantityToAdd = Math.min(quantity, availableStock || 0);
        currentItems.push({
          product,
          quantity: quantityToAdd,
          variant
        });
      }
    }

    setItems(currentItems);

    // Save to localStorage
    const storageKey = 'anonymous_cart_items';
    try {
      localStorage.setItem(storageKey, JSON.stringify(currentItems));
    } catch {
      // Ignore localStorage errors
    }
  }, [isAuthenticated, user?.id, items]);

  const removeFromCart = useCallback(async (productId: string, variant?: CartItem['variant']) => {
    if (isAuthenticated && user?.id) {
      try {
        await apiService.removeFromCart({
          productId,
          variant
        });
        await loadCartFromServer();
        return;
      } catch (error) {
        console.error('Failed to remove from cart:', error);
      }
    }

    setItems(prevItems => 
      prevItems.filter(item => 
        !(item.product.id === productId && JSON.stringify(item.variant) === JSON.stringify(variant))
      )
    );
  }, [isAuthenticated, user?.id, loadCartFromServer]);

  const updateQuantity = useCallback(async (productId: string, quantity: number, variant?: CartItem['variant']) => {
    if (quantity <= 0) {
      await removeFromCart(productId, variant);
      return;
    }

    if (isAuthenticated && user?.id) {
      try {
        await apiService.updateCartItem({
          productId,
          quantity,
          variant
        });
        await loadCartFromServer();
        return;
      } catch (error) {
        console.error('Failed to update cart quantity:', error);
      }
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.product.id === productId && JSON.stringify(item.variant) === JSON.stringify(variant)
          ? { ...item, quantity }
          : item
      )
    );
  }, [isAuthenticated, user?.id, removeFromCart, loadCartFromServer]);

  const clearCart = useCallback(async () => {
    if (isAuthenticated && user?.id) {
      try {
        await apiService.clearCart();
        setItems([]);
        return;
      } catch (error) {
        console.error('Failed to clear cart:', error);
      }
    }

    setItems([]);
  }, [isAuthenticated, user?.id]);

  const getCartCount = useCallback(() => {
    return items.length;
  }, [items]);

  const getCartTotal = useCallback(() => {
    return items.reduce((total, item) => {
      const price = item.variant?.price || item.product.price;
      // Prices are now stored directly in INR, no conversion needed
      return total + (price * item.quantity);
    }, 0);
  }, [items]);

  const isInCart = useCallback((productId: string) => {
    return items.some(item => item.product.id === productId);
  }, [items]);

  const getAvailableStock = useCallback((product: Product, variant?: CartItem['variant']) => {
    // If product is marked as out of stock, return 0 regardless of stockQuantity
    if (!product.inStock) {
      return 0;
    }
    
    // If variant exists, check variant stock and inStock status
    if (variant) {
      if (variant.inStock === false) {
        return 0;
      }
      return variant.stockQuantity ?? 0;
    }
    
    // Return product stock quantity
    return product.stockQuantity ?? 0;
  }, []);

  const getMaxQuantityCanAdd = useCallback((product: Product, variant?: CartItem['variant']) => {
    const availableStock = getAvailableStock(product, variant);
    const currentQuantityInCart = items.find(
      item => item.product.id === product.id && 
      (!variant || item.variant?.id === variant.id)
    )?.quantity ?? 0;
    
    return Math.max(0, availableStock - currentQuantityInCart);
  }, [items, getAvailableStock]);

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartCount,
    getCartTotal,
    isInCart,
    getAvailableStock,
    getMaxQuantityCanAdd,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};