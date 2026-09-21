'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

export interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Transition delay in seconds — for staggered groups. */
  delay?: number;
  /** Starting vertical offset in px. */
  y?: number;
}

/**
 * Scroll-reveal wrapper: fades + slides up once when scrolled into view.
 * Renders a plain div when the user prefers reduced motion.
 */
export function Reveal({ children, className, delay = 0, y = 24 }: RevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
