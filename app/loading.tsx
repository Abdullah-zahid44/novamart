export default function Loading() {
  return (
    <main className="bg-paper" aria-label="Loading">
      {/* Hero skeleton */}
      <div className="mx-auto max-w-7xl px-6 pt-14">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div className="space-y-4">
            <div className="h-14 w-4/5 animate-pulse rounded-lg bg-sand" />
            <div className="h-14 w-3/5 animate-pulse rounded-lg bg-sand" />
            <div className="h-5 w-2/3 animate-pulse rounded bg-sand" />
            <div className="flex gap-3 pt-2">
              <div className="h-11 w-36 animate-pulse rounded-full bg-sand" />
              <div className="h-11 w-36 animate-pulse rounded-full bg-sand" />
            </div>
          </div>
          <div className="h-80 animate-pulse rounded-[999px_999px_18px_18px] bg-sand md:h-[26rem]" />
        </div>
      </div>
      {/* Section skeleton */}
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="h-9 w-64 animate-pulse rounded-lg bg-sand" />
        <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
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
    </main>
  );
}
