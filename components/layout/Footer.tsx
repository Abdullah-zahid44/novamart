import Link from 'next/link';
import { getCategories } from '@/lib/store';
import { NewsletterForm } from '@/components/home/NewsletterForm';

const COMPANY = [
  { href: '/about', label: 'Our story' },
  { href: '/contact', label: 'Contact' },
  { href: '/faq', label: 'FAQ' },
  { href: '/shipping', label: 'Shipping & returns' },
];

const SUPPORT = [
  { href: '/track', label: 'Track your order' },
  { href: '/deals', label: 'Deals' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
];

export default function Footer() {
  const categories = getCategories();

  return (
    <footer className="bg-forest text-paper">
      <div className="mx-auto max-w-7xl px-4 pt-16 sm:px-6">
        {/* Giant wordmark */}
        <p className="font-display text-[17vw] font-bold leading-[0.9] tracking-tight sm:text-[13vw] lg:text-[10.5rem]" aria-label="NovaMart">
          NovaMart<span className="text-accent">.</span>
        </p>
        <p className="mt-4 max-w-md text-paper/70">
          The new general store. Good goods, fairly priced — shipped in 24 hours.
        </p>

        <div className="mt-12 grid gap-10 border-t border-paper/15 pt-10 sm:grid-cols-2 lg:grid-cols-4">
          <nav aria-label="Shop categories">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-paper/50">Shop</p>
            <ul className="space-y-2.5">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link href={`/shop/${c.slug}`} className="text-sm text-paper/80 transition-colors hover:text-accent">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Company">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-paper/50">Company</p>
            <ul className="space-y-2.5">
              {COMPANY.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-paper/80 transition-colors hover:text-accent">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Support">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-paper/50">Support</p>
            <ul className="space-y-2.5">
              {SUPPORT.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-paper/80 transition-colors hover:text-accent">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-paper/50">
              First dibs, every Friday
            </p>
            <p className="mb-4 text-sm text-paper/70">
              New drops, restocks, and the occasional strong opinion. One email a week.
            </p>
            <NewsletterForm compact />
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-paper/15 py-6 text-xs text-paper/50 sm:flex-row sm:items-center">
          <p>© 2026 NovaMart. A demo storefront — nothing here is really for sale.</p>
          <p className="font-semibold tracking-[0.18em]" aria-label="Accepted payment marks">
            VISA&nbsp;&nbsp;·&nbsp;&nbsp;MASTERCARD&nbsp;&nbsp;·&nbsp;&nbsp;AMEX
          </p>
        </div>
      </div>
    </footer>
  );
}
