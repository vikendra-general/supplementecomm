'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product } from '@/types';
import { useAuth } from './AuthContext';

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

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, variant?: CartItem['variant']) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
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
  const { isAuthenticated, user } = useAuth();

  // Load cart from localStorage on mount
  useEffect(() => {
    if (isInitialized) return;
    
    // Add a small delay to ensure auth state is settled
    const loadCart = () => {
      try {
        let savedCart: CartItem[] = [];
        
        if (isAuthenticated && user) {
          // Load user-specific cart
          const userCart = localStorage.getItem(`cart_${user.id}`);
          if (userCart) {
            savedCart = JSON.parse(userCart);
            console.log('Loaded user cart:', savedCart.length, 'items');
          }
        } else {
          // Load anonymous cart
          const anonymousCart = localStorage.getItem('cart_anonymous');
          if (anonymousCart) {
            savedCart = JSON.parse(anonymousCart);
            console.log('Loaded anonymous cart:', savedCart.length, 'items');
          }
        }
        
        setItems(savedCart);
        console.log('Cart initialized with', savedCart.length, 'items');
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        setItems([]);
      } finally {
        setIsInitialized(true);
      }
    };
    
    // Use setTimeout to ensure this runs after auth initialization
    const timeoutId = setTimeout(loadCart, 100);
    
    return () => clearTimeout(timeoutId);
  }, [isAuthenticated, user, isInitialized]);

  // Fallback: Ensure cart is loaded if initialization seems stuck
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (!isInitialized) {
        console.log('Cart initialization fallback triggered');
        try {
          const anonymousCart = localStorage.getItem('cart_anonymous');
          if (anonymousCart) {
            const savedCart = JSON.parse(anonymousCart);
            setItems(savedCart);
            console.log('Fallback loaded anonymous cart:', savedCart.length, 'items');
          }
        } catch (error) {
          console.error('Fallback cart loading failed:', error);
        }
        setIsInitialized(true);
      }
    }, 1000); // 1 second fallback
    
    return () => clearTimeout(fallbackTimer);
  }, [isInitialized]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isInitialized) return;
    
    try {
      if (isAuthenticated && user) {
        // Save to user-specific storage
        localStorage.setItem(`cart_${user.id}`, JSON.stringify(items));
        console.log('Saved user cart:', items.length, 'items to cart_' + user.id);
        // Clear anonymous cart after successful login
        localStorage.removeItem('cart_anonymous');
      } else {
        // Save to anonymous storage
        localStorage.setItem('cart_anonymous', JSON.stringify(items));
        console.log('Saved anonymous cart:', items.length, 'items');
      }
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [items, isAuthenticated, user, isInitialized]);

  // Merge anonymous cart with user cart when user logs in
  useEffect(() => {
    if (!isInitialized || !isAuthenticated || !user) return;
    
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
  }, [isAuthenticated, user, isInitialized]);

  // Clear cart when user logs out
  useEffect(() => {
    if (!isInitialized) return;
    
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
  }, [isAuthenticated, isInitialized]);

  const addToCart = useCallback((product: Product, quantity: number = 1, variant?: CartItem['variant']) => {
    console.log('Adding to cart:', product.name, 'quantity:', quantity, 'variant:', variant?.name);
    setItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        item => item.product.id === product.id && 
        (!variant || item.variant?.id === variant.id)
      );

      // Get available stock (variant stock takes priority if variant is selected)
      const availableStock = variant?.stockQuantity ?? product.stockQuantity ?? 0;
      
      if (existingItemIndex > -1) {
        // Update existing item
        const updatedItems = [...prevItems];
        const currentQuantity = updatedItems[existingItemIndex].quantity;
        const newQuantity = currentQuantity + quantity;
        
        if (newQuantity > availableStock) {
          // Calculate how many we can actually add
          const maxCanAdd = availableStock - currentQuantity;
          if (maxCanAdd > 0) {
            updatedItems[existingItemIndex].quantity = availableStock;
            // Import toast dynamically to avoid SSR issues
            import('react-hot-toast').then(({ default: toast }) => {
              toast.error(`Only ${maxCanAdd} more item(s) available. Added maximum possible quantity.`);
            });
          } else {
            import('react-hot-toast').then(({ default: toast }) => {
              toast.error(`Maximum quantity (${availableStock}) already in cart.`);
            });
          }
          console.log('Updated existing item to max stock:', availableStock);
          return updatedItems;
        }
        
        updatedItems[existingItemIndex].quantity = newQuantity;
        console.log('Updated existing item quantity to:', newQuantity);
        return updatedItems;
      } else {
        // Add new item
        if (quantity > availableStock) {
          if (availableStock > 0) {
            import('react-hot-toast').then(({ default: toast }) => {
              toast.error(`Only ${availableStock} item(s) available. Added maximum possible quantity.`);
            });
            const newItems = [...prevItems, { product, quantity: availableStock, variant }];
            console.log('Added new item with max available quantity:', availableStock);
            return newItems;
          } else {
            import('react-hot-toast').then(({ default: toast }) => {
              toast.error('This item is out of stock.');
            });
            console.log('Item out of stock, not added');
            return prevItems;
          }
        }
        
        const newItems = [...prevItems, { product, quantity, variant }];
        console.log('Added new item to cart, total items:', newItems.length);
        return newItems;
      }
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item => {
        if (item.product.id === productId) {
          // Get available stock (variant stock takes priority if variant is selected)
          const availableStock = item.variant?.stockQuantity ?? item.product.stockQuantity ?? 0;
          
          if (quantity > availableStock) {
            import('react-hot-toast').then(({ default: toast }) => {
              toast.error(`Maximum ${availableStock} item(s) available for this product.`);
            });
            return { ...item, quantity: availableStock };
          }
          
          return { ...item, quantity };
        }
        return item;
      })
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
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
  }, [isAuthenticated, user]);

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