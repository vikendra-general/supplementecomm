'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '@/types';

type Language = 'en' | 'hi';

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
    
    // Homepage
    'home.heroTitle': 'Premium Supplements for Peak Performance',
    'home.heroSubtitle': 'Discover our scientifically-formulated supplements designed to help you achieve your fitness goals',
    'home.shopNow': 'Shop Now',
    'home.categoriesTitle': 'Shop by Category',
    'home.categoriesSubtitle': 'Find the perfect supplements for your fitness journey',
    'home.featuredTitle': 'Our Best Sellers',
    'home.featuredSubtitle': 'Discover our most popular and highest-rated supplements trusted by thousands',
    'home.viewAll': 'View All Products',
    'home.startShopping': 'Start Shopping',
    'home.products': 'products',
    'home.whyChooseUs': 'Why Choose BBN Nutrition?',
    'home.qualityTitle': 'Premium Quality',
    'home.qualityDesc': 'All our products are made with the highest quality ingredients and undergo rigorous testing',
    'home.shippingTitle': 'Fast Shipping',
    'home.shippingDesc': 'Free shipping on orders over ₹999 with quick delivery across India',
    'home.supportTitle': '24/7 Support',
    'home.supportDesc': 'Our expert team is always ready to help you with your nutrition and fitness goals',
    'home.guaranteeTitle': 'Money Back Guarantee',
    'home.guaranteeDesc': '30-day money back guarantee on all products if you\'re not completely satisfied',
    'home.testimonialsTitle': 'What Our Customers Say',
    'home.testimonialsSubtitle': 'Join thousands of satisfied customers who trust BBN Nutrition',
    
    // Footer
    'footer.quickLinks': 'Quick Links',
    'footer.shopAll': 'Shop All',
    'footer.protein': 'Protein',
    'footer.preWorkout': 'Pre-Workout',
    'footer.vitamins': 'Vitamins',
    'footer.aboutUs': 'About Us',
    'footer.customerService': 'Customer Service',
    'footer.contactUs': 'Contact Us',
    'footer.shippingInfo': 'Shipping Info',
    'footer.returns': 'Returns & Exchanges',
    'footer.faq': 'FAQ',
    'footer.sizeGuide': 'Size Guide',
    'footer.adminLogin': 'Admin Login',
    'footer.contactInfo': 'Contact Info',
    'footer.address': '123 Fitness Street, New Delhi, India',
    'footer.phone': '+91 98765 43210',
    'footer.email': 'support@bbn-nutrition.com',
    'footer.followUs': 'Follow Us',
    'footer.newsletter': 'Newsletter',
    'footer.newsletterDesc': 'Subscribe to get updates on new products and exclusive offers',
    'footer.subscribe': 'Subscribe',
    'footer.copyright': '© 2024 BBN Nutrition. All rights reserved.',
    
    // Shop
    'shop.title': 'Shop',
    'shop.subtitle': 'Find the perfect supplements for your fitness goals',
    'shop.filters': 'Filters',
    'shop.category': 'Category',
    'shop.allCategories': 'All Categories',
    'shop.brand': 'Brand',
    'shop.allBrands': 'All Brands',
    'shop.priceRange': 'Price Range',
    'shop.minPrice': 'Min Price (₹)',
    'shop.maxPrice': 'Max Price (₹)',
    'shop.inStockOnly': 'In Stock Only',
    'shop.minimumRating': 'Minimum Rating',
    'shop.anyRating': 'Any Rating',
    'shop.clearFilters': 'Clear Filters',
    'shop.noProducts': 'No products found',
    'shop.adjustFilters': 'Try adjusting your filters or search terms.',
    'shop.sortBy': 'Sort By',
    'shop.featured': 'Featured',
    'shop.priceLowHigh': 'Price: Low to High',
    'shop.priceHighLow': 'Price: High to Low',
    'shop.rating': 'Rating',
    'shop.newest': 'Newest',
    
    // Dashboard
    'dashboard.title': 'My Account',
    'dashboard.welcome': 'Welcome back',
    'dashboard.orders': 'My Orders',
    'dashboard.wishlist': 'My Wishlist',
    'dashboard.addresses': 'Addresses',
    'dashboard.settings': 'Account Settings',
    'dashboard.logout': 'Logout',
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
    
    // Homepage
    'home.heroTitle': 'शिखर प्रदर्शन के लिए प्रीमियम सप्लीमेंट',
    'home.heroSubtitle': 'अपने फिटनेस लक्ष्यों को प्राप्त करने में मदद के लिए डिज़ाइन किए गए हमारे वैज्ञानिक रूप से तैयार सप्लीमेंट खोजें',
    'home.shopNow': 'अभी खरीदें',
    'home.categoriesTitle': 'श्रेणी के अनुसार खरीदें',
    'home.categoriesSubtitle': 'अपनी फिटनेस यात्रा के लिए सही सप्लीमेंट खोजें',
    'home.featuredTitle': 'हमारे बेस्ट सेलर',
    'home.featuredSubtitle': 'हजारों लोगों द्वारा भरोसा किए जाने वाले हमारे सबसे लोकप्रिय और उच्च रेटेड सप्लीमेंट खोजें',
    'home.viewAll': 'सभी उत्पाद देखें',
    'home.startShopping': 'खरीदारी शुरू करें',
    'home.products': 'उत्पाद',
    'home.whyChooseUs': 'BBN न्यूट्रिशन क्यों चुनें?',
    'home.qualityTitle': 'प्रीमियम गुणवत्ता',
    'home.qualityDesc': 'हमारे सभी उत्पाद उच्चतम गुणवत्ता वाली सामग्री से बने हैं और कठोर परीक्षण से गुजरते हैं',
    'home.shippingTitle': 'तेज़ शिपिंग',
    'home.shippingDesc': '₹999 से अधिक के ऑर्डर पर मुफ्त शिपिंग और भारत भर में तेज़ डिलीवरी',
    'home.supportTitle': '24/7 सहायता',
    'home.supportDesc': 'हमारी विशेषज्ञ टीम आपके पोषण और फिटनेस लक्ष्यों में हमेशा आपकी मदद के लिए तैयार है',
    'home.guaranteeTitle': 'पैसे वापसी की गारंटी',
    'home.guaranteeDesc': 'यदि आप पूरी तरह संतुष्ट नहीं हैं तो सभी उत्पादों पर 30-दिन की पैसे वापसी की गारंटी',
    'home.testimonialsTitle': 'हमारे ग्राहक क्या कहते हैं',
    'home.testimonialsSubtitle': 'हजारों संतुष्ट ग्राहकों में शामिल हों जो BBN न्यूट्रिशन पर भरोसा करते हैं',
    
    // Footer
    'footer.quickLinks': 'त्वरित लिंक',
    'footer.shopAll': 'सभी खरीदें',
    'footer.protein': 'प्रोटीन',
    'footer.preWorkout': 'प्री-वर्कआउट',
    'footer.vitamins': 'विटामिन',
    'footer.aboutUs': 'हमारे बारे में',
    'footer.customerService': 'ग्राहक सेवा',
    'footer.contactUs': 'संपर्क करें',
    'footer.shippingInfo': 'शिपिंग जानकारी',
    'footer.returns': 'रिटर्न और एक्सचेंज',
    'footer.faq': 'अक्सर पूछे जाने वाले प्रश्न',
    'footer.sizeGuide': 'साइज़ गाइड',
    'footer.adminLogin': 'एडमिन लॉगिन',
    'footer.contactInfo': 'संपर्क जानकारी',
    'footer.address': '123 फिटनेस स्ट्रीट, नई दिल्ली, भारत',
    'footer.phone': '+91 98765 43210',
    'footer.email': 'support@bbn-nutrition.com',
    'footer.followUs': 'हमें फॉलो करें',
    'footer.newsletter': 'न्यूज़लेटर',
    'footer.newsletterDesc': 'नए उत्पादों और विशेष ऑफर की अपडेट पाने के लिए सब्सक्राइब करें',
    'footer.subscribe': 'सब्सक्राइब करें',
    'footer.copyright': '© 2024 BBN न्यूट्रिशन। सभी अधिकार सुरक्षित।',
    
    // Shop
    'shop.title': 'दुकान',
    'shop.subtitle': 'अपने फिटनेस लक्ष्यों के लिए सही सप्लीमेंट खोजें',
    'shop.filters': 'फिल्टर',
    'shop.category': 'श्रेणी',
    'shop.allCategories': 'सभी श्रेणियां',
    'shop.brand': 'ब्रांड',
    'shop.allBrands': 'सभी ब्रांड',
    'shop.priceRange': 'मूल्य सीमा',
    'shop.minPrice': 'न्यूनतम मूल्य (₹)',
    'shop.maxPrice': 'अधिकतम मूल्य (₹)',
    'shop.inStockOnly': 'केवल स्टॉक में',
    'shop.minimumRating': 'न्यूनतम रेटिंग',
    'shop.anyRating': 'कोई भी रेटिंग',
    'shop.clearFilters': 'फिल्टर साफ़ करें',
    'shop.noProducts': 'कोई उत्पाद नहीं मिला',
    'shop.adjustFilters': 'अपने फिल्टर या खोज शब्दों को समायोजित करने का प्रयास करें।',
    'shop.sortBy': 'इसके अनुसार क्रमबद्ध करें',
    'shop.featured': 'फीचर्ड',
    'shop.priceLowHigh': 'मूल्य: कम से अधिक',
    'shop.priceHighLow': 'मूल्य: अधिक से कम',
    'shop.rating': 'रेटिंग',
    'shop.newest': 'नवीनतम',
    
    // Dashboard
    'dashboard.title': 'मेरा खाता',
    'dashboard.welcome': 'वापसी पर स्वागत है',
    'dashboard.orders': 'मेरे ऑर्डर',
    'dashboard.wishlist': 'मेरी विशलिस्ट',
    'dashboard.addresses': 'पते',
    'dashboard.settings': 'खाता सेटिंग्स',
    'dashboard.logout': 'लॉगआउट',
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