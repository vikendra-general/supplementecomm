'use client';

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent-2 rounded-lg flex items-center justify-center">
                <span className="text-secondary font-bold text-sm">BBN</span>
              </div>
              <span className="text-xl font-bold">Booster Box Nutrition</span>
            </div>
            <p className="text-gray-400 text-sm">
              Premium supplements for athletes and fitness enthusiasts. Quality you can trust.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('footer.quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/shop" className="text-gray-400 hover:text-white transition-colors">
                  {t('footer.shopAll')}
                </Link>
              </li>
              <li>
                <Link href="/shop?category=protein" className="text-gray-400 hover:text-white transition-colors">
                  {t('footer.protein')}
                </Link>
              </li>
              <li>
                <Link href="/shop?category=pre-workout" className="text-gray-400 hover:text-white transition-colors">
                  {t('footer.preWorkout')}
                </Link>
              </li>
              <li>
                <Link href="/shop?category=vitamins" className="text-gray-400 hover:text-white transition-colors">
                  {t('footer.vitamins')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  {t('footer.aboutUs')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('footer.customerService')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  {t('footer.contactUs')}
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-400 hover:text-white transition-colors">
                  {t('footer.shippingInfo')}
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-400 hover:text-white transition-colors">
                  {t('footer.returns')}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white transition-colors">
                  {t('footer.faq')}
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="text-gray-400 hover:text-white transition-colors">
                  {t('footer.sizeGuide')}
                </Link>
              </li>
              <li>
                <Link href="/login?admin=true" className="text-gray-400 hover:text-white transition-colors">
                  {t('footer.adminLogin')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('footer.contactInfo')}</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400 text-sm">
                  123 Fitness Street<br />
                  Gym City, GC 12345
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400 text-sm">(555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400 text-sm">support@bbn.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © 2024 Booster Box Nutrition. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}