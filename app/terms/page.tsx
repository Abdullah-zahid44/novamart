import { EditorialHeader, QuoteBlock } from '@/components/home/EditorialHeader';
import { Reveal } from '@/components/ui';

export const metadata = {
  title: 'Terms of Service — NovaMart',
  description: 'The terms governing your use of the NovaMart store.',
};

const SECTIONS = [
  {
    title: 'The demo bit, up front',
    body: 'NovaMart is a demonstration storefront. Checkout is a demo flow — the payment step is labeled as such and no card is ever charged. Carts, orders, accounts and admin edits are stored in your browser only. Nothing here is really for sale, which makes these terms refreshingly low-stakes.',
  },
  {
    title: 'Orders and pricing',
    body: 'Prices are shown in USD and are honest at the time you see them. If a price is obviously wrong (a television for the price of a sandwich), we reserve the right to cancel and refund. Stock counts update live; if something sells out mid-checkout, we will tell you before you pay — which, again, you never actually do here.',
  },
  {
    title: 'Shipping and returns',
    body: 'The shipping speeds and 30-day return policy described on the Shipping page reflect how the real store would operate. In this demo, no parcels exist and therefore none are late.',
  },
  {
    title: 'Acceptable use',
    body: 'Use the store like a reasonable person: no scraping at abusive rates, no probing for vulnerabilities, no pretending to be someone else. The admin demo login is there to explore, not to break.',
  },
  {
    title: 'Changes',
    body: 'We may update these terms as the store evolves. Material changes will be noted here with a new date. Continued use of the store means you are fine with that.',
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
      <EditorialHeader
        kicker="Terms"
        title="The rules, plainly."
        lede="Written by a human, in sentences a human can parse. If anything here surprises you, we have failed."
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
          quote="If a term needs a lawyer to understand, it shouldn't be a term."
          cite="Our drafting philosophy"
        />
        <Reveal>
          <p className="text-sm text-muted">Last updated September 2026. Questions: support@novamart.com.</p>
        </Reveal>
      </div>
    </div>
  );
}
