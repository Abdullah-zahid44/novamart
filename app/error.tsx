'use client';

import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="bg-paper text-ink">
      <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 py-24 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
          Something went wrong
        </p>
        <h1 className="mt-4 font-display text-5xl font-semibold leading-tight sm:text-6xl">
          Not your fault. Probably ours.
        </h1>
        <p className="mt-4 max-w-md text-muted">
          {error.message || 'The page hit a snag while loading.'} Give it
          another go, or head back to the shop.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-full bg-accent px-6 py-3 font-semibold text-white transition active:scale-[0.98] hover:bg-accent-ink"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-full border border-line bg-card px-6 py-3 font-semibold text-ink transition active:scale-[0.98] hover:border-ink"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
