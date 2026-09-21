import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  delta?: string;
  icon: LucideIcon;
  tone?: "indigo" | "emerald" | "amber" | "rose";
}

const toneStyles: Record<NonNullable<StatCardProps["tone"]>, string> = {
  indigo: "bg-indigo-100 text-indigo-600",
  emerald: "bg-emerald-100 text-emerald-600",
  amber: "bg-amber-100 text-amber-600",
  rose: "bg-rose-100 text-rose-600",
};

export default function StatCard({ title, value, delta, icon: Icon, tone = "indigo" }: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${toneStyles[tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
      {delta && <p className="mt-1 text-xs text-gray-500">{delta}</p>}
    </div>
  );
}
