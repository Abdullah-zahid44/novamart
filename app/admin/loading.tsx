export default function AdminLoading() {
  return (
    <div
      className="flex min-h-screen bg-[#14110D] text-[#F2EBDD]"
      aria-label="Loading admin"
    >
      {/* Sidebar skeleton */}
      <aside className="hidden w-60 shrink-0 border-r border-[#2E2820] bg-[#1E1A14] p-5 md:block">
        <div className="h-7 w-32 animate-pulse rounded bg-[#2E2820]" />
        <div className="mt-8 space-y-3">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-9 w-full animate-pulse rounded-lg bg-[#2E2820]" />
          ))}
        </div>
      </aside>
      <div className="flex-1 p-6 md:p-8">
        {/* Topbar skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 animate-pulse rounded-lg bg-[#2E2820]" />
          <div className="h-10 w-10 animate-pulse rounded-full bg-[#2E2820]" />
        </div>
        {/* Stat cards skeleton */}
        <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-[14px] border border-[#2E2820] bg-[#1E1A14] p-5"
            >
              <div className="h-4 w-20 animate-pulse rounded bg-[#2E2820]" />
              <div className="mt-3 h-8 w-28 animate-pulse rounded bg-[#2E2820]" />
              <div className="mt-3 h-10 w-full animate-pulse rounded bg-[#2E2820]" />
            </div>
          ))}
        </div>
        {/* Table skeleton */}
        <div className="mt-6 rounded-[14px] border border-[#2E2820] bg-[#1E1A14] p-5">
          <div className="h-6 w-40 animate-pulse rounded bg-[#2E2820]" />
          <div className="mt-4 space-y-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 w-full animate-pulse rounded-lg bg-[#2E2820]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
