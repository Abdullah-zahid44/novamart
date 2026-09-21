export default function ProductLoading() {
  return (
    <main className="bg-paper" aria-label="Loading product">
      <div className="mx-auto max-w-7xl px-6 py-10">
        {/* Breadcrumbs skeleton */}
        <div className="flex gap-2">
          <div className="h-4 w-16 animate-pulse rounded bg-sand" />
          <div className="h-4 w-16 animate-pulse rounded bg-sand" />
          <div className="h-4 w-24 animate-pulse rounded bg-sand" />
        </div>
        <div className="mt-8 grid gap-10 md:grid-cols-2">
          {/* Gallery skeleton */}
          <div className="space-y-3">
            <div className="aspect-[4/5] animate-pulse rounded-[14px] bg-sand" />
            <div className="flex gap-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-20 w-20 animate-pulse rounded-[14px] bg-sand"
                />
              ))}
            </div>
          </div>
          {/* Info column skeleton */}
          <div className="space-y-4">
            <div className="h-10 w-4/5 animate-pulse rounded-lg bg-sand" />
            <div className="h-5 w-40 animate-pulse rounded bg-sand" />
            <div className="h-8 w-28 animate-pulse rounded-lg bg-sand" />
            <div className="flex gap-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-9 w-16 animate-pulse rounded-full bg-sand"
                />
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <div className="h-12 w-28 animate-pulse rounded-full bg-sand" />
              <div className="h-12 flex-1 animate-pulse rounded-full bg-sand" />
            </div>
            <div className="space-y-2 pt-4">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-12 w-full animate-pulse rounded-[14px] bg-card"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
