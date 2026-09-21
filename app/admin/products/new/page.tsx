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
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
        >
          <ArrowLeft className="h-4 w-4" /> Back to products
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Add Product</h1>
        <p className="mt-1 text-sm text-slate-500">
          Fill in the details below. The product will appear in the store immediately after saving.
        </p>
      </div>
      <ProductForm mode="new" />
    </div>
  );
}
