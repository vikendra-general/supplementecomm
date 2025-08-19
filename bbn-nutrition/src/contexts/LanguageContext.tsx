'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'hi';

interface Product {
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
  variants?: { id: string; name: string; price: number; inStock: boolean }[];
  tags: string[];
  featured?: boolean;
  bestSeller?: boolean;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translateProduct: (product: Product) => Product;
  getProductTranslation: (productName: string) => string;
  translateVariant: (variantName: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translation data
const translations = {
  en: {
    // Header
    'header.todaysDeals': "Today's Deals",
    'header.bestSellers': 'Best Sellers',
    'header.proteinSupplements': 'Protein Supplements',
    'header.preWorkout': 'Pre-Workout',
    'header.vitamins': 'Vitamins',
    'header.aboutBBN': 'About BBN',
    'header.customerService': 'Customer Service',
    'header.searchPlaceholder': 'Search BBN Nutrition supplements...',
    'header.deliverTo': 'Deliver to',
    'header.signIn': 'Sign in to save your cart and track your orders.',
    
    // Cart
    'cart.title': 'Shopping Cart',
    'cart.items': 'items in your cart',
    'cart.item': 'item in your cart',
    'cart.cartItems': 'Cart Items',
    'cart.clearCart': 'Clear Cart',
    'cart.subtotal': 'Subtotal',
    'cart.shipping': 'Shipping',
    'cart.total': 'Total',
    'cart.free': 'Free',
    'cart.freeShippingMessage': 'more for free shipping!',
    'cart.qualifyFreeShipping': '🎉 You qualify for free shipping!',
    'cart.proceedToCheckout': 'Proceed to Checkout',
    'cart.continueShopping': 'Continue Shopping',
    'cart.emptyTitle': 'Your cart is empty',
    'cart.emptyMessage': "Looks like you haven't added any products to your cart yet.",
    'cart.add': 'Add',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.view': 'View',
    'common.close': 'Close',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.previous': 'Previous',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.price': 'Price',
    'common.quantity': 'Quantity',
    'common.addToCart': 'Add to Cart',
    'common.buyNow': 'Buy Now',
    'common.outOfStock': 'Out of Stock',
    'common.inStock': 'In Stock',
    
    // Product
    'product.description': 'Description',
    'product.ingredients': 'Ingredients',
    'product.nutritionFacts': 'Nutrition Facts',
    'product.reviews': 'Reviews',
    'product.rating': 'Rating',
    'product.servingSize': 'Serving Size',
    'product.calories': 'Calories',
    'product.protein': 'Protein',
    'product.carbs': 'Carbs',
    'product.fat': 'Fat',
    'product.sugar': 'Sugar',
    'product.sodium': 'Sodium',
    
    // Categories
    'category.allCategories': 'All Categories',
    'category.proteinSupplements': 'Protein Supplements',
    'category.preWorkout': 'Pre-Workout',
    'category.postWorkout': 'Post-Workout',
    'category.vitaminsAndMinerals': 'Vitamins & Minerals',
    'category.weightManagement': 'Weight Management',
    'category.creatine': 'Creatine',
    'category.aminoAcids': 'Amino Acids',
    
    // Product Names
    'product.bbnWheyProteinIsolate': 'BBN Whey Protein Isolate',
    'product.bbnPreWorkoutElite': 'BBN Pre-Workout Elite',
    'product.bbnCreatineMonohydrate': 'BBN Creatine Monohydrate',
    'product.bbnBcaaAminoAcids': 'BBN BCAA Amino Acids',
    'product.bbnMultivitaminComplete': 'BBN Multivitamin Complete',
    
    // Product Descriptions
    'product.wheyProteinDesc': 'Premium whey protein isolate with 25g protein per serving. Perfect for muscle building and recovery.',
    'product.preWorkoutDesc': 'Advanced pre-workout formula with creatine, beta-alanine, and caffeine for maximum performance.',
    'product.creatineDesc': 'Pure creatine monohydrate powder for strength and power gains.',
    'product.bcaaDesc': 'Essential branched-chain amino acids for muscle recovery and growth.',
    'product.multivitaminDesc': 'Comprehensive multivitamin with essential vitamins and minerals for overall health.',
    
    // Product Variants
    'variant.chocolate': 'Chocolate',
    'variant.vanilla': 'Vanilla',
    'variant.strawberry': 'Strawberry',
    'variant.fruitPunch': 'Fruit Punch',
    'variant.blueRaspberry': 'Blue Raspberry',
    'variant.orange': 'Orange',
    'variant.unflavored': 'Unflavored',
    'variant.citrus': 'Citrus',
    'variant.tropical': 'Tropical Punch',
    'variant.watermelon': 'Watermelon',
    'variant.mensFormula': "Men's Formula",
    'variant.womensFormula': "Women's Formula",
  },
  hi: {
    // Header
    'header.todaysDeals': 'आज के ऑफर',
    'header.bestSellers': 'बेस्ट सेलर',
    'header.proteinSupplements': 'प्रोटीन सप्लीमेंट',
    'header.preWorkout': 'प्री-वर्कआउट',
    'header.vitamins': 'विटामिन',
    'header.aboutBBN': 'BBN के बारे में',
    'header.customerService': 'ग्राहक सेवा',
    'header.searchPlaceholder': 'BBN न्यूट्रिशन सप्लीमेंट खोजें...',
    'header.deliverTo': 'डिलीवर करें',
    'header.signIn': 'अपनी कार्ट सेव करने और ऑर्डर ट्रैक करने के लिए साइन इन करें।',
    
    // Cart
    'cart.title': 'शॉपिंग कार्ट',
    'cart.items': 'आइटम आपकी कार्ट में',
    'cart.item': 'आइटम आपकी कार्ट में',
    'cart.cartItems': 'कार्ट आइटम',
    'cart.clearCart': 'कार्ट खाली करें',
    'cart.subtotal': 'उप-योग',
    'cart.shipping': 'शिपिंग',
    'cart.total': 'कुल',
    'cart.free': 'मुफ्त',
    'cart.freeShippingMessage': 'मुफ्त शिपिंग के लिए और जोड़ें!',
    'cart.qualifyFreeShipping': '🎉 आप मुफ्त शिपिंग के लिए योग्य हैं!',
    'cart.proceedToCheckout': 'चेकआउट पर जाएं',
    'cart.continueShopping': 'खरीदारी जारी रखें',
    'cart.emptyTitle': 'आपकी कार्ट खाली है',
    'cart.emptyMessage': 'लगता है आपने अभी तक अपनी कार्ट में कोई प्रोडक्ट नहीं जोड़ा है।',
    'cart.add': 'जोड़ें',
    
    // Common
    'common.loading': 'लोड हो रहा है...',
    'common.error': 'त्रुटि',
    'common.success': 'सफलता',
    'common.cancel': 'रद्द करें',
    'common.save': 'सेव करें',
    'common.delete': 'डिलीट करें',
    'common.edit': 'संपादित करें',
    'common.view': 'देखें',
    'common.close': 'बंद करें',
    'common.back': 'वापस',
    'common.next': 'अगला',
    'common.previous': 'पिछला',
    'common.search': 'खोजें',
    'common.filter': 'फिल्टर',
    'common.sort': 'सॉर्ट',
    'common.price': 'कीमत',
    'common.quantity': 'मात्रा',
    'common.addToCart': 'कार्ट में जोड़ें',
    'common.buyNow': 'अभी खरीदें',
    'common.outOfStock': 'स्टॉक में नहीं',
    'common.inStock': 'स्टॉक में',
    
    // Product
    'product.description': 'विवरण',
    'product.ingredients': 'सामग्री',
    'product.nutritionFacts': 'पोषण तथ्य',
    'product.reviews': 'समीक्षा',
    'product.rating': 'रेटिंग',
    'product.servingSize': 'सर्विंग साइज़',
    'product.calories': 'कैलोरी',
    'product.protein': 'प्रोटीन',
    'product.carbs': 'कार्ब्स',
    'product.fat': 'फैट',
    'product.sugar': 'चीनी',
    'product.sodium': 'सोडियम',
    
    // Categories
    'category.allCategories': 'सभी श्रेणियां',
    'category.proteinSupplements': 'प्रोटीन सप्लीमेंट',
    'category.preWorkout': 'प्री-वर्कआउट',
    'category.postWorkout': 'पोस्ट-वर्कआउट',
    'category.vitaminsAndMinerals': 'विटामिन और मिनरल',
    'category.weightManagement': 'वजन प्रबंधन',
    'category.creatine': 'क्रिएटिन',
    'category.aminoAcids': 'अमीनो एसिड',
    
    // Product Names
    'product.bbnWheyProteinIsolate': 'BBN व्हे प्रोटीन आइसोलेट',
    'product.bbnPreWorkoutElite': 'BBN प्री-वर्कआउट एलीट',
    'product.bbnCreatineMonohydrate': 'BBN क्रिएटिन मोनोहाइड्रेट',
    'product.bbnBcaaAminoAcids': 'BBN BCAA अमीनो एसिड',
    'product.bbnMultivitaminComplete': 'BBN मल्टीविटामिन कम्प्लीट',
    
    // Product Descriptions
    'product.wheyProteinDesc': 'प्रीमियम व्हे प्रोटीन आइसोलेट जिसमें प्रति सर्विंग 25g प्रोटीन है। मांसपेशियों के निर्माण और रिकवरी के लिए बिल्कुल सही।',
    'product.preWorkoutDesc': 'उन्नत प्री-वर्कआउट फॉर्मूला जिसमें क्रिएटिन, बीटा-एलानाइन और कैफीन है अधिकतम प्रदर्शन के लिए।',
    'product.creatineDesc': 'शुद्ध क्रिएटिन मोनोहाइड्रेट पाउडर शक्ति और पावर बढ़ाने के लिए।',
    'product.bcaaDesc': 'मांसपेशियों की रिकवरी और विकास के लिए आवश्यक ब्रांच्ड-चेन अमीनो एसिड।',
    'product.multivitaminDesc': 'समग्र स्वास्थ्य के लिए आवश्यक विटामिन और मिनरल के साथ व्यापक मल्टीविटामिन।',
    
    // Product Variants
    'variant.chocolate': 'चॉकलेट',
    'variant.vanilla': 'वनीला',
    'variant.strawberry': 'स्ट्रॉबेरी',
    'variant.fruitPunch': 'फ्रूट पंच',
    'variant.blueRaspberry': 'ब्लू रास्पबेरी',
    'variant.orange': 'ऑरेंज',
    'variant.unflavored': 'बिना स्वाद',
    'variant.citrus': 'सिट्रस',
    'variant.tropical': 'ट्रॉपिकल पंच',
    'variant.watermelon': 'तरबूज',
    'variant.mensFormula': 'पुरुषों का फॉर्मूला',
    'variant.womensFormula': 'महिलाओं का फॉर्मूला',
  },
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'hi')) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  // Function to translate product data
  const translateProduct = (product: Product): Product => {
    if (!product) return product;
    
    const translatedName = getProductTranslation(product.name);
    const translatedDescription = getProductDescriptionTranslation(product.name);
    
    return {
      ...product,
      name: translatedName || product.name,
      description: translatedDescription || product.description,
      variants: product.variants?.map((variant) => ({
        ...variant,
        name: translateVariant(variant.name) || variant.name
      }))
    };
  };

  // Helper function to get product name translation
  const getProductTranslation = (productName: string): string => {
    const nameMap: { [key: string]: string } = {
      'BBN Whey Protein Isolate': 'product.bbnWheyProteinIsolate',
      'BBN Pre-Workout Elite': 'product.bbnPreWorkoutElite',
      'BBN Creatine Monohydrate': 'product.bbnCreatineMonohydrate',
      'BBN BCAA Amino Acids': 'product.bbnBcaaAminoAcids',
      'BBN Multivitamin Complete': 'product.bbnMultivitaminComplete'
    };
    
    const key = nameMap[productName];
    return key ? t(key) : productName;
  };

  // Helper function to get product description translation
  const getProductDescriptionTranslation = (productName: string): string => {
    const descMap: { [key: string]: string } = {
      'BBN Whey Protein Isolate': 'product.wheyProteinDesc',
      'BBN Pre-Workout Elite': 'product.preWorkoutDesc',
      'BBN Creatine Monohydrate': 'product.creatineDesc',
      'BBN BCAA Amino Acids': 'product.bcaaDesc',
      'BBN Multivitamin Complete': 'product.multivitaminDesc'
    };
    
    const key = descMap[productName];
    return key ? t(key) : '';
  };

  // Helper function to translate variant names
  const translateVariant = (variantName: string): string => {
    const variantMap: { [key: string]: string } = {
      'Chocolate': 'variant.chocolate',
      'Vanilla': 'variant.vanilla',
      'Strawberry': 'variant.strawberry',
      'Fruit Punch': 'variant.fruitPunch',
      'Blue Raspberry': 'variant.blueRaspberry',
      'Orange': 'variant.orange',
      'Unflavored': 'variant.unflavored',
      'Citrus': 'variant.citrus',
      'Tropical Punch': 'variant.tropical',
      'Watermelon': 'variant.watermelon',
      "Men's Formula": 'variant.mensFormula',
      "Women's Formula": 'variant.womensFormula'
    };
    
    const key = variantMap[variantName];
    return key ? t(key) : variantName;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    translateProduct,
    getProductTranslation,
    translateVariant,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};