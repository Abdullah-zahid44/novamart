import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Fraunces, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { CartShell } from '@/components/cart/CartShell';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ChromeGuard from '@/components/admin/ChromeGuard';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'NovaMart — The new general store',
  description:
    'Good goods, fairly priced. Electronics, home, fashion, beauty, sports and toys — shipped in 24 hours with 30-day returns.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-paper"
        >
          Skip to content
        </a>
        <CartShell>
          <ChromeGuard header={<Header />} footer={<Footer />}>
            {children}
          </ChromeGuard>
        </CartShell>
      </body>
    </html>
  );
}
