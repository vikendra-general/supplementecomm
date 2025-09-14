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
  productId: string;
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
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
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
  const { isAuthenticated, user } = useAuth();
  const prevAuthStateRef = useRef<boolean | null>(null);

  // Load cart from server for authenticated users
  const loadCartFromServer = useCallback(async () => {
    if (!isAuthenticated || !user) {
      console.log('🚫 Not loading cart from server - user not authenticated');
      return [];
    }
    
    try {
      console.log('📡 Loading cart from server for user:', user.id);
      const response = await apiService.getCart();
      console.log('📡 Server cart response:', response);
      
      if (response.success && (response as CartApiResponse).cart) {
        // Convert server cart format to frontend format
        const serverCart = (response as CartApiResponse).cart;
        console.log('📦 Server cart data:', serverCart);
        const serverItems = serverCart.items || [];
        console.log('📦 Server cart items:', serverItems.length, 'items');
        
        // Create cart items with minimal product data from server
         const cartItems: CartItem[] = serverItems.map(serverItem => {
           console.log('🔄 Converting server item:', serverItem);
           return {
             product: {
               id: serverItem.productId,
               name: serverItem.productName,
               price: serverItem.price,
               // Add minimal required fields
               description: '',
               category: '',
               brand: '',
               images: [],
               stockQuantity: 100, // Default stock
               inStock: true,
               featured: false,
               rating: 0,
               reviews: 0, // Number of reviews
               tags: [],
               variants: []
             } as Product,
             quantity: serverItem.quantity,
             variant: serverItem.variant
           };
         });
        
        console.log('✅ Loaded server cart with simplified products:', cartItems.length, 'items');
        console.log('📦 Cart items:', cartItems);
        return cartItems;
      } else {
        console.log('📦 No cart data from server or request failed:', response);
      }
    } catch (error) {
      console.error('❌ Error loading cart from server:', error);
    }
    
    return [];
  }, [isAuthenticated, user]);

  // Get auth loading state
  const { isLoading: authLoading } = useAuth();

  // BULLETPROOF CART LOADING - Wait for Auth State, Then Database First
  useEffect(() => {
    if (isInitialized) {
      console.log('🚫 Cart already initialized, skipping');
      return;
    }

    // CRITICAL FIX: Wait for auth context to finish loading
    if (authLoading) {
      console.log('⏳ Waiting for authentication to complete before cart initialization');
      return;
    }

    console.log('🔄 BULLETPROOF CART INITIALIZATION...');
    console.log('🔐 Auth state:', { isAuthenticated, userId: user?.id, authLoading });

    const loadCart = async () => {
      try {
        let savedCart: CartItem[] = [];
        
        if (isAuthenticated && user) {
          console.log('👤 AUTHENTICATED USER - FORCING DATABASE LOAD:', user.id);
          
          // FORCE database load - no localStorage fallback
          try {
            savedCart = await loadCartFromServer();
            console.log('📦 DATABASE CART LOADED:', savedCart.length, 'items');
            
            // Clear localStorage for authenticated users only
            try {
              localStorage.removeItem('cart_anonymous');
              console.log('🧹 CLEARED ANONYMOUS CART FROM LOCALSTORAGE');
            } catch (e) {
              console.warn('Could not clear localStorage:', e);
            }
            
          } catch (dbError) {
            console.error('❌ Database cart load failed:', dbError);
            // Even if DB fails, don't use localStorage for authenticated users
            savedCart = [];
          }
        } else {
          console.log('👤 Anonymous user - using localStorage');
          const anonymousCart = localStorage.getItem('cart_anonymous');
          if (anonymousCart) {
            try {
              savedCart = JSON.parse(anonymousCart);
              console.log('✅ Loaded anonymous cart:', savedCart.length, 'items');
            } catch (parseError) {
              console.error('❌ Error parsing anonymous cart:', parseError);
              localStorage.removeItem('cart_anonymous');
              savedCart = [];
            }
          }
        }
        
        console.log('🎯 SETTING CART ITEMS:', savedCart);
        setItems(savedCart);
        console.log('✅ CART INITIALIZED WITH', savedCart.length, 'ITEMS');
        
        setIsInitialized(true);
        console.log('🎉 BULLETPROOF CART INITIALIZATION COMPLETED');
      } catch (error) {
        console.error('❌ Error during cart initialization:', error);
        setItems([]);
        setIsInitialized(true);
      }
    };

    // Load cart after auth is ready
    loadCart();
  }, [isAuthenticated, user, isInitialized, authLoading, loadCartFromServer]);

  // Simplified fallback: Just mark as initialized if stuck
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (!isInitialized) {
        console.log('🔄 Cart initialization fallback - marking as initialized');
        setIsInitialized(true);
      }
    }, 2000); // 2 second fallback
    
    return () => clearTimeout(fallbackTimer);
  }, [isInitialized]);

  // DISABLED: No localStorage auto-saving for authenticated users (database only)
  useEffect(() => {
    if (!isInitialized) {
      console.log('🚫 Not saving cart - not initialized yet');
      return;
    }
    
    // Only save to localStorage for anonymous users
    if (!isAuthenticated || !user) {
      console.log('💾 Auto-saving anonymous cart to localStorage - items:', items.length);
      try {
        localStorage.setItem('cart_anonymous', JSON.stringify(items));
        console.log('✅ Auto-saved anonymous cart - items:', items.length);
      } catch (error) {
        console.error('❌ Error auto-saving anonymous cart:', error);
      }
    } else {
      console.log('📦 AUTHENTICATED USER - DATABASE ONLY, NO LOCALSTORAGE');
      // For authenticated users, cart is saved to database via API calls
      // No localStorage operations to prevent conflicts
    }
  }, [items, isAuthenticated, user, isInitialized]);

  // Sync anonymous cart with server when user logs in
  useEffect(() => {
    if (!isInitialized || !isAuthenticated || !user) return;
    
    const syncAnonymousCart = async () => {
      try {
        const anonymousCart = localStorage.getItem('cart_anonymous');
        if (anonymousCart) {
          const anonymousItems: CartItem[] = JSON.parse(anonymousCart);
          
          if (anonymousItems.length > 0) {
            // Convert to server format and sync
            const serverItems = anonymousItems.map(item => ({
              productId: item.product.id,
              quantity: item.quantity,
              variant: item.variant
            }));
            
            try {
              const response = await apiService.syncCart(serverItems);
              if (response.success) {
                console.log('Synced anonymous cart with server successfully');
                // Reload cart from server
                const updatedCart = await loadCartFromServer();
                setItems(updatedCart);
              } else {
                console.warn('Failed to sync cart with server, using local merge');
                // Fallback to local merge
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
              }
            } catch (error) {
              console.error('Error syncing cart with server:', error);
            }
            
            // Clear anonymous cart after syncing/merging
            localStorage.removeItem('cart_anonymous');
          }
        }
      } catch (error) {
        console.error('Error syncing anonymous cart:', error);
      }
    };
    
    syncAnonymousCart();
  }, [isAuthenticated, user, isInitialized]);

  // Clear cart when user explicitly logs out (but not on page refresh)
  useEffect(() => {
    if (!isInitialized) {
      console.log('🚫 Cart clear effect - not initialized yet');
      return;
    }
    
    console.log('🔍 Cart clear effect - checking auth state:', { isAuthenticated, userId: user?.id, prevAuth: prevAuthStateRef.current });
    
    // Only track auth state changes after initialization is complete
    if (prevAuthStateRef.current === null) {
      console.log('🔄 First auth state after initialization - setting baseline');
      prevAuthStateRef.current = isAuthenticated;
      return;
    }
    
    // Only clear cart if user was previously authenticated and is now not authenticated (actual logout)
    // AND we're not in the middle of a page refresh (check if we have items in state)
    if (prevAuthStateRef.current === true && !isAuthenticated && items.length > 0) {
      console.log('🧹 User logged out - clearing cart state only (database cart preserved)');
      // Only clear React state, not database - database cart will be cleared by logout API
      setItems([]);
      
      // Clear localStorage only
      try {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('cart_')) {
            keysToRemove.push(key);
          }
        }
        if (keysToRemove.length > 0) {
          console.log('🧹 Removing localStorage cart keys:', keysToRemove);
          keysToRemove.forEach(key => localStorage.removeItem(key));
        }
      } catch (error) {
        console.error('❌ Error clearing localStorage:', error);
      }
    } else if (prevAuthStateRef.current === false && !isAuthenticated) {
      console.log('📄 Staying unauthenticated - keeping cart data');
    } else {
      console.log('✅ Auth state change - keeping cart data');
    }
    
    // Update previous auth state
    prevAuthStateRef.current = isAuthenticated;
  }, [isAuthenticated, isInitialized, user, items.length]);

  const addToCart = useCallback(async (product: Product, quantity: number = 1, variant?: CartItem['variant']) => {
    console.log('🛒 Adding to cart:', product.name, 'quantity:', quantity, 'variant:', variant?.name);
    console.log('🔐 User authenticated:', isAuthenticated, 'User ID:', user?.id);
    
    // For authenticated users, ALWAYS use server/database
    if (isAuthenticated && user) {
      try {
        console.log('📡 AUTHENTICATED USER - Calling server addToCart API...');
        console.log('📡 API call details:', { productId: product.id, quantity, variant, userId: user.id });
        
        const response = await apiService.addToCart({
          productId: product.id,
          quantity,
          variant
        });
        
        console.log('📡 Server response:', response);
        
        if (response.success) {
          // Reload cart from server to get updated state
          console.log('✅ Server add successful, reloading cart from server...');
          const updatedCart = await loadCartFromServer();
          console.log('📦 Updated cart from server:', updatedCart);
          setItems(updatedCart);
          console.log('✅ Cart state updated with', updatedCart.length, 'items');
          return;
        } else {
          // For authenticated users, DO NOT fall back to localStorage
          console.error('❌ Server add to cart failed for authenticated user:', response);
          throw new Error(`Server cart failed: ${response.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('❌ CRITICAL: Error adding to server cart for authenticated user:', error);
        // For authenticated users, show error instead of falling back
        throw error;
      }
    }
    
    // For anonymous users or fallback, use localStorage directly
    console.log('💾 Using localStorage for cart (anonymous user or server fallback)');
    console.log('🔍 Current authentication state:', { isAuthenticated, userId: user?.id });
    
    // Get current cart items
    const currentItems = [...items];
    console.log('📦 Current cart items before adding:', currentItems.length);
    console.log('📦 Current cart items:', currentItems);
    
    const existingItemIndex = currentItems.findIndex(
      item => item.product.id === product.id && 
      (!variant || item.variant?.id === variant.id)
    );

    // Get available stock (variant stock takes priority if variant is selected)
    const availableStock = variant?.stockQuantity ?? product.stockQuantity ?? 0;
    
    let updatedItems: CartItem[];
    
    if (existingItemIndex > -1) {
      // Update existing item
      const currentQuantity = currentItems[existingItemIndex].quantity;
      const newQuantity = currentQuantity + quantity;
      
      if (newQuantity > availableStock) {
        // Calculate how many we can actually add
        const maxCanAdd = availableStock - currentQuantity;
        if (maxCanAdd > 0) {
          currentItems[existingItemIndex].quantity = availableStock;
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
        updatedItems = currentItems;
      } else {
        currentItems[existingItemIndex].quantity = newQuantity;
        console.log('Updated existing item quantity to:', newQuantity);
        updatedItems = currentItems;
      }
    } else {
      // Add new item
      if (quantity > availableStock) {
        if (availableStock > 0) {
          import('react-hot-toast').then(({ default: toast }) => {
            toast.error(`Only ${availableStock} item(s) available. Added maximum possible quantity.`);
          });
          updatedItems = [...currentItems, { product, quantity: availableStock, variant }];
          console.log('Added new item with max available quantity:', availableStock);
        } else {
          import('react-hot-toast').then(({ default: toast }) => {
            toast.error('This item is out of stock.');
          });
          console.log('Item out of stock, not added');
          updatedItems = currentItems;
        }
      } else {
        updatedItems = [...currentItems, { product, quantity, variant }];
        console.log('✅ Added new item to cart, total items:', updatedItems.length);
      }
    }
    
    console.log('📦 Final cart state:', updatedItems);
    
    // Update state immediately
    setItems(updatedItems);
    console.log('✅ Cart state updated in React');
    
    // Save to localStorage
    try {
      const storageKey = isAuthenticated && user ? `cart_${user.id}` : 'cart_anonymous';
      localStorage.setItem(storageKey, JSON.stringify(updatedItems));
      console.log('✅ Cart saved to localStorage with key:', storageKey);
    } catch (error) {
      console.error('❌ Error saving cart to localStorage:', error);
    }
    
    console.log('🎯 AddToCart function completed');
  }, [isAuthenticated, user, loadCartFromServer]);

  const removeFromCart = useCallback(async (productId: string) => {
    // For authenticated users, sync with server
    if (isAuthenticated && user) {
      try {
        const response = await apiService.removeFromCart({
          productId
        });
        
        if (response.success) {
          // Reload cart from server to get updated state
          const updatedCart = await loadCartFromServer();
          setItems(updatedCart);
          console.log('Removed from server cart successfully');
          return;
        } else {
          console.warn('Server remove from cart failed, falling back to localStorage');
        }
      } catch (error) {
        console.error('Error removing from server cart:', error);
      }
    }
    
    // For anonymous users or fallback, use localStorage
    setItems(prevItems => prevItems.filter(item => item.product.id !== productId));
  }, [isAuthenticated, user, loadCartFromServer]);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    if (quantity < 1) {
      await removeFromCart(productId);
      return;
    }

    // For authenticated users, sync with server
    if (isAuthenticated && user) {
      try {
        const response = await apiService.updateCartItem({
          productId,
          quantity
        });
        
        if (response.success) {
          // Reload cart from server to get updated state
          const updatedCart = await loadCartFromServer();
          setItems(updatedCart);
          console.log('Updated server cart successfully');
          return;
        } else {
          console.warn('Server update cart failed, falling back to localStorage');
        }
      } catch (error) {
        console.error('Error updating server cart:', error);
      }
    }

    // For anonymous users or fallback, use localStorage
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
  }, [removeFromCart, isAuthenticated, user, loadCartFromServer]);

  const clearCart = useCallback(async () => {
    // For authenticated users, clear server cart
    if (isAuthenticated && user) {
      try {
        const response = await apiService.clearCart();
        if (response.success) {
          console.log('Cleared server cart successfully');
        } else {
          console.warn('Server clear cart failed');
        }
      } catch (error) {
        console.error('Error clearing server cart:', error);
      }
    }
    
    // Clear local state and localStorage
    setItems([]);
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