'use client';

import { useState } from 'react';
import { Cookie, Shield, Settings, Info, Eye, BarChart3, Target } from 'lucide-react';

interface CookieCategory {
  id: string;
  name: string;
  icon: any;
  description: string;
  essential: boolean;
  cookies: {
    name: string;
    purpose: string;
    duration: string;
    provider: string;
  }[];
}

const cookieCategories: CookieCategory[] = [
  {
    id: 'essential',
    name: 'Essential Cookies',
    icon: Shield,
    description: 'These cookies are necessary for the website to function and cannot be switched off.',
    essential: true,
    cookies: [
      {
        name: 'session_id',
        purpose: 'Maintains your session while browsing the website',
        duration: 'Session',
        provider: 'BBN'
      },
      {
        name: 'cart_items',
        purpose: 'Stores items in your shopping cart',
        duration: '7 days',
        provider: 'BBN'
      },
      {
        name: 'auth_token',
        purpose: 'Keeps you logged in to your account',
        duration: '30 days',
        provider: 'BBN'
      }
    ]
  },
  {
    id: 'functional',
    name: 'Functional Cookies',
    icon: Settings,
    description: 'These cookies enable enhanced functionality and personalization.',
    essential: false,
    cookies: [
      {
        name: 'user_preferences',
        purpose: 'Remembers your site preferences and settings',
        duration: '1 year',
        provider: 'BBN'
      },
      {
        name: 'language_preference',
        purpose: 'Stores your preferred language setting',
        duration: '1 year',
        provider: 'BBN'
      },
      {
        name: 'theme_preference',
        purpose: 'Remembers your dark/light mode preference',
        duration: '1 year',
        provider: 'BBN'
      }
    ]
  },
  {
    id: 'analytics',
    name: 'Analytics Cookies',
    icon: BarChart3,
    description: 'These cookies help us understand how visitors interact with our website.',
    essential: false,
    cookies: [
      {
        name: '_ga',
        purpose: 'Distinguishes unique users and sessions',
        duration: '2 years',
        provider: 'Google Analytics'
      },
      {
        name: '_gid',
        purpose: 'Distinguishes unique users',
        duration: '24 hours',
        provider: 'Google Analytics'
      },
      {
        name: '_gat',
        purpose: 'Throttles request rate',
        duration: '1 minute',
        provider: 'Google Analytics'
      }
    ]
  },
  {
    id: 'marketing',
    name: 'Marketing Cookies',
    icon: Target,
    description: 'These cookies are used to deliver relevant advertisements and track campaign performance.',
    essential: false,
    cookies: [
      {
        name: '_fbp',
        purpose: 'Tracks visitors across websites for advertising',
        duration: '3 months',
        provider: 'Facebook'
      },
      {
        name: 'ads_preferences',
        purpose: 'Stores advertising preferences and targeting data',
        duration: '1 year',
        provider: 'BBN'
      }
    ]
  }
];

export default function CookiesPage() {
  const [cookiePreferences, setCookiePreferences] = useState<{[key: string]: boolean}>({
    essential: true,
    functional: true,
    analytics: true,
    marketing: false
  });

  const handlePreferenceChange = (categoryId: string, enabled: boolean) => {
    if (categoryId === 'essential') return; // Essential cookies cannot be disabled
    
    setCookiePreferences(prev => ({
      ...prev,
      [categoryId]: enabled
    }));
  };

  const savePreferences = () => {
    // In a real application, this would save preferences to localStorage or send to server
    localStorage.setItem('cookiePreferences', JSON.stringify(cookiePreferences));
    alert('Cookie preferences saved successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center">
            <Cookie className="w-8 h-8 mr-3" />
            Cookie Policy
          </h1>
          <p className="text-xl text-gray-600">
            Learn about how we use cookies to improve your experience
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What are Cookies?</h2>
          <p className="text-gray-700 mb-4">
            Cookies are small text files that are placed on your computer or mobile device when you visit our website. 
            They are widely used to make websites work more efficiently and provide information to website owners.
          </p>
          <p className="text-gray-700 mb-4">
            We use cookies to enhance your browsing experience, analyze site traffic, personalize content, 
            and serve targeted advertisements. This policy explains what cookies we use and why.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              <strong>Last Updated:</strong> December 2024
            </p>
          </div>
        </div>

        {/* Cookie Categories */}
        <div className="space-y-6">
          {cookieCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <div key={category.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <IconComponent className="w-6 h-6 text-green-600 mr-3" />
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                        <p className="text-gray-600 text-sm mt-1">{category.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {category.essential ? (
                        <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">
                          Always Active
                        </span>
                      ) : (
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={cookiePreferences[category.id]}
                            onChange={(e) => handlePreferenceChange(category.id, e.target.checked)}
                            className="sr-only"
                          />
                          <div className={`relative w-12 h-6 rounded-full transition-colors ${
                            cookiePreferences[category.id] ? 'bg-green-600' : 'bg-gray-300'
                          }`}>
                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              cookiePreferences[category.id] ? 'translate-x-6' : 'translate-x-0'
                            }`} />
                          </div>
                        </label>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 text-sm font-medium text-gray-500">Cookie Name</th>
                          <th className="text-left py-2 text-sm font-medium text-gray-500">Purpose</th>
                          <th className="text-left py-2 text-sm font-medium text-gray-500">Duration</th>
                          <th className="text-left py-2 text-sm font-medium text-gray-500">Provider</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {category.cookies.map((cookie, index) => (
                          <tr key={index}>
                            <td className="py-3 text-sm font-medium text-gray-900">{cookie.name}</td>
                            <td className="py-3 text-sm text-gray-700">{cookie.purpose}</td>
                            <td className="py-3 text-sm text-gray-700">{cookie.duration}</td>
                            <td className="py-3 text-sm text-gray-700">{cookie.provider}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Cookie Management */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Managing Your Cookie Preferences</h2>
          <p className="text-gray-700 mb-6">
            You can control and manage cookies in various ways. Please note that removing or blocking cookies 
            may impact your user experience and parts of our website may no longer be fully accessible.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Browser Settings
              </h3>
              <p className="text-sm text-gray-600">
                Most browsers allow you to control cookies through their settings. You can set your browser 
                to refuse cookies or delete certain cookies.
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                Third-Party Tools
              </h3>
              <p className="text-sm text-gray-600">
                You can opt out of third-party cookies through industry tools like the Digital Advertising 
                Alliance&apos;s opt-out page or Network Advertising Initiative.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={savePreferences}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Save Preferences
            </button>
            <button
              onClick={() => setCookiePreferences({
                essential: true,
                functional: false,
                analytics: false,
                marketing: false
              })}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Accept Essential Only
            </button>
            <button
              onClick={() => setCookiePreferences({
                essential: true,
                functional: true,
                analytics: true,
                marketing: true
              })}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Accept All
            </button>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-green-800 mb-4">Questions About Our Cookie Policy?</h2>
          <p className="text-green-700 mb-6">
            If you have any questions about our use of cookies or this policy, please contact us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Contact Us
            </a>
            <a
              href="mailto:privacy@bbn.com"
              className="bg-white text-green-600 border border-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
            >
              Email Privacy Team
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}