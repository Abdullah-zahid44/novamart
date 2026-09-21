import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';

interface FieldProps {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}

/** Label wrapper used by checkout / tracking forms. */
export function Field({ label, htmlFor, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls = (error?: string) =>
  `w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:ring-2 ${
    error
      ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-100'
      : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100'
  }`;

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & { error?: string };

export function TextInput({ error, className, ...props }: TextInputProps) {
  return (
    <>
      <input
        {...props}
        aria-invalid={!!error}
        className={`${inputCls(error)}${className ? ` ${className}` : ''}`}
      />
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </>
  );
}

type SelectInputProps = SelectHTMLAttributes<HTMLSelectElement> & { error?: string };

export function SelectInput({ error, className, children, ...props }: SelectInputProps) {
  return (
    <>
      <select
        {...props}
        aria-invalid={!!error}
        className={`${inputCls(error)}${className ? ` ${className}` : ''}`}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </>
  );
}
