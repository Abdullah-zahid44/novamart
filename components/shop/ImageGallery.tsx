'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { Product } from '@/lib/types';

const badgeClass: Record<string, string> = {
  NEW: 'bg-emerald-600 text-white',
  SALE: 'bg-rose-600 text-white',
  HOT: 'bg-amber-400 text-indigo-950',
  BESTSELLER: 'bg-indigo-600 text-white',
};

interface ImageGalleryProps {
  images: string[];
  name: string;
  badge?: Product['badge'];
}

export function ImageGallery({ images, name, badge }: ImageGalleryProps) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div>
      <div className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
        <Image
          key={current}
          src={current}
          alt={name}
          fill
          sizes="(min-width: 1024px) 45vw, 100vw"
          priority
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-150"
        />
        {badge && (
          <span
            className={`absolute left-3 top-3 rounded-md px-2.5 py-1 text-xs font-bold tracking-wide ${badgeClass[badge]}`}
          >
            {badge}
          </span>
        )}
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View image ${i + 1} of ${name}`}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-gray-100 transition-colors ${
                i === active ? 'border-indigo-600' : 'border-transparent hover:border-gray-300'
              }`}
            >
              <Image src={src} alt={`${name} thumbnail ${i + 1}`} fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
