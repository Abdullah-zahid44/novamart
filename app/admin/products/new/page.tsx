'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ProductForm from '../ProductForm';

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#A39A89] transition hover:text-[#E4572E]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to products
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#F2EBDD] [font-family:var(--font-display)]">
          New product
        </h1>
        <p className="mt-1.5 text-sm text-[#A39A89]">
          Fill in the details. The product goes live in the store the moment you save it.
        </p>
      </div>
      <ProductForm mode="new" />
    </div>
  );
}
