import { getSettings } from '@/lib/store';

export const metadata = {
  title: 'Privacy policy — NovaMart',
  description: 'How NovaMart collects, uses and protects your personal data.',
};

export default function PrivacyPage() {
  const { supportEmail, storeName } = getSettings();

  const sections = [
    {
      h: 'What we collect',
      p: 'When you shop with us we collect the information you provide: your name, email address, phone number, shipping address and payment details (processed securely — we never store full card numbers on our servers). If you create an account, we also store your order history, wishlist and preferences so the store works the way you expect.',
    },
    {
      h: 'How we use it',
      p: 'Your data is used to process and deliver your orders, provide customer support, prevent fraud, and — only if you opt in — send you deals and new-arrival emails. We analyze anonymized, aggregated usage data to improve the store. We do not sell your personal information to anyone, ever.',
    },
    {
      h: 'Cookies',
      p: 'We use essential cookies to keep you signed in and remember your cart, and optional analytics cookies to understand how the store is used. You can disable non-essential cookies in your browser; the store will still work, though some conveniences (like a remembered cart) may not.',
    },
    {
      h: 'Who we share it with',
      p: 'We share data only with the service providers required to run the store: payment processors, shipping carriers and fraud-prevention services. Each is contractually limited to using your data for that purpose. We will disclose information if required by law.',
    },
    {
      h: 'How long we keep it',
      p: 'Order records are kept for 7 years to meet tax and accounting obligations. Marketing data is kept until you unsubscribe. You can request a copy or deletion of your personal data at any time by emailing us.',
    },
    {
      h: 'Your rights',
      p: 'You have the right to access, correct, export or delete your personal data, and to opt out of marketing at any time. Contact us and we will respond within 30 days.',
    },
    {
      h: 'Security',
      p: 'Data is encrypted in transit (TLS) and at rest, access is limited to staff who need it, and payment processing is handled by PCI-DSS compliant providers. No system is perfect, but we take protecting your information seriously.',
    },
    {
      h: 'Contact',
      p: `Questions about this policy? Email us at ${supportEmail} and we will get back to you.`,
    },
  ];

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <p className="text-xs font-bold tracking-widest text-indigo-600 uppercase">
        Legal
      </p>
      <h1 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
        Privacy policy
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
