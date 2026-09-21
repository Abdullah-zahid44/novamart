import Image from 'next/image';
import Link from 'next/link';
import { Award, HeartHandshake, Leaf, Truck } from 'lucide-react';

export const metadata = {
  title: 'About us — NovaMart',
  description:
    'Learn the NovaMart story: curated products, honest prices and customer-first service.',
};

const VALUES = [
  {
    icon: Award,
    title: 'Quality first',
    text: 'Every product is vetted by our buying team before it earns a spot in the catalog. If we would not buy it ourselves, we do not sell it.',
  },
  {
    icon: HeartHandshake,
    title: 'Customers, always',
    text: 'Support that answers like a human, returns without interrogation, and a checkout that respects your time and your wallet.',
  },
  {
    icon: Truck,
    title: 'Fast, honest shipping',
    text: 'Real tracking from warehouse to doorstep, and free shipping on orders over the threshold — no games with inflated list prices.',
  },
  {
    icon: Leaf,
    title: 'Lighter footprint',
    text: 'Consolidated shipments, recyclable packaging and carbon-aware delivery options wherever carriers support them.',
  },
];

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="text-xs font-bold tracking-widest text-indigo-600 uppercase">
            Our story
          </p>
          <h1 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
            A store built by shoppers, for shoppers
          </h1>
          <p className="mt-5 leading-relaxed text-slate-600">
            NovaMart started in 2022 with a simple frustration: online shopping
            had become a maze of inflated &ldquo;sale&rdquo; prices, mystery
            sellers and support tickets that went nowhere. We thought it could
            be better — a single store where the price is the price, the
            reviews are real, and help is one email away.
          </p>
          <p className="mt-4 leading-relaxed text-slate-600">
            Today we curate 48+ products across six departments — electronics,
            home &amp; kitchen, fashion, beauty, sports and toys — chosen by a
            small team that tests what it sells. No endless marketplace noise,
            no counterfeit roulette. Just good products, delivered fast.
          </p>
        </div>
        <div className="overflow-hidden rounded-2xl shadow-lg ring-1 ring-slate-200">
          <Image
            src="https://picsum.photos/seed/novamart-about/1000/700"
            alt="Inside the NovaMart warehouse"
            width={1000}
            height={700}
            className="h-auto w-full object-cover"
          />
        </div>
      </div>

      <section className="mt-16 sm:mt-20">
        <h2 className="text-2xl font-bold text-slate-900">What we stand for</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((v) => (
            <div
              key={v.title}
              className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-100">
                <v.icon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-semibold text-slate-900">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {v.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 rounded-2xl bg-indigo-950 p-8 text-center sm:mt-20 sm:p-12">
        <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
          Ready to shop the NovaMart way?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-indigo-200">
          Browse the catalog, grab today&apos;s deals, and see why thousands of
          shoppers made the switch.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex items-center rounded-lg bg-white px-7 py-3 font-semibold text-indigo-700 transition hover:bg-indigo-50"
        >
          Start shopping
        </Link>
      </section>
    </main>
  );
}
