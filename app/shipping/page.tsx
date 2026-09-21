import { PackageCheck, RotateCcw, Truck } from 'lucide-react';
import { EditorialHeader, QuoteBlock } from '@/components/home/EditorialHeader';
import { Reveal, Card } from '@/components/ui';
import { getSettings } from '@/lib/store';
import { currency } from '@/lib/format';

export const metadata = {
  title: 'Shipping & Returns — NovaMart',
  description: 'How fast we ship, what it costs, and how returns work at NovaMart.',
};

export default function ShippingPage() {
  const { shippingFlat, freeShipOver } = getSettings();

  const rates = [
    {
      icon: Truck,
      name: 'Standard',
      time: '3–5 business days',
      price: `${currency(shippingFlat)} — free over ${currency(freeShipOver)}`,
    },
    {
      icon: PackageCheck,
      name: 'Express',
      time: '1–2 business days',
      price: '$12.99',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
      <EditorialHeader
        kicker="Shipping & returns"
        title="Fast out, easy back."
        lede="Orders leave the packing room within 24 hours. If it is late, that is on us — and if you change your mind, sending it back is painless."
      />

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        {rates.map(({ icon: Icon, name, time, price }, i) => (
          <Reveal key={name} delay={i * 0.08}>
            <Card className="flex h-full items-start gap-5 p-7">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sand text-accent">
                <Icon size={22} aria-hidden />
              </span>
              <div>
                <h2 className="font-display text-xl font-semibold text-ink">{name}</h2>
                <p className="mt-1 text-sm text-muted">{time}</p>
                <p className="mt-2 font-semibold text-ink">{price}</p>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-12 max-w-3xl">
        <h2 className="font-display text-2xl font-semibold text-ink">Returns, the short version</h2>
        <div className="mt-4 space-y-4 leading-relaxed text-ink/85">
          <p>
            Thirty days from delivery, no questions asked. Start a return from your
            account or by emailing support — we send a prepaid label, you drop the box
            off, and the refund lands 2–3 business days after it arrives.
          </p>
          <p>
            Items should be unused and in their original packaging where possible.
            Damaged or wrong items are a different story: send us a photo and a
            replacement ships the same day, no return needed.
          </p>
        </div>
      </Reveal>

      <QuoteBlock
        className="mt-12 max-w-3xl"
        quote="If a parcel is late, we tell you before you have to ask. That's the job."
        cite="The packing room wall"
      />

      <Reveal className="mt-12 flex max-w-3xl items-start gap-4 rounded-[14px] border border-line bg-sand p-6">
        <RotateCcw size={20} className="mt-0.5 shrink-0 text-accent" aria-hidden />
        <p className="text-sm leading-relaxed text-ink/85">
          <span className="font-semibold text-ink">Demo note:</span> NovaMart is a demo
          storefront. Shipping options and returns described here illustrate the flow —
          no real parcels are harmed.
        </p>
      </Reveal>
    </div>
  );
}
