import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export interface SectionHeadingProps {
  kicker?: string;
  title: string;
  sub?: string;
  link?: { href: string; label: string };
}

/** Section header: kicker eyebrow, title, optional sub-copy and "view all" link. */
export function SectionHeading({ kicker, title, sub, link }: SectionHeadingProps) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {kicker && (
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-indigo-600">{kicker}</p>
        )}
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h2>
        {sub && <p className="mt-2 text-slate-500">{sub}</p>}
      </div>
      {link && (
        <Link
          href={link.href}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
        >
          {link.label}
          <ArrowRight size={16} aria-hidden />
        </Link>
      )}
    </div>
  );
}
