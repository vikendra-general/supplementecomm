'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Package, Truck, CreditCard, Shield, Users } from 'lucide-react';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  // General Questions
  {
    id: 1,
    question: "What is Booster Box Nutrition?",
    answer: "Booster Box Nutrition (BBN) is a premium supplement company dedicated to providing high-quality nutrition products for athletes, fitness enthusiasts, and health-conscious individuals. We offer a wide range of supplements including protein powders, pre-workouts, vitamins, and more.",
    category: "general"
  },
  {
    id: 2,
    question: "Are your products authentic and safe?",
    answer: "Yes, all our products are 100% authentic and sourced directly from authorized distributors and manufacturers. We maintain strict quality control standards and all products undergo rigorous testing for purity and potency.",
    category: "general"
  },
  {
    id: 3,
    question: "Do you offer product recommendations?",
    answer: "Absolutely! Our team of nutrition experts can help you choose the right products based on your fitness goals, dietary preferences, and health requirements. You can contact our customer support for personalized recommendations.",
    category: "general"
  },

  // Orders & Payment
  {
    id: 4,
    question: "How do I place an order?",
    answer: "Simply browse our products, add items to your cart, and proceed to checkout. You can create an account for faster checkout or continue as a guest. We accept various payment methods including credit/debit cards, UPI, net banking, and cash on delivery.",
    category: "orders"
  },
  {
    id: 5,
    question: "Can I modify or cancel my order?",
    answer: "You can modify or cancel your order within 1 hour of placing it, provided it hasn't been processed for shipping. After that, you'll need to follow our return process once you receive the items.",
    category: "orders"
  },
  {
    id: 6,
    question: "What payment methods do you accept?",
    answer: "We accept all major credit and debit cards, UPI payments, net banking, digital wallets, and cash on delivery (COD) for orders up to ₹5,000. COD charges may apply for orders under ₹999.",
    category: "orders"
  },

  // Shipping & Delivery
  {
    id: 7,
    question: "How long does shipping take?",
    answer: "Standard shipping takes 5-7 business days, while express shipping takes 2-3 business days. Metro cities typically receive orders faster. All orders are processed within 1-2 business days.",
    category: "shipping"
  },
  {
    id: 8,
    question: "Do you offer free shipping?",
    answer: "Yes! We offer free standard shipping on all orders over ₹999. For orders under ₹999, standard shipping costs ₹99. Express shipping is available for ₹199.",
    category: "shipping"
  },
  {
    id: 9,
    question: "Can I track my order?",
    answer: "Yes, once your order is shipped, you'll receive a tracking number via email and SMS. You can track your order status in real-time through our website or the carrier's tracking system.",
    category: "shipping"
  },

  // Returns & Exchanges
  {
    id: 10,
    question: "What is your return policy?",
    answer: "We offer a 30-day return policy for unopened products in their original packaging. Opened supplement containers cannot be returned for safety reasons, except in cases of defects or wrong items shipped.",
    category: "returns"
  },
  {
    id: 11,
    question: "How do I return an item?",
    answer: "Log into your account, go to 'My Orders', select the item you want to return, and follow the return process. We'll provide a prepaid return label for eligible returns.",
    category: "returns"
  },
  {
    id: 12,
    question: "How long does it take to get a refund?",
    answer: "Refunds are processed within 5-7 business days for credit/debit cards, 3-5 days for UPI/net banking, and 1-2 days for digital wallets, once we receive and inspect the returned item.",
    category: "returns"
  },

  // Products
  {
    id: 13,
    question: "How do I choose the right protein powder?",
    answer: "Consider your fitness goals, dietary restrictions, and taste preferences. Whey protein is great for muscle building, casein for slow digestion, and plant-based options for vegans. Our product descriptions include detailed information to help you choose.",
    category: "products"
  },
  {
    id: 14,
    question: "Are your products suitable for vegetarians/vegans?",
    answer: "Yes, we offer a wide range of vegetarian and vegan products. Each product page clearly indicates if it's vegetarian or vegan-friendly. Look for the green dot symbol for vegetarian products.",
    category: "products"
  },
  {
    id: 15,
    question: "Do you provide nutritional information?",
    answer: "Yes, detailed nutritional information, ingredient lists, and usage instructions are provided on each product page. We also include allergen information and third-party lab test results where applicable.",
    category: "products"
  }
];

const categories = [
  { id: "all", name: "All Questions", icon: HelpCircle },
  { id: "general", name: "General", icon: Users },
  { id: "orders", name: "Orders & Payment", icon: CreditCard },
  { id: "shipping", name: "Shipping", icon: Truck },
  { id: "returns", name: "Returns", icon: Package },
  { id: "products", name: "Products", icon: Shield }
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [openItems, setOpenItems] = useState<number[]>([]);

  const filteredFAQs = activeCategory === "all" 
    ? faqData 
    : faqData.filter(item => item.category === activeCategory);

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600">
            Find answers to common questions about our products and services
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeCategory === category.id
                      ? "bg-green-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="bg-white rounded-lg shadow-lg">
          {filteredFAQs.map((item, index) => (
            <div key={item.id} className={`border-b border-gray-200 ${index === filteredFAQs.length - 1 ? "border-b-0" : ""}`}>
              <button
                onClick={() => toggleItem(item.id)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-900 pr-4">
                  {item.question}
                </h3>
                {openItems.includes(item.id) ? (
                  <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                )}
              </button>
              {openItems.includes(item.id) && (
                <div className="px-6 pb-4">
                  <p className="text-gray-700 leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-green-800 mb-4">
            Still have questions?
          </h2>
          <p className="text-green-700 mb-6">
            Our customer support team is here to help you with any additional questions or concerns.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Contact Support
            </a>
            <a
              href="mailto:support@bbn.com"
              className="bg-white text-green-600 border border-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
            >
              Email Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}