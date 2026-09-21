'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/cn';
import type { Product } from '@/lib/types';

const badgeClass: Record<string, string> = {
  NEW: 'bg-forest text-paper',
  SALE: 'bg-accent text-white',
  HOT: 'bg-accent-deep text-white',
  BESTSELLER: 'bg-ink text-paper',
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
      <div className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-[14px] border border-line bg-sand">
        <Image
          key={current}
          src={current}
          alt={name}
          fill
          sizes="(min-width: 1024px) 45vw, 100vw"
          priority
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.08]"
        />
        {badge && (
          <span
            className={cn(
              'absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em]',
              badgeClass[badge],
            )}
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
              className={cn(
                'relative h-16 w-16 shrink-0 overflow-hidden rounded-[10px] border-2 bg-sand transition-all',
                i === active
                  ? 'border-accent'
                  : 'border-line hover:border-muted',
              )}
            >
              <Image
                src={src}
                alt={`${name} thumbnail ${i + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
