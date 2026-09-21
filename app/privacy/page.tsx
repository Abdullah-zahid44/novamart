import { EditorialHeader, QuoteBlock } from '@/components/home/EditorialHeader';
import { Reveal } from '@/components/ui';

export const metadata = {
  title: 'Privacy Policy — NovaMart',
  description: 'How NovaMart collects, uses and protects your personal information.',
};

const SECTIONS = [
  {
    title: 'What we collect',
    body: 'When you create an account, we store your name, email and password (hashed, never plain text). When you order, we keep the delivery address and order history so you can track parcels and we can help with returns. That is the whole list.',
  },
  {
    title: 'What we never do',
    body: 'We do not sell your data, rent your data, or share it with advertisers. We do not track you across other websites. Your inbox gets the Friday email only if you asked for it.',
  },
  {
    title: 'Cookies',
    body: 'We use the bare minimum: whatever your browser needs to keep you signed in and remember your cart. No third-party advertising cookies, no fingerprinting.',
  },
  {
    title: 'Your rights',
    body: 'Ask us for a copy of your data, correct it, or delete your account entirely — email support@novamart.com and it is done within five business days. No retention games.',
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
      <EditorialHeader
        kicker="Privacy"
        title="Your data stays yours."
        lede="Short version: we collect the minimum needed to run the shop, we never sell anything, and you can delete it all whenever you like."
      />
      <div className="mx-auto mt-12 max-w-3xl space-y-10">
        {SECTIONS.map((s, i) => (
          <Reveal key={s.title} delay={Math.min(i * 0.05, 0.2)}>
            <section>
              <h2 className="font-display text-2xl font-semibold text-ink">{s.title}</h2>
              <p className="mt-3 leading-relaxed text-ink/85">{s.body}</p>
            </section>
          </Reveal>
        ))}
        <QuoteBlock
          quote="This is a demo storefront: your account, cart and orders live in your own browser's local storage and never leave your device."
          cite="The fine print, honestly"
        />
        <Reveal>
          <p className="text-sm text-muted">Last updated September 2026. Questions: support@novamart.com.</p>
        </Reveal>
      </div>
    </div>
  );
}
