"use client";

import { currency } from "@/lib/format";

interface DayPoint {
  label: string;
  total: number;
}

interface RevenueChartProps {
  days: DayPoint[];
}

const W = 720;
const H = 280;
const PAD = { l: 52, r: 16, t: 16, b: 36 };
const ACCENT = "#E4572E";

function compact(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  return `$${Math.round(n)}`;
}

/**
 * Pure-SVG revenue area chart — flat fill, no gradients, no chart deps.
 */
export default function RevenueChart({ days }: RevenueChartProps) {
  const max = Math.max(...days.map((d) => d.total), 1);
  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;

  const x = (i: number) => PAD.l + (days.length > 1 ? (i / (days.length - 1)) * iw : iw / 2);
  const y = (v: number) => PAD.t + (1 - v / max) * ih;

  const line = days.map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(d.total).toFixed(1)}`).join(" ");
  const area = `${line} L${x(days.length - 1).toFixed(1)},${(PAD.t + ih).toFixed(1)} L${x(0).toFixed(1)},${(PAD.t + ih).toFixed(1)} Z`;

  const gridlines = [0.25, 0.5, 0.75, 1].map((f) => ({
    y: PAD.t + (1 - f) * ih,
    label: compact(max * f),
  }));

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label="Revenue over the last 14 days"
    >
      {gridlines.map((g, i) => (
        <g key={`grid-${i}`}>
          <line x1={PAD.l} x2={W - PAD.r} y1={g.y} y2={g.y} stroke="#2E2820" strokeWidth="1" />
          <text x={PAD.l - 8} y={g.y + 4} textAnchor="end" fontSize="11" fill="#A39A89">
            {g.label}
          </text>
        </g>
      ))}

      <path d={area} fill={ACCENT} fillOpacity={0.12} />
      <path
        d={line}
        fill="none"
        stroke={ACCENT}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {days.map((d, i) => (
        <g key={d.label}>
          <circle cx={x(i)} cy={y(d.total)} r="4" fill="#14110D" stroke={ACCENT} strokeWidth="2">
            <title>{`${d.label}: ${currency(d.total)}`}</title>
          </circle>
          {i % 2 === 0 && (
            <text x={x(i)} y={H - 12} textAnchor="middle" fontSize="11" fill="#A39A89">
              {d.label}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
