import Link from 'next/link';
import { Compass, Home, Tag } from 'lucide-react';

const LINKS = [
  { href: '/', label: 'Back to home', icon: Home },
  { href: '/shop', label: 'Browse the shop', icon: Compass },
  { href: '/deals', label: "Today's deals", icon: Tag },
];

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-28">
      <p className="text-7xl font-extrabold tracking-tight text-indigo-200 sm:text-8xl">
        404
      </p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">
        This page wandered off
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-600 sm:text-base">
        The page you&apos;re looking for doesn&apos;t exist, moved, or the link
        has a typo. Let&apos;s get you back to the good stuff.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-indigo-600 hover:text-indigo-600"
          >
            <l.icon className="h-4 w-4" aria-hidden="true" />
            {l.label}
          </Link>
        ))}
      </div>
    </main>
  );
}
