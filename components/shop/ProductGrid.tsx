'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import type { Product } from '@/lib/types';
import { ProductCard } from './ProductCard';

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

/** Product grid with staggered scroll reveal. */
export function ProductGrid({ products }: { products: Product[] }) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
      transition={{ staggerChildren: 0.06 }}
    >
      {products.map((product) => (
        <motion.div key={product.id} variants={itemVariants}>
          <ProductCard product={product} />
        </motion.div>
      ))}
    </motion.div>
  );
}
