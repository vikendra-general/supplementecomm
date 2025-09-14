'use client';

import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

const Header = dynamic(() => import('@/components/Header'), {
  ssr: true
});

const Footer = dynamic(() => import('@/components/Footer'), {
  ssr: true
});

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  if (isAdminPage) {
    // For admin pages, render with Header but no Footer, and admin content fills remaining space
    return (
      <div className="min-h-screen flex flex-col bg-white text-gray-900">
        <Header />
        <div className="flex-grow">
          {children}
        </div>
      </div>
    );
  }

  // For regular pages, render with Header and Footer
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}