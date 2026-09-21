import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export interface SectionHeadingProps {
  kicker?: string;
  title: string;
  sub?: string;
  link?: { href: string; label: string };
}

/** Editorial section header: accent kicker, Fraunces title, optional sub-copy and link. */
export function SectionHeading({ kicker, title, sub, link }: SectionHeadingProps) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {kicker && (
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-accent">{kicker}</p>
        )}
        <h2 className="font-display text-[clamp(1.9rem,4vw,2.9rem)] font-semibold leading-[1.1] tracking-tight text-ink">
          {title}
        </h2>
        {sub && <p className="mt-3 text-muted">{sub}</p>}
      </div>
      {link && (
        <Link
          href={link.href}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent-deep hover:underline"
        >
          {link.label}
          <ArrowRight size={16} aria-hidden />
        </Link>
      )}
    </div>
  );
}
