'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { orderStatusMeta } from '@/lib/format';
import type { OrderStatus } from '@/lib/types';

/* NovaMart admin "mission control" dark tokens (DESIGN_BRIEF §2):
   bg #14110D · panel #1E1A14 · line #2E2820 · text #F2EBDD · muted #A39A89
   accent #E4572E · accent-pressed #B23A17 · green #7FB069 · red #E26D5A · amber #E0A458 · gold #C99A2C
   Hard rules: NO gradients, NO indigo/blue anywhere. */

export const SERIF = '[font-family:var(--font-display)]';

export function Panel({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return (
    <section className={`rounded-[14px] border border-[#2E2820] bg-[#1E1A14] ${className}`}>
      {children}
    </section>
  );
}

export function PageHeader({
  title,
  sub,
  actions,
}: {
  title: string;
  sub?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className={`text-3xl font-semibold tracking-tight text-[#F2EBDD] ${SERIF}`}>{title}</h1>
        {sub && <p className="mt-1.5 max-w-prose text-sm text-[#A39A89]">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ---------- Buttons: primary = accent pill, secondary = 1px line pill ---------- */

type BtnVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type BtnSize = 'sm' | 'md';

const btnBase =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40';

const btnVariants: Record<BtnVariant, string> = {
  primary: 'bg-[#E4572E] text-white hover:bg-[#B23A17]',
  secondary: 'border border-[#2E2820] bg-transparent text-[#F2EBDD] hover:border-[#E4572E] hover:text-[#E4572E]',
  danger: 'bg-[#E26D5A] text-white hover:brightness-110',
  ghost: 'text-[#A39A89] hover:bg-white/5 hover:text-[#F2EBDD]',
};

const btnSizes: Record<BtnSize, string> = {
  sm: 'px-3.5 py-1.5 text-[13px]',
  md: 'px-5 py-2.5 text-sm',
};

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: BtnSize;
}

export function Btn({ variant = 'primary', size = 'md', className = '', ...rest }: BtnProps) {
  return (
    <button
      type="button"
      className={`${btnBase} ${btnVariants[variant]} ${btnSizes[size]} ${className}`}
      {...rest}
    />
  );
}

/* ---------- Status pills (order lifecycle). No blue anywhere. ---------- */

const STATUS_STYLE: Record<OrderStatus, { text: string; dot: string; ring: string }> = {
  pending: { text: 'text-[#E0A458]', dot: 'bg-[#E0A458]', ring: 'border-[#E0A458]/30 bg-[#E0A458]/10' },
  confirmed: { text: 'text-[#E4572E]', dot: 'bg-[#E4572E]', ring: 'border-[#E4572E]/30 bg-[#E4572E]/10' },
  shipped: { text: 'text-[#C99A2C]', dot: 'bg-[#C99A2C]', ring: 'border-[#C99A2C]/30 bg-[#C99A2C]/10' },
  delivered: { text: 'text-[#7FB069]', dot: 'bg-[#7FB069]', ring: 'border-[#7FB069]/30 bg-[#7FB069]/10' },
  cancelled: { text: 'text-[#E26D5A]', dot: 'bg-[#E26D5A]', ring: 'border-[#E26D5A]/30 bg-[#E26D5A]/10' },
  refunded: { text: 'text-[#A39A89]', dot: 'bg-[#A39A89]', ring: 'border-[#A39A89]/30 bg-[#A39A89]/10' },
};

export function StatusPill({ status }: { status: OrderStatus }) {
  const s = STATUS_STYLE[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${s.ring} ${s.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
      {orderStatusMeta[status].label}
    </span>
  );
}

/* ---------- Form fields (dark) ---------- */

export const inputCls =
  'w-full rounded-lg border border-[#2E2820] bg-[#14110D] px-3 py-2 text-sm text-[#F2EBDD] placeholder:text-[#A39A89]/60 focus:border-[#E4572E] focus:outline-none focus:ring-1 focus:ring-[#E4572E]/40';
export const labelCls = 'mb-1.5 block text-[13px] font-semibold text-[#F2EBDD]';

export function Field({
  label,
  error,
  hint,
  children,
  htmlFor,
}: {
  label: string;
  error?: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className={labelCls}>
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-[#A39A89]">{hint}</p>}
      {error && <p className="mt-1 text-xs font-medium text-[#E26D5A]">{error}</p>}
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  ariaLabel,
  className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <svg
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A39A89]"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={`${inputCls} pl-9`}
      />
    </div>
  );
}

/* ---------- Feedback: toast banner, empty state, confirm dialog ---------- */

export function Toast({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-[14px] border border-[#7FB069]/30 bg-[#7FB069]/10 px-4 py-3 text-sm font-medium text-[#7FB069]">
      <CheckCircle2 className="h-4 w-4 shrink-0" />
      {message}
    </div>
  );
}

export function EmptyBox({
  icon: Icon,
  title,
  hint,
  action,
}: {
  icon: LucideIcon;
  title: string;
  hint: string;
  action?: ReactNode;
}) {
  return (
    <Panel className="flex flex-col items-center px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#2E2820] bg-[#14110D] text-[#A39A89]">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 text-base font-semibold text-[#F2EBDD]">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-[#A39A89]">{hint}</p>
      {action && <div className="mt-5">{action}</div>}
    </Panel>
  );
}

export function ConfirmDialog({
  title,
  body,
  confirmLabel = 'Confirm',
  danger = false,
  busy = false,
  onCancel,
  onConfirm,
}: {
  title: string;
  body: ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <div className="absolute inset-0 bg-black/70" onClick={onCancel} aria-hidden="true" />
      <div
        className="relative w-full max-w-md rounded-[14px] border border-[#2E2820] bg-[#1E1A14] p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-title"
      >
        <div className="flex items-start gap-3">
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
              danger ? 'bg-[#E26D5A]/10 text-[#E26D5A]' : 'bg-[#E4572E]/10 text-[#E4572E]'
            }`}
          >
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div>
            <h2 id="admin-confirm-title" className="text-lg font-semibold text-[#F2EBDD]">
              {title}
            </h2>
            <div className="mt-1.5 text-sm leading-relaxed text-[#A39A89]">{body}</div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Btn variant="secondary" size="sm" onClick={onCancel} disabled={busy}>
            Cancel
          </Btn>
          <Btn variant={danger ? 'danger' : 'primary'} size="sm" onClick={onConfirm} disabled={busy}>
            {busy ? 'Working…' : confirmLabel}
          </Btn>
        </div>
      </div>
    </div>
  );
}

/* ---------- Table scaffolding ---------- */

export const theadCls = 'border-b border-[#2E2820] text-left text-[11px] uppercase tracking-[0.08em] text-[#A39A89]';
export const thCls = 'px-4 py-3 font-semibold';
export const rowCls = 'border-b border-[#2E2820]/60 transition-colors last:border-0 hover:bg-white/[0.02]';
export const tdCls = 'px-4 py-3.5';

export function Mono({ children }: { children: ReactNode }) {
  return <span className="font-mono text-xs text-[#A39A89]">{children}</span>;
}
