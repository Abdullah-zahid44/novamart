'use client';

import { useState, type FormEvent } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/cn';

export interface NewsletterFormProps {
  compact?: boolean;
  className?: string;
}

/** Pill newsletter form with inline success state. Demo-grade: stores nothing. */
export function NewsletterForm({ compact, className }: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!valid) {
      setError('That email does not look right — mind checking it?');
      return;
    }
    setError(null);
    setDone(true);
  };

  if (done) {
    return (
      <div className={cn('flex items-center gap-3 rounded-[14px] border border-line bg-card px-5 py-4', className)}>
        <CheckCircle2 className="h-5 w-5 shrink-0 text-accent" aria-hidden />
        <p className="text-sm font-medium text-ink">
          You are on the list. First drop lands Friday.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className={cn('w-full', className)}>
      <div
        className={cn(
          'flex items-center gap-2 rounded-full border bg-card p-1.5 pl-5',
          error ? 'border-rose-500' : 'border-line',
        )}
      >
        <label htmlFor={compact ? 'nl-email-footer' : 'nl-email'} className="sr-only">
          Email address
        </label>
        <input
          id={compact ? 'nl-email-footer' : 'nl-email'}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="h-10 w-full bg-transparent text-sm text-ink placeholder:text-muted/70 focus:outline-none"
        />
        <Button type="submit" size={compact ? 'sm' : 'md'} className="shrink-0">
          Subscribe
        </Button>
      </div>
      {error && <p className="mt-2 pl-5 text-xs text-rose-600">{error}</p>}
      {!compact && !error && (
        <p className="mt-2 pl-5 text-xs text-muted">One email a week. Unsubscribe anytime.</p>
      )}
    </form>
  );
}
