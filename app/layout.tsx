import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import './globals.css';
import { CartShell } from '@/components/cart/CartShell';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'NovaMart — Everything you love, delivered.',
  description:
    'NovaMart is your one-stop shop for electronics, home & kitchen, fashion, beauty, sports and toys — quality products at honest prices, delivered fast.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <CartShell>
          <Header />
          <main className="min-h-[60vh]">{children}</main>
          <Footer />
        </CartShell>
      </body>
    </html>
  );
}
