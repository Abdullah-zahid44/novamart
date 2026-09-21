'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/cn';

export interface SmartImageProps {
  src: string;
  alt: string;
  /** Serif caption shown on the placeholder if the image file is missing. */
  label?: string;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  priority?: boolean;
}

/**
 * next/image that degrades to a warm sand placeholder block (never a broken img)
 * when the generated asset in public/images/ is missing.
 */
export function SmartImage({
  src,
  alt,
  label,
  className,
  imgClassName,
  sizes,
  priority,
}: SmartImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn('flex items-center justify-center bg-sand', className)}
      >
        {label && (
          <span className="px-8 text-center font-display text-xl italic leading-snug text-muted">
            {label}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden bg-sand', className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        onError={() => setFailed(true)}
        className={cn('object-cover', imgClassName)}
      />
    </div>
  );
}
