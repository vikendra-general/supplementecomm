export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  brand: string;
  images: string[];
  rating: number;
  reviews: number;
  inStock: boolean;
  stockQuantity?: number;
  nutritionFacts?: NutritionFacts;
  variants?: ProductVariant[];
  tags: string[];
  featured?: boolean;
  bestSeller?: boolean;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  inStock: boolean;
  stockQuantity?: number;
}

export interface NutritionFacts {
  servingSize: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar: number;
  sodium: number;
  ingredients: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  variant?: ProductVariant;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  phone?: string;
  addresses?: Address[];
  wishlist?: string[];
  emailVerified: boolean;
  lastLogin?: string;
  createdAt?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  shippingAddress: Address;
  billingAddress: Address;
  trackingNumber?: string;
  estimatedDelivery?: string;
  notes?: string;
  statusHistory: StatusHistory[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
  variant?: {
    id: string;
    name: string;
    price: number;
  };
}

export interface StatusHistory {
  status: string;
  timestamp: string;
  note?: string;
}

export interface Address {
  _id: string;
  type: 'home' | 'work' | 'other';
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  description: string;
}

export interface FilterOptions {
  categories: string[];
  brands: string[];
  priceRange: {
    min: number;
    max: number;
  };
  inStock: boolean;
}

export interface SortOption {
  value: string;
  label: string;
}