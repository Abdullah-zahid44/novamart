export default function ShopLoading() {
  return (
    <main className="bg-paper" aria-label="Loading shop">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Editorial header skeleton */}
        <div className="h-11 w-72 animate-pulse rounded-lg bg-sand" />
        <div className="mt-3 h-5 w-40 animate-pulse rounded bg-sand" />
        <div className="mt-10 flex gap-8">
          {/* Filter rail skeleton */}
          <aside className="hidden w-60 shrink-0 space-y-4 md:block">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 animate-pulse rounded bg-sand" />
                <div className="h-8 w-full animate-pulse rounded-lg bg-card" />
              </div>
            ))}
          </aside>
          {/* Product grid skeleton */}
          <div className="grid flex-1 grid-cols-2 gap-5 lg:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="overflow-hidden rounded-[14px] border border-line bg-card"
              >
                <div className="aspect-[4/5] animate-pulse bg-sand" />
                <div className="space-y-2 p-4">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-sand" />
                  <div className="h-4 w-1/3 animate-pulse rounded bg-sand" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
