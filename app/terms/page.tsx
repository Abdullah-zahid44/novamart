import { getSettings } from '@/lib/store';

export const metadata = {
  title: 'Terms of service — NovaMart',
  description: 'The terms governing your use of the NovaMart store.',
};

export default function TermsPage() {
  const { supportEmail, storeName } = getSettings();

  const sections = [
    {
      h: 'Using the store',
      p: 'By using NovaMart you agree to these terms. You must be at least 18 years old (or have a parent or guardian place orders for you), and you agree to provide accurate information at checkout. We may refuse or cancel orders suspected of fraud.',
    },
    {
      h: 'Products and pricing',
      p: 'We work hard to keep product descriptions, images and prices accurate, but errors happen. If a price is clearly wrong, we will contact you before shipping — you can always cancel for a full refund. Product images are representative; minor variations in color or packaging may occur.',
    },
    {
      h: 'Orders and payment',
      p: 'Your order is confirmed when you receive a confirmation email. Payment is collected at checkout through our secure payment providers. We reserve the right to cancel orders due to stock errors, suspected fraud or delivery restrictions, with a full refund.',
    },
    {
      h: 'Coupons and promotions',
      p: 'Discount codes are subject to minimum order values, expiry dates and usage limits shown with the code. Unless stated otherwise, only one coupon may be used per order, and codes cannot be combined with other offers or redeemed for cash.',
    },
    {
      h: 'Shipping, returns and warranties',
      p: 'Shipping times are estimates, not guarantees. Our 30-day return policy and manufacturer warranties are described on the Shipping & Returns page and in each product listing. Nothing here limits your statutory consumer rights.',
    },
    {
      h: 'Accounts',
      p: 'You are responsible for keeping your account credentials confidential and for all activity under your account. Tell us immediately if you suspect unauthorized access and we will help secure it.',
    },
    {
      h: 'Acceptable use',
      p: 'Do not misuse the store: no scraping at abusive rates, no attempts to breach security, no fraudulent orders or reviews. We may suspend accounts that violate these rules.',
    },
    {
      h: 'Limitation of liability',
      p: 'To the maximum extent permitted by law, our liability for any claim arising from your use of the store is limited to the amount you paid for the order in question. We are not liable for indirect or consequential losses.',
    },
    {
      h: 'Changes to these terms',
      p: 'We may update these terms as the store evolves. Material changes will be announced on this page with a new "last updated" date; continued use of the store after changes take effect means you accept them.',
    },
    {
      h: 'Contact',
      p: `Questions about these terms? Reach us at ${supportEmail}. These terms are governed by the laws of the State of Texas, USA.`,
    },
  ];

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <p className="text-xs font-bold tracking-widest text-indigo-600 uppercase">
        Legal
      </p>
      <h1 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
        Terms of service
      </h1>
      <p className="mt-3 text-sm text-slate-500">
        Last updated: September 21, 2026 · {storeName}
      </p>
      <div className="mt-8 space-y-8">
        {sections.map((s) => (
          <section key={s.h}>
            <h2 className="text-lg font-bold text-slate-900">{s.h}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.p}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
