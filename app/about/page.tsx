import Link from 'next/link';
import { ArrowRight, BadgeDollarSign, ShieldCheck, Truck } from 'lucide-react';
import { EditorialHeader, QuoteBlock } from '@/components/home/EditorialHeader';
import { SmartImage } from '@/components/home/SmartImage';
import { Reveal, Button, Card } from '@/components/ui';

export const metadata = {
  title: 'Our Story — NovaMart',
  description: 'Why NovaMart exists: a short shelf of good things, honest prices, fast shipping.',
};

const VALUES = [
  {
    icon: BadgeDollarSign,
    title: 'Fair prices',
    body: 'We price things the way we would want to buy them. No games, no fake was-prices, no surge nonsense.',
  },
  {
    icon: Truck,
    title: 'Fast shipping',
    body: 'Orders leave the packing room within 24 hours. Tracking from door to door, always.',
  },
  {
    icon: ShieldCheck,
    title: 'No nonsense',
    body: 'Thirty-day returns, real humans on support, and a checkout that does not try to trick you.',
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
      <EditorialHeader
        kicker="Our story"
        title="The new general store."
        lede="NovaMart started with a simple complaint: buying decent basics online had become a chore. So we built the shop we wanted to use."
      />

      <div className="mt-14 grid items-center gap-10 lg:grid-cols-2">
        <Reveal>
          <SmartImage
            src="/images/story.jpg"
            alt="Inside the NovaMart packing room"
            label="The packing room, mid-Friday."
            sizes="(min-width: 1024px) 45vw, 90vw"
            className="aspect-[4/3] w-full rounded-[14px] border border-line"
          />
        </Reveal>
        <Reveal delay={0.1} className="max-w-prose space-y-5 leading-relaxed text-ink/85">
          <p>
            The old general store had it right: one trusted place, a short shelf of good
            things, and a keeper who knew what was worth stocking. Then shopping moved
            online and the shelf became infinite — endless tabs, mystery sellers, and
            prices that moved while you blinked.
          </p>
          <p>
            We are bringing the shelf back. Six aisles, each one edited like somebody
            cares — because somebody does. Every product on NovaMart is something we
            would buy ourselves, at a price we would pay without wincing.
          </p>
          <p>
            That is the whole strategy. It fits on an index card, and we check it
            every Friday before the new drops go live.
          </p>
        </Reveal>
      </div>

      <QuoteBlock
        className="mt-16"
        quote="We sell things we'd buy ourselves. That's the whole strategy."
        cite="The NovaMart rulebook, page one"
      />

      <div className="mt-16 grid gap-5 md:grid-cols-3">
        {VALUES.map(({ icon: Icon, title, body }, i) => (
          <Reveal key={title} delay={i * 0.08}>
            <Card className="h-full p-7">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-sand text-accent">
                <Icon size={20} aria-hidden />
              </span>
              <h2 className="mt-4 font-display text-xl font-semibold text-ink">{title}</h2>
              <p className="mt-2 leading-relaxed text-muted">{body}</p>
            </Card>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-16 text-center">
        <Link href="/shop">
          <Button size="lg">
            Shop the collection
            <ArrowRight size={18} aria-hidden />
          </Button>
        </Link>
      </Reveal>
    </div>
  );
}
