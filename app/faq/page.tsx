'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: 'How long does shipping take?',
    a: 'Standard shipping arrives in 3–5 business days within the contiguous US. Express (1–2 business days) is available at checkout for most items. Every order includes live tracking from our warehouse to your door.',
  },
  {
    q: 'What is the return policy?',
    a: 'You have 30 days from delivery to return any unused item in its original packaging for a full refund — no questions, no restocking fees. Start a return from your account page or by emailing support, and we will send a prepaid label.',
  },
  {
    q: 'How do I track my order?',
    a: 'As soon as your order ships you will get a tracking link by email. You can also paste your order number and email on our Track page at any time to see the latest status.',
  },
  {
    q: 'Which payment methods do you accept?',
    a: 'We accept all major credit and debit cards (Visa, Mastercard, American Express, Discover) through our secure encrypted checkout. This demo store does not process real payments.',
  },
  {
    q: 'Can I use a coupon code?',
    a: 'Yes — enter your code at checkout and the discount applies instantly. Codes have minimum order values and expiry dates, which are shown next to the code. Only one coupon per order.',
  },
  {
    q: 'Do you ship internationally?',
    a: 'Currently we ship within the United States. International shipping to Canada, the UK and the EU is on our roadmap — join the newsletter and we will announce it there first.',
  },
  {
    q: 'Do I need an account to order?',
    a: 'No, guest checkout is fully supported. Creating a free account just makes life easier: faster checkout, order history, saved addresses and a wishlist that syncs across devices.',
  },
  {
    q: 'Are your products genuine?',
    a: 'Absolutely. We buy directly from brands and authorized distributors — never grey-market stock. Every product carries its full manufacturer warranty, and our buying team tests samples before listing.',
  },
];

export default function FaqPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <p className="text-xs font-bold tracking-widest text-indigo-600 uppercase">
        Help center
      </p>
      <h1 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
        Frequently asked questions
      </h1>
      <p className="mt-3 text-slate-600">
        Quick answers to the things shoppers ask us most. Still stuck?{' '}
        <a href="/contact" className="font-medium text-indigo-600 hover:underline">
          Contact us
        </a>
        .
      </p>

      <div className="mt-10 space-y-3">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <div
              key={f.q}
              className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200"
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-slate-50"
              >
                <span className="text-sm font-semibold text-slate-900 sm:text-base">
                  {f.q}
                </span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true"
                />
              </button>
              {isOpen && (
                <div className="border-t border-slate-100 px-5 py-4">
                  <p className="text-sm leading-relaxed text-slate-600">{f.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
