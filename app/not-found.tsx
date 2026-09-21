import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="bg-paper text-ink">
      <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 py-24 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
          404
        </p>
        <h1 className="mt-4 font-display text-5xl font-semibold leading-tight sm:text-6xl">
          This page wandered off.
        </h1>
        <p className="mt-4 max-w-md text-muted">
          The link may be old, or the shelf may have been restocked. Either
          way, the good stuff is still here.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/shop"
            className="rounded-full bg-accent px-6 py-3 font-semibold text-white transition active:scale-[0.98] hover:bg-accent-ink"
          >
            Shop the collection
          </Link>
          <Link
            href="/deals"
            className="rounded-full border border-line bg-card px-6 py-3 font-semibold text-ink transition active:scale-[0.98] hover:border-ink"
          >
            Today&rsquo;s deals
          </Link>
          <Link
            href="/track"
            className="rounded-full border border-line bg-card px-6 py-3 font-semibold text-ink transition active:scale-[0.98] hover:border-ink"
          >
            Track your order
          </Link>
        </div>
      </div>
    </main>
  );
}
