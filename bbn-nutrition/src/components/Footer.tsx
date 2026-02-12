'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="bg-white text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Company Info */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Image 
                src="/images/BBNLogo.png" 
                alt="BBN Logo" 
                width={32} 
                height={32} 
                className="object-contain"
              />
              <span className="text-lg font-bold text-black">Booster Box Nutrition</span>
            </div>
            <p className="text-gray-600 text-sm">
              Premium supplements for athletes and fitness enthusiasts. Quality you can trust.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="text-gray-600 hover:text-black transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="text-gray-600 hover:text-black transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="text-gray-600 hover:text-black transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="text-gray-600 hover:text-black transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-black">{t('footer.quickLinks')}</h3>
            <ul className="space-y-1.5">
              <li>
                <Link href="/shop" className="text-gray-600 hover:text-black transition-colors text-sm">
                  {t('footer.shopAll')}
                </Link>
              </li>
              <li>
                <Link href="/shop?category=protein" className="text-gray-600 hover:text-black transition-colors text-sm">
                  {t('footer.protein')}
                </Link>
              </li>
              <li>
                <Link href="/shop?category=pre-workout" className="text-gray-600 hover:text-black transition-colors text-sm">
                  {t('footer.preWorkout')}
                </Link>
              </li>
              <li>
                <Link href="/shop?category=vitamins" className="text-gray-600 hover:text-black transition-colors text-sm">
                  {t('footer.vitamins')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-black transition-colors text-sm">
                  {t('footer.aboutUs')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-black">{t('footer.customerService')}</h3>
            <ul className="space-y-1.5">
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-black transition-colors text-sm">
                  {t('footer.contactUs')}
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-gray-600 hover:text-black transition-colors text-sm">
                  {t('footer.shippingInfo')}
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-600 hover:text-black transition-colors text-sm">
                  {t('footer.returns')}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-600 hover:text-black transition-colors text-sm">
                  {t('footer.faq')}
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="text-gray-600 hover:text-black transition-colors text-sm">
                  {t('footer.sizeGuide')}
                </Link>
              </li>
              <li>
                <Link href="/login?admin=true" className="text-gray-600 hover:text-black transition-colors text-sm">
                  {t('footer.adminLogin')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-black">{t('footer.contactInfo')}</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-600" />
                <span className="text-gray-600 text-sm">
                  123 Fitness Street<br />
                  Gym City, GC 12345
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-600" />
                <span className="text-gray-600 text-sm">(555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-600" />
                <span className="text-gray-600 text-sm">support@bbn.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-300 mt-6 pt-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <div className="text-gray-600 text-xs">
              {t('footer.copyright')}
            </div>
            <div className="flex space-x-3 text-xs">
              <Link href="/privacy" className="text-gray-600 hover:text-black transition-colors">
                {t('footer.privacyPolicy')}
              </Link>
              <Link href="/terms" className="text-gray-600 hover:text-black transition-colors">
                {t('footer.termsOfService')}
              </Link>
              <Link href="/cookies" className="text-gray-600 hover:text-black transition-colors">
                {t('footer.cookiePolicy')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}