'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, PackageX, Trash2, TriangleAlert } from 'lucide-react';
import { deleteProduct, getProducts } from '@/lib/store';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import ProductForm from '../ProductForm';

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const found = getProducts().find((p) => p.id === params.id);
    setProduct(found);
    setLoaded(true);
  }, [params.id]);

  const handleDelete = () => {
    if (!product) return;
    if (window.confirm(`Delete "${product.name}"? This cannot be undone.`)) {
      deleteProduct(product.id);
      router.push('/admin/products');
    }
  };

  if (!loaded) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
        <div className="h-64 animate-pulse rounded-xl bg-slate-200" />
      </div>
    );
  }

  if (!product) {
    return (
      <EmptyState
        icon={PackageX}
        title="Product not found"
        hint="This product may have been deleted. Return to the product list to keep managing your catalog."
        action={
          <Link href="/admin/products">
            <Button variant="primary">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to products
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
        >
          <ArrowLeft className="h-4 w-4" /> Back to products
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Edit Product</h1>
        <p className="mt-1 text-sm text-slate-500">
          Updating <span className="font-medium text-slate-700">{product.name}</span>. Changes go live in the store as soon as you save.
        </p>
      </div>

      <ProductForm key={product.id} product={product} mode="edit" />

      <Card className="border-rose-200 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
            <div>
              <h2 className="text-base font-semibold text-slate-900">Danger zone</h2>
              <p className="mt-1 text-sm text-slate-500">
                Deleting removes this product from the store and all category listings permanently.
              </p>
            </div>
          </div>
          <Button type="button" variant="danger" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete product
          </Button>
        </div>
      </Card>
    </div>
  );
}
