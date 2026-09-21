'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { EditorialHeader } from '@/components/home/EditorialHeader';
import { QuoteBlock } from '@/components/home/EditorialHeader';
import { Reveal } from '@/components/ui';
import { cn } from '@/lib/cn';

const FAQS = [
  {
    q: 'How fast is shipping, really?',
    a: 'Orders leave our packing room within 24 hours. Standard takes 3–5 business days ($6.99, free over $75); express takes 1–2 business days ($12.99). Every parcel is tracked door to door.',
  },
  {
    q: 'What is your return policy?',
    a: 'Thirty days, no questions, prepaid label. If you changed your mind, that is reason enough. Refunds land within 2–3 business days of the return arriving.',
  },
  {
    q: 'How do I track my order?',
    a: 'Head to the Track page and enter your order number (it looks like NM-102341). You will see every step from confirmed to delivered.',
  },
  {
    q: 'Do you have discount codes?',
    a: 'New here? WELCOME10 takes 10% off orders over $50. We also run weekly deals every Friday — that is where the serious discounts live.',
  },
  {
    q: 'Is the checkout real? Will my card be charged?',
    a: 'No. NovaMart is a demo storefront — the payment step is clearly labeled as a demo and nothing is ever charged. Your cart, orders and account live in your own browser.',
  },
  {
    q: 'Do you ship internationally?',
    a: 'Not yet. We ship within the US for now, and we would rather do one country well than five badly. International shipping is on the roadmap.',
  },
  {
    q: 'What if my item arrives damaged or wrong?',
    a: 'Send a photo to support@novamart.com and a replacement ships the same day — no return needed for damaged goods. Mistakes are on us, and we act like it.',
  },
  {
    q: 'Is the stock count accurate?',
    a: 'Yes. Inventory updates the moment an order is placed, so if the page says it is in stock, it is yours.',
  },
];

function Item({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-line bg-card">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="font-display text-lg font-semibold text-ink">{q}</span>
        <span
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sand text-ink transition-transform duration-300',
            open && 'rotate-45 bg-accent text-white',
          )}
        >
          <Plus size={16} aria-hidden />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <p className="px-6 pb-6 leading-relaxed text-muted">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
      <EditorialHeader
        kicker="FAQ"
        title="Asked, answered."
        lede="The things people actually ask us, answered the way we would answer them over the counter."
      />
      <div className="mx-auto mt-12 max-w-3xl space-y-3">
        {FAQS.map((f, i) => (
          <Reveal key={f.q} delay={Math.min(i * 0.04, 0.25)}>
            <Item
              q={f.q}
              a={f.a}
              open={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          </Reveal>
        ))}
      </div>
      <QuoteBlock
        className="mx-auto mt-14 max-w-3xl"
        quote="If your question isn't here, ask us. We'll answer — and probably add it to this page."
        cite="The support desk"
      />
    </div>
  );
}
