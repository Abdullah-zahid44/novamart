'use client';

import { useEffect, useState } from 'react';

function nextFridayMidnight(): number {
  const now = new Date();
  const target = new Date(now);
  const diff = (5 - now.getDay() + 7) % 7; // 5 = Friday
  target.setDate(now.getDate() + diff);
  target.setHours(0, 0, 0, 0);
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 7);
  }
  return target.getTime();
}

function parts(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Live countdown to Friday's drop. Styled for the accent deals band. */
export function Countdown() {
  const [target] = useState<number>(() => nextFridayMidnight());
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const { days, hours, minutes, seconds } = parts(target - now);
  const units: Array<[string, string]> = [
    [pad(days), 'days'],
    [pad(hours), 'hrs'],
    [pad(minutes), 'min'],
    [pad(seconds), 'sec'],
  ];

  return (
    <div className="flex items-center gap-2 sm:gap-3" role="timer" aria-label="Countdown to Friday's drop">
      {units.map(([value, label]) => (
        <div
          key={label}
          className="min-w-[64px] rounded-xl bg-ink/15 px-3 py-2.5 text-center sm:min-w-[76px]"
        >
          <div className="font-display text-2xl font-semibold tabular-nums text-paper sm:text-3xl">
            {value}
          </div>
          <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/70">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
