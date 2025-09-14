'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import AdminProtectedRoute from '@/components/AdminProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  ArrowLeft,
  Save,
  Settings,
  Globe,
  Mail,
  Bell,
  Shield,
  Database,
  Palette,
  Truck,
  CreditCard,
  Users,
  Package
} from 'lucide-react';
import Link from 'next/link';

interface SettingsData {
  // General Settings
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  adminEmail: string;
  supportEmail: string;
  
  // Business Settings
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  
  // E-commerce Settings
  currency: string;
  taxRate: number;
  freeShippingThreshold: number;
  shippingFee: number;
  
  // Email Settings
  emailNotifications: boolean;
  orderConfirmationEmails: boolean;
  marketingEmails: boolean;
  
  // Security Settings
  requireEmailVerification: boolean;
  passwordMinLength: number;
  sessionTimeout: number;
  
  // Appearance Settings
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  faviconUrl: string;
}

export default function AdminSettingsPage() {
  const { user, isAuthenticated } = useAuth();
  const { colors, updateColors, resetToDefault } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  
  const [settings, setSettings] = useState<SettingsData>({
    // General Settings
    siteName: 'BBN Nutrition',
    siteDescription: 'Premium supplements for fitness enthusiasts',
    siteUrl: 'https://bbn-nutrition.com',
    adminEmail: 'admin@bbn-nutrition.com',
    supportEmail: 'support@bbn-nutrition.com',
    
    // Business Settings
    businessName: 'BBN Nutrition Private Limited',
    businessAddress: '123 Business Street, Mumbai, Maharashtra 400001, India',
    businessPhone: '+91 9876543210',
    businessEmail: 'business@bbn-nutrition.com',
    
    // E-commerce Settings
    currency: 'INR',
    taxRate: 18,
    freeShippingThreshold: 2999,
    shippingFee: 199,
    
    // Email Settings
    emailNotifications: true,
    orderConfirmationEmails: true,
    marketingEmails: false,
    
    // Security Settings
    requireEmailVerification: true,
    passwordMinLength: 8,
    sessionTimeout: 24,
    
    // Appearance Settings
    primaryColor: colors.primaryColor,
    secondaryColor: colors.secondaryColor,
    logoUrl: '/images/logo.png',
    faviconUrl: '/favicon.ico'
  });

  // Sync settings with theme colors
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      primaryColor: colors.primaryColor,
      secondaryColor: colors.secondaryColor
    }));
  }, [colors]);

  // Redirect if not admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <AdminProtectedRoute>
        <div className="min-h-screen bg-dark-bg flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-dark-text mb-4">Access Denied</h1>
            <p className="text-dark-text-secondary mb-6">You don&apos;t have permission to access the admin settings.</p>
            <Link href="/" className="text-primary hover:underline">Go to Homepage</Link>
          </div>
        </div>
      </AdminProtectedRoute>
    );
  }

  const handleInputChange = (field: keyof SettingsData, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleColorChange = (colorType: string, color: string) => {
    // Update settings state
    setSettings(prev => ({
      ...prev,
      [colorType]: color
    }));
    
    // Update theme context
    if (colorType === 'primaryColor') {
      updateColors({ primaryColor: color });
    } else if (colorType === 'secondaryColor') {
      updateColors({ secondaryColor: color });
    }
  };

  const handleResetTheme = () => {
    resetToDefault();
    setSaveMessage('Theme reset to default colors!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      // Save theme colors
      updateColors({
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor
      });
      
      // Simulate API call for other settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'business', name: 'Business', icon: Package },
    { id: 'ecommerce', name: 'E-commerce', icon: CreditCard },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'appearance', name: 'Appearance', icon: Palette }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-dark-text mb-2">Site Name</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => handleInputChange('siteName', e.target.value)}
                className="w-full px-4 py-2 bg-dark-gray border border-gray-600 rounded-lg text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-text mb-2">Site Description</label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-dark-gray border border-gray-600 rounded-lg text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-text mb-2">Site URL</label>
              <input
                type="url"
                value={settings.siteUrl}
                onChange={(e) => handleInputChange('siteUrl', e.target.value)}
                className="w-full px-4 py-2 bg-dark-gray border border-gray-600 rounded-lg text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">Admin Email</label>
                <input
                  type="email"
                  value={settings.adminEmail}
                  onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                  className="w-full px-4 py-2 bg-dark-gray border border-gray-600 rounded-lg text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">Support Email</label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => handleInputChange('supportEmail', e.target.value)}
                  className="w-full px-4 py-2 bg-dark-gray border border-gray-600 rounded-lg text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      case 'business':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-dark-text mb-2">Business Name</label>
              <input
                type="text"
                value={settings.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                className="w-full px-4 py-2 bg-dark-gray border border-gray-600 rounded-lg text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-text mb-2">Business Address</label>
              <textarea
                value={settings.businessAddress}
                onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-dark-gray border border-gray-600 rounded-lg text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">Business Phone</label>
                <input
                  type="tel"
                  value={settings.businessPhone}
                  onChange={(e) => handleInputChange('businessPhone', e.target.value)}
                  className="w-full px-4 py-2 bg-dark-gray border border-gray-600 rounded-lg text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">Business Email</label>
                <input
                  type="email"
                  value={settings.businessEmail}
                  onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                  className="w-full px-4 py-2 bg-dark-gray border border-gray-600 rounded-lg text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      case 'ecommerce':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="w-full px-4 py-2 bg-dark-gray border border-gray-600 rounded-lg text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="INR">Indian Rupee (₹)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">Tax Rate (%)</label>
                <input
                  type="number"
                  value={settings.taxRate}
                  onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value))}
                  className="w-full px-4 py-2 bg-dark-gray border border-gray-600 rounded-lg text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">Free Shipping Threshold (₹)</label>
                <input
                  type="number"
                  value={settings.freeShippingThreshold}
                  onChange={(e) => handleInputChange('freeShippingThreshold', parseFloat(e.target.value))}
                  className="w-full px-4 py-2 bg-dark-gray border border-gray-600 rounded-lg text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">Shipping Fee (₹)</label>
                <input
                  type="number"
                  value={settings.shippingFee}
                  onChange={(e) => handleInputChange('shippingFee', parseFloat(e.target.value))}
                  className="w-full px-4 py-2 bg-dark-gray border border-gray-600 rounded-lg text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                  min="0"
                />
              </div>
            </div>
          </div>
        );

      case 'email':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-dark-text">Email Notifications</h4>
                  <p className="text-sm text-dark-text-secondary">Send email notifications for system events</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-dark-text">Order Confirmation Emails</h4>
                  <p className="text-sm text-dark-text-secondary">Send confirmation emails for new orders</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.orderConfirmationEmails}
                    onChange={(e) => handleInputChange('orderConfirmationEmails', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-dark-text">Marketing Emails</h4>
                  <p className="text-sm text-dark-text-secondary">Send promotional and marketing emails</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.marketingEmails}
                    onChange={(e) => handleInputChange('marketingEmails', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-dark-text">Require Email Verification</h4>
                <p className="text-sm text-dark-text-secondary">Users must verify their email before accessing the account</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.requireEmailVerification}
                  onChange={(e) => handleInputChange('requireEmailVerification', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">Minimum Password Length</label>
                <input
                  type="number"
                  value={settings.passwordMinLength}
                  onChange={(e) => handleInputChange('passwordMinLength', parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-dark-gray border border-gray-600 rounded-lg text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                  min="6"
                  max="20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">Session Timeout (hours)</label>
                <input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-dark-gray border border-gray-600 rounded-lg text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                  min="1"
                  max="168"
                />
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-8">
            {/* Theme Control Header */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Website Theme Control</h3>
                  <p className="text-sm text-gray-600">Customize your website&apos;s appearance and branding</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleResetTheme}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Reset to Default
                  </button>
                  <button
                    onClick={() => setPreviewMode(!previewMode)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      previewMode 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'border border-green-600 text-green-600 hover:bg-green-50'
                    }`}
                  >
                    {previewMode ? 'Exit Preview' : 'Live Preview'}
                  </button>
                </div>
              </div>
            </div>

            {/* Brand Colors */}
             <div className="bg-white rounded-lg border border-gray-200 p-6">
               <h4 className="text-md font-semibold text-gray-900 mb-6">Brand Colors</h4>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {/* Primary Brand Color */}
                 <div className="space-y-3">
                   <label className="block text-sm font-medium text-gray-700">Primary Brand Color</label>
                   <div className="flex items-center space-x-3">
                     <div className="relative">
                       <input
                         type="color"
                         value={settings.primaryColor}
                         onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                         className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer shadow-sm"
                       />
                       <div 
                         className="absolute inset-0 rounded-lg border-2 border-gray-300 pointer-events-none"
                         style={{ backgroundColor: settings.primaryColor }}
                       ></div>
                     </div>
                     <input
                       type="text"
                       value={settings.primaryColor}
                       onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                       className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                       placeholder="#38a169"
                     />
                   </div>
                   <p className="text-xs text-gray-500">Main buttons, CTAs, and primary actions</p>
                 </div>

                 {/* Secondary Brand Color */}
                 <div className="space-y-3">
                   <label className="block text-sm font-medium text-gray-700">Secondary Brand Color</label>
                   <div className="flex items-center space-x-3">
                     <div className="relative">
                       <input
                         type="color"
                         value={settings.secondaryColor}
                         onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                         className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer shadow-sm"
                       />
                       <div 
                         className="absolute inset-0 rounded-lg border-2 border-gray-300 pointer-events-none"
                         style={{ backgroundColor: settings.secondaryColor }}
                       ></div>
                     </div>
                     <input
                       type="text"
                       value={settings.secondaryColor}
                       onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                       className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                       placeholder="#2f855a"
                     />
                   </div>
                   <p className="text-xs text-gray-500">Button hover states and secondary actions</p>
                 </div>

                 {/* Accent Color */}
                 <div className="space-y-3">
                   <label className="block text-sm font-medium text-gray-700">Accent Color</label>
                   <div className="flex items-center space-x-3">
                     <div className="relative">
                       <input
                         type="color"
                         value={colors.accentColor}
                         onChange={(e) => updateColors({ accentColor: e.target.value })}
                         className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer shadow-sm"
                       />
                       <div 
                         className="absolute inset-0 rounded-lg border-2 border-gray-300 pointer-events-none"
                         style={{ backgroundColor: colors.accentColor }}
                       ></div>
                     </div>
                     <input
                       type="text"
                       value={colors.accentColor}
                       onChange={(e) => updateColors({ accentColor: e.target.value })}
                       className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                       placeholder="#ed8936"
                     />
                   </div>
                   <p className="text-xs text-gray-500">Badges, highlights, and special elements</p>
                 </div>
               </div>
             </div>

             {/* Background Colors */}
             <div className="bg-white rounded-lg border border-gray-200 p-6">
               <h4 className="text-md font-semibold text-gray-900 mb-6">Background Colors</h4>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {/* Page Background */}
                 <div className="space-y-3">
                   <label className="block text-sm font-medium text-gray-700">Page Background</label>
                   <div className="flex items-center space-x-3">
                     <div className="relative">
                       <input
                         type="color"
                         value={colors.backgroundColor}
                         onChange={(e) => updateColors({ backgroundColor: e.target.value })}
                         className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer shadow-sm"
                       />
                       <div 
                         className="absolute inset-0 rounded-lg border-2 border-gray-300 pointer-events-none"
                         style={{ backgroundColor: colors.backgroundColor }}
                       ></div>
                     </div>
                     <input
                       type="text"
                       value={colors.backgroundColor}
                       onChange={(e) => updateColors({ backgroundColor: e.target.value })}
                       className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                       placeholder="#ffffff"
                     />
                   </div>
                   <p className="text-xs text-gray-500">Main website background</p>
                 </div>

                 {/* Card Background */}
                 <div className="space-y-3">
                   <label className="block text-sm font-medium text-gray-700">Card Background</label>
                   <div className="flex items-center space-x-3">
                     <div className="relative">
                       <input
                         type="color"
                         value={colors.cardBackground}
                         onChange={(e) => updateColors({ cardBackground: e.target.value })}
                         className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer shadow-sm"
                       />
                       <div 
                         className="absolute inset-0 rounded-lg border-2 border-gray-300 pointer-events-none"
                         style={{ backgroundColor: colors.cardBackground }}
                       ></div>
                     </div>
                     <input
                       type="text"
                       value={colors.cardBackground}
                       onChange={(e) => updateColors({ cardBackground: e.target.value })}
                       className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                       placeholder="#ffffff"
                     />
                   </div>
                   <p className="text-xs text-gray-500">Product cards and containers</p>
                 </div>

                 {/* Header Background */}
                 <div className="space-y-3">
                   <label className="block text-sm font-medium text-gray-700">Header Background</label>
                   <div className="flex items-center space-x-3">
                     <div className="relative">
                       <input
                         type="color"
                         value={colors.headerBackground}
                         onChange={(e) => updateColors({ headerBackground: e.target.value })}
                         className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer shadow-sm"
                       />
                       <div 
                         className="absolute inset-0 rounded-lg border-2 border-gray-300 pointer-events-none"
                         style={{ backgroundColor: colors.headerBackground }}
                       ></div>
                     </div>
                     <input
                       type="text"
                       value={colors.headerBackground}
                       onChange={(e) => updateColors({ headerBackground: e.target.value })}
                       className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                       placeholder="#ffffff"
                     />
                   </div>
                   <p className="text-xs text-gray-500">Top navigation bar</p>
                 </div>

                 {/* Footer Background */}
                 <div className="space-y-3">
                   <label className="block text-sm font-medium text-gray-700">Footer Background</label>
                   <div className="flex items-center space-x-3">
                     <div className="relative">
                       <input
                         type="color"
                         value={colors.footerBackground}
                         onChange={(e) => updateColors({ footerBackground: e.target.value })}
                         className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer shadow-sm"
                       />
                       <div 
                         className="absolute inset-0 rounded-lg border-2 border-gray-300 pointer-events-none"
                         style={{ backgroundColor: colors.footerBackground }}
                       ></div>
                     </div>
                     <input
                       type="text"
                       value={colors.footerBackground}
                       onChange={(e) => updateColors({ footerBackground: e.target.value })}
                       className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                       placeholder="#f7fafc"
                     />
                   </div>
                   <p className="text-xs text-gray-500">Bottom footer section</p>
                 </div>
               </div>
             </div>

             {/* Text Colors */}
             <div className="bg-white rounded-lg border border-gray-200 p-6">
               <h4 className="text-md font-semibold text-gray-900 mb-6">Text Colors</h4>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {/* Primary Text */}
                 <div className="space-y-3">
                   <label className="block text-sm font-medium text-gray-700">Primary Text</label>
                   <div className="flex items-center space-x-3">
                     <div className="relative">
                       <input
                         type="color"
                         value={colors.textColor}
                         onChange={(e) => updateColors({ textColor: e.target.value })}
                         className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer shadow-sm"
                       />
                       <div 
                         className="absolute inset-0 rounded-lg border-2 border-gray-300 pointer-events-none"
                         style={{ backgroundColor: colors.textColor }}
                       ></div>
                     </div>
                     <input
                       type="text"
                       value={colors.textColor}
                       onChange={(e) => updateColors({ textColor: e.target.value })}
                       className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                       placeholder="#2d3748"
                     />
                   </div>
                   <p className="text-xs text-gray-500">Main headings and content</p>
                 </div>

                 {/* Secondary Text */}
                 <div className="space-y-3">
                   <label className="block text-sm font-medium text-gray-700">Secondary Text</label>
                   <div className="flex items-center space-x-3">
                     <div className="relative">
                       <input
                         type="color"
                         value={colors.textSecondary}
                         onChange={(e) => updateColors({ textSecondary: e.target.value })}
                         className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer shadow-sm"
                       />
                       <div 
                         className="absolute inset-0 rounded-lg border-2 border-gray-300 pointer-events-none"
                         style={{ backgroundColor: colors.textSecondary }}
                       ></div>
                     </div>
                     <input
                       type="text"
                       value={colors.textSecondary}
                       onChange={(e) => updateColors({ textSecondary: e.target.value })}
                       className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                       placeholder="#718096"
                     />
                   </div>
                   <p className="text-xs text-gray-500">Descriptions and subtitles</p>
                 </div>

                 {/* Muted Text */}
                 <div className="space-y-3">
                   <label className="block text-sm font-medium text-gray-700">Muted Text</label>
                   <div className="flex items-center space-x-3">
                     <div className="relative">
                       <input
                         type="color"
                         value={colors.textMuted}
                         onChange={(e) => updateColors({ textMuted: e.target.value })}
                         className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer shadow-sm"
                       />
                       <div 
                         className="absolute inset-0 rounded-lg border-2 border-gray-300 pointer-events-none"
                         style={{ backgroundColor: colors.textMuted }}
                       ></div>
                     </div>
                     <input
                       type="text"
                       value={colors.textMuted}
                       onChange={(e) => updateColors({ textMuted: e.target.value })}
                       className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                       placeholder="#a0aec0"
                     />
                   </div>
                   <p className="text-xs text-gray-500">Placeholders and hints</p>
                 </div>

                 {/* Link Color */}
                 <div className="space-y-3">
                   <label className="block text-sm font-medium text-gray-700">Link Color</label>
                   <div className="flex items-center space-x-3">
                     <div className="relative">
                       <input
                         type="color"
                         value={colors.linkColor}
                         onChange={(e) => updateColors({ linkColor: e.target.value })}
                         className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer shadow-sm"
                       />
                       <div 
                         className="absolute inset-0 rounded-lg border-2 border-gray-300 pointer-events-none"
                         style={{ backgroundColor: colors.linkColor }}
                       ></div>
                     </div>
                     <input
                       type="text"
                       value={colors.linkColor}
                       onChange={(e) => updateColors({ linkColor: e.target.value })}
                       className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                       placeholder="#38a169"
                     />
                   </div>
                   <p className="text-xs text-gray-500">Text links and navigation</p>
                 </div>
               </div>
             </div>

             {/* Form Colors */}
             <div className="bg-white rounded-lg border border-gray-200 p-6">
               <h4 className="text-md font-semibold text-gray-900 mb-6">Form & Input Colors</h4>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {/* Input Background */}
                 <div className="space-y-3">
                   <label className="block text-sm font-medium text-gray-700">Input Background</label>
                   <div className="flex items-center space-x-3">
                     <div className="relative">
                       <input
                         type="color"
                         value={colors.inputBackground}
                         onChange={(e) => updateColors({ inputBackground: e.target.value })}
                         className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer shadow-sm"
                       />
                       <div 
                         className="absolute inset-0 rounded-lg border-2 border-gray-300 pointer-events-none"
                         style={{ backgroundColor: colors.inputBackground }}
                       ></div>
                     </div>
                     <input
                       type="text"
                       value={colors.inputBackground}
                       onChange={(e) => updateColors({ inputBackground: e.target.value })}
                       className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                       placeholder="#ffffff"
                     />
                   </div>
                   <p className="text-xs text-gray-500">Form field backgrounds</p>
                 </div>

                 {/* Input Border */}
                 <div className="space-y-3">
                   <label className="block text-sm font-medium text-gray-700">Input Border</label>
                   <div className="flex items-center space-x-3">
                     <div className="relative">
                       <input
                         type="color"
                         value={colors.inputBorder}
                         onChange={(e) => updateColors({ inputBorder: e.target.value })}
                         className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer shadow-sm"
                       />
                       <div 
                         className="absolute inset-0 rounded-lg border-2 border-gray-300 pointer-events-none"
                         style={{ backgroundColor: colors.inputBorder }}
                       ></div>
                     </div>
                     <input
                       type="text"
                       value={colors.inputBorder}
                       onChange={(e) => updateColors({ inputBorder: e.target.value })}
                       className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                       placeholder="#e2e8f0"
                     />
                   </div>
                   <p className="text-xs text-gray-500">Form field borders</p>
                 </div>

                 {/* Input Focus */}
                 <div className="space-y-3">
                   <label className="block text-sm font-medium text-gray-700">Input Focus</label>
                   <div className="flex items-center space-x-3">
                     <div className="relative">
                       <input
                         type="color"
                         value={colors.inputFocus}
                         onChange={(e) => updateColors({ inputFocus: e.target.value })}
                         className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer shadow-sm"
                       />
                       <div 
                         className="absolute inset-0 rounded-lg border-2 border-gray-300 pointer-events-none"
                         style={{ backgroundColor: colors.inputFocus }}
                       ></div>
                     </div>
                     <input
                       type="text"
                       value={colors.inputFocus}
                       onChange={(e) => updateColors({ inputFocus: e.target.value })}
                       className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                       placeholder="#38a169"
                     />
                   </div>
                   <p className="text-xs text-gray-500">Form field focus highlight</p>
                 </div>

                 {/* Input Text */}
                 <div className="space-y-3">
                   <label className="block text-sm font-medium text-gray-700">Input Text</label>
                   <div className="flex items-center space-x-3">
                     <div className="relative">
                       <input
                         type="color"
                         value={colors.inputText}
                         onChange={(e) => updateColors({ inputText: e.target.value })}
                         className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer shadow-sm"
                       />
                       <div 
                         className="absolute inset-0 rounded-lg border-2 border-gray-300 pointer-events-none"
                         style={{ backgroundColor: colors.inputText }}
                       ></div>
                     </div>
                     <input
                       type="text"
                       value={colors.inputText}
                       onChange={(e) => updateColors({ inputText: e.target.value })}
                       className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                       placeholder="#2d3748"
                     />
                   </div>
                   <p className="text-xs text-gray-500">Text inside form fields</p>
                 </div>
               </div>
             </div>

             {/* UI Element Colors */}
             <div className="bg-white rounded-lg border border-gray-200 p-6">
               <h4 className="text-md font-semibold text-gray-900 mb-6">UI Element Colors</h4>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {/* Border Color */}
                 <div className="space-y-3">
                   <label className="block text-sm font-medium text-gray-700">Border Color</label>
                   <div className="flex items-center space-x-3">
                     <div className="relative">
                       <input
                         type="color"
                         value={colors.borderColor}
                         onChange={(e) => updateColors({ borderColor: e.target.value })}
                         className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer shadow-sm"
                       />
                       <div 
                         className="absolute inset-0 rounded-lg border-2 border-gray-300 pointer-events-none"
                         style={{ backgroundColor: colors.borderColor }}
                       ></div>
                     </div>
                     <input
                       type="text"
                       value={colors.borderColor}
                       onChange={(e) => updateColors({ borderColor: e.target.value })}
                       className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                       placeholder="#e2e8f0"
                     />
                   </div>
                   <p className="text-xs text-gray-500">General borders and dividers</p>
                 </div>

                 {/* Success Color */}
                 <div className="space-y-3">
                   <label className="block text-sm font-medium text-gray-700">Success Color</label>
                   <div className="flex items-center space-x-3">
                     <div className="relative">
                       <input
                         type="color"
                         value={colors.successColor}
                         onChange={(e) => updateColors({ successColor: e.target.value })}
                         className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer shadow-sm"
                       />
                       <div 
                         className="absolute inset-0 rounded-lg border-2 border-gray-300 pointer-events-none"
                         style={{ backgroundColor: colors.successColor }}
                       ></div>
                     </div>
                     <input
                       type="text"
                       value={colors.successColor}
                       onChange={(e) => updateColors({ successColor: e.target.value })}
                       className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                       placeholder="#48bb78"
                     />
                   </div>
                   <p className="text-xs text-gray-500">Success messages and indicators</p>
                 </div>

                 {/* Warning Color */}
                 <div className="space-y-3">
                   <label className="block text-sm font-medium text-gray-700">Warning Color</label>
                   <div className="flex items-center space-x-3">
                     <div className="relative">
                       <input
                         type="color"
                         value={colors.warningColor}
                         onChange={(e) => updateColors({ warningColor: e.target.value })}
                         className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer shadow-sm"
                       />
                       <div 
                         className="absolute inset-0 rounded-lg border-2 border-gray-300 pointer-events-none"
                         style={{ backgroundColor: colors.warningColor }}
                       ></div>
                     </div>
                     <input
                       type="text"
                       value={colors.warningColor}
                       onChange={(e) => updateColors({ warningColor: e.target.value })}
                       className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                       placeholder="#ed8936"
                     />
                   </div>
                   <p className="text-xs text-gray-500">Warning messages and alerts</p>
                 </div>

                 {/* Error Color */}
                 <div className="space-y-3">
                   <label className="block text-sm font-medium text-gray-700">Error Color</label>
                   <div className="flex items-center space-x-3">
                     <div className="relative">
                       <input
                         type="color"
                         value={colors.errorColor}
                         onChange={(e) => updateColors({ errorColor: e.target.value })}
                         className="w-12 h-12 border-2 border-gray-300 rounded-lg cursor-pointer shadow-sm"
                       />
                       <div 
                         className="absolute inset-0 rounded-lg border-2 border-gray-300 pointer-events-none"
                         style={{ backgroundColor: colors.errorColor }}
                       ></div>
                     </div>
                     <input
                       type="text"
                       value={colors.errorColor}
                       onChange={(e) => updateColors({ errorColor: e.target.value })}
                       className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                       placeholder="#f56565"
                     />
                   </div>
                   <p className="text-xs text-gray-500">Error messages and validation</p>
                 </div>
               </div>
             </div>

            {/* Live Preview */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Live Preview</h4>
              <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                <div className="space-y-4">
                  {/* Sample Header */}
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                    <h5 className="font-semibold text-gray-900">BBN Nutrition</h5>
                    <div className="flex space-x-2">
                      <button 
                        className="px-4 py-2 rounded-lg text-white font-medium transition-colors"
                        style={{ backgroundColor: settings.primaryColor }}
                      >
                        Shop Now
                      </button>
                      <button 
                        className="px-4 py-2 rounded-lg text-white font-medium transition-colors"
                        style={{ backgroundColor: settings.secondaryColor }}
                      >
                        Learn More
                      </button>
                    </div>
                  </div>
                  
                  {/* Sample Product Card */}
                  <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="h-32 bg-gray-200 rounded-lg mb-3"></div>
                    <h6 className="font-medium text-gray-900 mb-2">Sample Product</h6>
                    <p className="text-gray-600 text-sm mb-3">Premium quality supplement for fitness enthusiasts</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">₹2,999</span>
                      <button 
                        className="px-3 py-1 rounded text-white text-sm font-medium"
                        style={{ backgroundColor: settings.primaryColor }}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Branding Assets */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h4 className="text-md font-semibold text-gray-900 mb-6">Branding Assets</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
                  <input
                    type="url"
                    value={settings.logoUrl}
                    onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="https://example.com/logo.png"
                  />
                  <p className="text-xs text-gray-500 mt-1">URL to your website logo</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Favicon URL</label>
                  <input
                    type="url"
                    value={settings.faviconUrl}
                    onChange={(e) => handleInputChange('faviconUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="https://example.com/favicon.ico"
                  />
                  <p className="text-xs text-gray-500 mt-1">URL to your website favicon</p>
                </div>
              </div>
            </div>

            {/* Quick Theme Presets */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h4 className="text-md font-semibold text-gray-900 mb-4">Quick Theme Presets</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => {
                    handleColorChange('primaryColor', '#38a169');
                    handleColorChange('secondaryColor', '#2f855a');
                    updateColors({ accentColor: '#ed8936' });
                  }}
                  className="p-4 border border-gray-200 rounded-lg hover:border-green-500 transition-colors"
                >
                  <div className="flex space-x-2 mb-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#38a169' }}></div>
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#2f855a' }}></div>
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ed8936' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Default Green</span>
                </button>
                
                <button
                  onClick={() => {
                    handleColorChange('primaryColor', '#3b82f6');
                    handleColorChange('secondaryColor', '#1d4ed8');
                    updateColors({ accentColor: '#f59e0b' });
                  }}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors"
                >
                  <div className="flex space-x-2 mb-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#1d4ed8' }}></div>
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Ocean Blue</span>
                </button>
                
                <button
                  onClick={() => {
                    handleColorChange('primaryColor', '#dc2626');
                    handleColorChange('secondaryColor', '#991b1b');
                    updateColors({ accentColor: '#ea580c' });
                  }}
                  className="p-4 border border-gray-200 rounded-lg hover:border-red-500 transition-colors"
                >
                  <div className="flex space-x-2 mb-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#dc2626' }}></div>
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#991b1b' }}></div>
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ea580c' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Energy Red</span>
                </button>
                
                <button
                  onClick={() => {
                    handleColorChange('primaryColor', '#7c3aed');
                    handleColorChange('secondaryColor', '#5b21b6');
                    updateColors({ accentColor: '#c026d3' });
                  }}
                  className="p-4 border border-gray-200 rounded-lg hover:border-purple-500 transition-colors"
                >
                  <div className="flex space-x-2 mb-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#7c3aed' }}></div>
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#5b21b6' }}></div>
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#c026d3' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Royal Purple</span>
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AdminProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin"
                className="p-2 rounded-lg bg-dark-card border border-gray-700 text-dark-text-secondary hover:text-dark-text transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-dark-text">Settings</h1>
                <p className="text-dark-text-secondary">Manage your application settings and configuration</p>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center space-x-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>

          {/* Save Message */}
          {saveMessage && (
            <div className={`p-4 rounded-lg ${saveMessage.includes('success') ? 'bg-green-900/20 border border-green-700 text-green-400' : 'bg-red-900/20 border border-red-700 text-red-400'}`}>
              {saveMessage}
            </div>
          )}

          {/* Settings Content */}
          <div className="bg-dark-card rounded-lg border border-gray-700 overflow-hidden">
            <div className="flex border-b border-gray-700">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-white border-b-2 border-primary'
                        : 'text-dark-text-secondary hover:text-dark-text hover:bg-dark-gray'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>
            <div className="p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </AdminLayout>
    </AdminProtectedRoute>
  );
}