'use client';

import { useState } from 'react';
import { CheckCircle2, Mail } from 'lucide-react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setDone(true);
  };

  if (done) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-white/10 px-5 py-4 ring-1 ring-white/20">
        <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-300" aria-hidden="true" />
        <p className="text-sm text-white">
          <span className="font-semibold">You&apos;re on the list.</span> Watch
          your inbox — your first subscriber-only deal is on its way.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="w-full">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <div className="relative flex-1">
          <Mail
            className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            id="newsletter-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? 'newsletter-error' : undefined}
            className="w-full rounded-lg border-0 bg-white py-3.5 pr-4 pl-11 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-amber-300 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-amber-400 px-7 py-3.5 font-semibold text-slate-900 transition hover:bg-amber-300"
        >
          Subscribe
        </button>
      </div>
      {error && (
        <p id="newsletter-error" role="alert" className="mt-2 text-sm text-amber-300">
          {error}
        </p>
      )}
      <p className="mt-3 text-xs text-indigo-200">
        One email a week, max. Unsubscribe anytime — no hard feelings.
      </p>
    </form>
  );
}
