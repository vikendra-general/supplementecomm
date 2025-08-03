import { Product } from '@/types';

export const products: Product[] = [
  {
    id: '1',
    name: 'BBN Whey Protein Isolate',
    description: 'Premium whey protein isolate with 25g protein per serving. Perfect for muscle building and recovery.',
    price: 59.99,
    originalPrice: 79.99,
    category: 'Protein',
    brand: 'BBN',
    images: [
      '/images/products/whey-protein.jpg',
      '/images/products/whey-protein-2.jpg',
      '/images/products/whey-protein-3.jpg'
    ],
    rating: 4.8,
    reviews: 1247,
    inStock: true,
    featured: true,
    tags: ['whey', 'protein', 'muscle-building', 'recovery'],
    nutritionFacts: {
      servingSize: '30g',
      calories: 120,
      protein: 25,
      carbs: 3,
      fat: 1,
      sugar: 1,
      sodium: 140,
      ingredients: ['Whey Protein Isolate', 'Natural Flavors', 'Sweeteners', 'Emulsifiers']
    },
    variants: [
      { id: '1-1', name: 'Chocolate', price: 59.99, inStock: true },
      { id: '1-2', name: 'Vanilla', price: 59.99, inStock: true },
      { id: '1-3', name: 'Strawberry', price: 59.99, inStock: false }
    ]
  },
  {
    id: '2',
    name: 'BBN Pre-Workout Elite',
    description: 'Advanced pre-workout formula with creatine, beta-alanine, and caffeine for maximum performance.',
    price: 44.99,
    originalPrice: 54.99,
    category: 'Pre-Workout',
    brand: 'BBN',
    images: [
      '/images/products/placeholder.svg',
      '/images/products/placeholder.svg'
    ],
    rating: 4.6,
    reviews: 892,
    inStock: true,
    featured: true,
    tags: ['pre-workout', 'energy', 'performance', 'creatine'],
    nutritionFacts: {
      servingSize: '15g',
      calories: 45,
      protein: 0,
      carbs: 11,
      fat: 0,
      sugar: 0,
      sodium: 200,
      ingredients: ['Creatine Monohydrate', 'Beta-Alanine', 'Caffeine', 'L-Citrulline', 'BCAAs']
    }
  },
  {
    id: '3',
    name: 'BBN Creatine Monohydrate',
    description: 'Pure creatine monohydrate powder for strength and power gains.',
    price: 24.99,
    category: 'Creatine',
    brand: 'BBN',
    images: [
      '/images/products/placeholder.svg',
      '/images/products/placeholder.svg'
    ],
    rating: 4.7,
    reviews: 1563,
    inStock: true,
    tags: ['creatine', 'strength', 'power', 'muscle'],
    nutritionFacts: {
      servingSize: '5g',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      sugar: 0,
      sodium: 0,
      ingredients: ['Creatine Monohydrate']
    }
  },
  {
    id: '4',
    name: 'BBN BCAA Amino Acids',
    description: 'Essential branched-chain amino acids for muscle recovery and growth.',
    price: 34.99,
    originalPrice: 39.99,
    category: 'Amino Acids',
    brand: 'BBN',
    images: [
      '/images/products/placeholder.svg',
      '/images/products/placeholder.svg'
    ],
    rating: 4.5,
    reviews: 734,
    inStock: true,
    tags: ['bcaa', 'amino acids', 'recovery', 'muscle'],
    nutritionFacts: {
      servingSize: '10g',
      calories: 40,
      protein: 10,
      carbs: 0,
      fat: 0,
      sugar: 0,
      sodium: 0,
      ingredients: ['L-Leucine', 'L-Isoleucine', 'L-Valine', 'Natural Flavors']
    }
  },
  {
    id: '5',
    name: 'BBN Multivitamin Complete',
    description: 'Comprehensive multivitamin with minerals and antioxidants for overall health.',
    price: 29.99,
    category: 'Vitamins',
    brand: 'BBN',
    images: [
      '/images/products/placeholder.svg',
      '/images/products/placeholder.svg'
    ],
    rating: 4.4,
    reviews: 456,
    inStock: true,
    tags: ['multivitamin', 'health', 'immunity', 'wellness'],
    nutritionFacts: {
      servingSize: '1 tablet',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      sugar: 0,
      sodium: 0,
      ingredients: ['Vitamin A', 'Vitamin C', 'Vitamin D', 'Vitamin E', 'B-Complex Vitamins', 'Minerals']
    }
  },
  {
    id: '6',
    name: 'BBN Omega-3 Fish Oil',
    description: 'High-quality fish oil with EPA and DHA for heart and brain health.',
    price: 19.99,
    originalPrice: 24.99,
    category: 'Omega-3',
    brand: 'BBN',
    images: [
      '/images/products/placeholder.svg',
      '/images/products/placeholder.svg'
    ],
    rating: 4.6,
    reviews: 623,
    inStock: true,
    tags: ['omega-3', 'fish oil', 'heart health', 'brain health'],
    nutritionFacts: {
      servingSize: '2 softgels',
      calories: 20,
      protein: 0,
      carbs: 0,
      fat: 2,
      sugar: 0,
      sodium: 0,
      ingredients: ['Fish Oil', 'EPA', 'DHA', 'Vitamin E']
    }
  },
  {
    id: '7',
    name: 'BBN Mass Gainer',
    description: 'High-calorie mass gainer with protein and carbs for weight gain and muscle building.',
    price: 69.99,
    originalPrice: 89.99,
    category: 'Mass Gainer',
    brand: 'BBN',
    images: [
      '/images/products/placeholder.svg',
      '/images/products/placeholder.svg'
    ],
    rating: 4.3,
    reviews: 387,
    inStock: true,
    tags: ['mass gainer', 'weight gain', 'muscle building', 'calories'],
    nutritionFacts: {
      servingSize: '150g',
      calories: 600,
      protein: 50,
      carbs: 80,
      fat: 8,
      sugar: 15,
      sodium: 300,
      ingredients: ['Whey Protein', 'Maltodextrin', 'Oats', 'Natural Flavors', 'Vitamins', 'Minerals']
    }
  },
  {
    id: '8',
    name: 'BBN L-Carnitine',
    description: 'L-Carnitine supplement for fat burning and energy production.',
    price: 39.99,
    category: 'Fat Burners',
    brand: 'BBN',
    images: [
      '/images/products/placeholder.svg',
      '/images/products/placeholder.svg'
    ],
    rating: 4.2,
    reviews: 298,
    inStock: false,
    tags: ['l-carnitine', 'fat burning', 'energy', 'weight loss'],
    nutritionFacts: {
      servingSize: '1 capsule',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      sugar: 0,
      sodium: 0,
      ingredients: ['L-Carnitine L-Tartrate']
    }
  }
]; 