import type { LucideIcon } from "lucide-react";

type Tone = "orange" | "green" | "amber" | "red";

const TONES: Record<Tone, { hex: string; soft: string }> = {
  orange: { hex: "#E4572E", soft: "rgba(228, 87, 46, 0.12)" },
  green: { hex: "#7FB069", soft: "rgba(127, 176, 105, 0.12)" },
  amber: { hex: "#E0A458", soft: "rgba(224, 164, 88, 0.12)" },
  red: { hex: "#E26D5A", soft: "rgba(226, 109, 90, 0.12)" },
};

interface StatCardProps {
  title: string;
  value: string;
  delta?: string;
  /** Positive, negative, or neutral delta coloring. */
  deltaTone?: "up" | "down" | "flat";
  icon: LucideIcon;
  tone?: Tone;
  /** Optional 7–14 daily values rendered as an SVG sparkline. */
  spark?: number[];
}

function sparklinePath(values: number[], w: number, h: number, pad: number) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = max - min || 1;
  const step = values.length > 1 ? (w - pad * 2) / (values.length - 1) : 0;
  return values
    .map((v, i) => {
      const x = pad + i * step;
      const y = pad + (1 - (v - min) / span) * (h - pad * 2);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export default function StatCard({
  title,
  value,
  delta,
  deltaTone = "flat",
  icon: Icon,
  tone = "orange",
  spark,
}: StatCardProps) {
  const t = TONES[tone];
  const deltaColor =
    deltaTone === "up" ? "#7FB069" : deltaTone === "down" ? "#E26D5A" : "#A39A89";
  const showSpark = spark && spark.length > 1;

  return (
    <div className="rounded-[14px] border border-[#2E2820] bg-[#1E1A14] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#A39A89]">
            {title}
          </p>
          <p className="mt-2 truncate text-[1.75rem] font-semibold leading-none text-[#F2EBDD]">
            {value}
          </p>
          {delta && (
            <p className="mt-2 text-xs font-medium" style={{ color: deltaColor }}>
              {delta}
            </p>
          )}
        </div>
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: t.soft, color: t.hex }}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>
      {showSpark && (
        <svg
          viewBox="0 0 120 36"
          className="mt-3 h-9 w-full"
          role="img"
          aria-label={`${title} trend`}
          preserveAspectRatio="none"
        >
          <path
            d={sparklinePath(spark, 120, 36, 4)}
            fill="none"
            stroke={t.hex}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {(() => {
            const pts = sparklinePath(spark, 120, 36, 4).split(/(?=[ML])/);
            const last = pts[pts.length - 1].slice(1).split(",");
            return (
              <circle cx={Number(last[0])} cy={Number(last[1])} r="3" fill={t.hex} />
            );
          })()}
        </svg>
      )}
    </div>
  );
}
