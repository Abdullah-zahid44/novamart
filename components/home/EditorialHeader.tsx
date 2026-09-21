import { Reveal } from '@/components/ui';
import { cn } from '@/lib/cn';

export interface EditorialHeaderProps {
  kicker: string;
  title: string;
  lede?: string;
  align?: 'left' | 'center';
  className?: string;
}

/** Editorial page header — accent kicker, Fraunces title, generous measure lede. */
export function EditorialHeader({ kicker, title, lede, align = 'left', className }: EditorialHeaderProps) {
  return (
    <Reveal className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center', className)}>
      <p
        className={cn(
          'mb-4 text-xs font-bold uppercase tracking-[0.22em] text-accent',
          align === 'center' && 'text-center',
        )}
      >
        {kicker}
      </p>
      <h1 className="font-display text-[clamp(2.4rem,6vw,4.2rem)] font-semibold leading-[1.05] tracking-tight text-ink">
        {title}
      </h1>
      {lede && <p className={cn('mt-5 max-w-prose text-lg leading-relaxed text-muted', align === 'center' && 'mx-auto')}>{lede}</p>}
    </Reveal>
  );
}

export interface QuoteBlockProps {
  quote: string;
  cite?: string;
  className?: string;
}

/** Forest quote panel — the brand's dry voice, set large in Fraunces italic. */
export function QuoteBlock({ quote, cite, className }: QuoteBlockProps) {
  return (
    <Reveal className={className}>
      <figure className="rounded-[14px] bg-forest px-8 py-10 sm:px-12">
        <blockquote className="font-display text-2xl italic leading-snug text-paper sm:text-3xl">
          &ldquo;{quote}&rdquo;
        </blockquote>
        {cite && (
          <figcaption className="mt-4 text-sm font-semibold uppercase tracking-[0.18em] text-paper/60">
            {cite}
          </figcaption>
        )}
      </figure>
    </Reveal>
  );
}
