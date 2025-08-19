import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import dynamic from 'next/dynamic';
import ErrorBoundary from '@/components/ErrorBoundary';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { OrderProvider } from '@/contexts/OrderContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Toaster } from 'react-hot-toast';
import { NotificationProvider } from '@/components/ui/Notification';

const inter = Inter({ subsets: ['latin'] });

// Lazy load components for better performance
const Header = dynamic(() => import('@/components/Header'), {
  ssr: true
});

const Footer = dynamic(() => import('@/components/Footer'), {
  ssr: true
});

export const metadata: Metadata = {
  title: 'BBN Nutrition - Premium Supplements',
  description: 'Your trusted source for premium quality supplements and nutrition products.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <LanguageProvider>
            <NotificationProvider>
              <AuthProvider>
                <CartProvider>
                  <OrderProvider>
                    <div className="min-h-screen flex flex-col bg-white text-gray-900">
                      <Header />
                      <main className="flex-grow">
                        {children}
                      </main>
                      <Footer />
                    </div>
                    <Toaster 
                      position="top-right"
                      toastOptions={{
                        duration: 3000,
                        style: {
                          background: '#363636',
                          color: '#fff',
                        },
                        success: {
                          duration: 3000,
                          iconTheme: {
                            primary: '#10B981',
                            secondary: '#fff',
                          },
                        },
                        error: {
                          duration: 4000,
                          iconTheme: {
                            primary: '#EF4444',
                            secondary: '#fff',
                          },
                        },
                      }}
                    />
                  </OrderProvider>
                </CartProvider>
              </AuthProvider>
            </NotificationProvider>
          </LanguageProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
