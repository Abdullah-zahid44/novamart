import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';
import { errorCls, fieldCls, labelCls } from '@/components/ui/fieldBase';

interface FieldProps {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}

/** Label wrapper used by checkout / tracking forms. */
export function Field({ label, htmlFor, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className={labelCls}>
        {label}
      </label>
      {children}
    </div>
  );
}

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & { error?: string };

export function TextInput({ error, className, ...props }: TextInputProps) {
  return (
    <>
      <input
        {...props}
        aria-invalid={!!error}
        className={`${fieldCls(error)} h-11 px-3.5${className ? ` ${className}` : ''}`}
      />
      {error && <p className={errorCls}>{error}</p>}
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
        className={`${fieldCls(error)} h-11 px-3.5${className ? ` ${className}` : ''}`}
      >
        {children}
      </select>
      {error && <p className={errorCls}>{error}</p>}
    </>
  );
}
