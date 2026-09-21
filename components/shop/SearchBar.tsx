'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  initialValue?: string;
  onSearch: (query: string) => void;
  placeholder?: string;
  /** Increment to reset the field (e.g. when filters are cleared externally). */
  clearSignal?: number;
}

export function SearchBar({
  initialValue = '',
  onSearch,
  placeholder = 'Search products, brands, categories…',
  clearSignal = 0,
}: SearchBarProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearSignal]);

  useEffect(() => {
    const timer = setTimeout(() => onSearch(value.trim()), 400);
    return () => clearTimeout(timer);
  }, [value, onSearch]);

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Search products"
        className="w-full rounded-full border border-line bg-card py-2.5 pl-11 pr-4 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
      />
    </div>
  );
}
