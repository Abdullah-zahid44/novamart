'use client';

import { useEffect, useState } from 'react';

function msUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.max(0, midnight.getTime() - now.getTime());
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

export default function Countdown({ label }: { label: string }) {
  const [remaining, setRemaining] = useState<number>(() => msUntilMidnight());

  useEffect(() => {
    const id = setInterval(() => setRemaining(msUntilMidnight()), 1000);
    return () => clearInterval(id);
  }, []);

  const totalSeconds = Math.floor(remaining / 1000);
  const units = [
    { value: pad(Math.floor(totalSeconds / 3600)), name: 'hrs' },
    { value: pad(Math.floor((totalSeconds % 3600) / 60)), name: 'min' },
    { value: pad(totalSeconds % 60), name: 'sec' },
  ];

  return (
    <div className="flex items-center gap-4">
      <p className="text-sm font-semibold tracking-wide uppercase">{label}</p>
      <div className="flex items-center gap-1.5" role="timer" aria-label={label}>
        {units.map((u, i) => (
          <div key={u.name} className="flex items-center gap-1.5">
            <div className="flex flex-col items-center">
              <span className="min-w-12 rounded-lg bg-slate-900 px-2 py-1.5 text-center text-xl font-bold text-white tabular-nums">
                {u.value}
              </span>
              <span className="mt-1 text-[10px] font-medium tracking-wider text-slate-500 uppercase">
                {u.name}
              </span>
            </div>
            {i < units.length - 1 && (
              <span className="-mt-5 text-xl font-bold text-slate-400" aria-hidden="true">
                :
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
