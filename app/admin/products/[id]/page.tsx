'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, PackageX, Trash2, TriangleAlert } from 'lucide-react';
import { deleteProduct, getProducts } from '@/lib/store';
import type { Product } from '@/lib/types';
import { Btn, ConfirmDialog, EmptyBox, Panel } from '../../_ui';
import ProductForm from '../ProductForm';

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const found = getProducts().find((p) => p.id === params.id);
    setProduct(found);
    setLoaded(true);
  }, [params.id]);

  const handleDelete = () => {
    if (!product) return;
    deleteProduct(product.id);
    router.push('/admin/products');
  };

  if (!loaded) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-[#1E1A14]" />
        <div className="h-64 animate-pulse rounded-[14px] bg-[#1E1A14]" />
      </div>
    );
  }

  if (!product) {
    return (
      <EmptyBox
        icon={PackageX}
        title="Product not found"
        hint="This product may have been deleted. Head back to the product list to keep managing the catalog."
        action={
          <Link href="/admin/products">
            <Btn>
              <ArrowLeft className="h-4 w-4" /> Back to products
            </Btn>
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
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#A39A89] transition hover:text-[#E4572E]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to products
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#F2EBDD] [font-family:var(--font-display)]">
          Edit product
        </h1>
        <p className="mt-1.5 text-sm text-[#A39A89]">
          Updating <span className="font-semibold text-[#F2EBDD]">{product.name}</span>. Changes go
          live in the store as soon as you save.
        </p>
      </div>

      <ProductForm key={product.id} product={product} mode="edit" />

      <Panel className="border-[#E26D5A]/25 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-[#E26D5A]" />
            <div>
              <h2 className="text-[15px] font-semibold text-[#F2EBDD]">Danger zone</h2>
              <p className="mt-1 text-sm text-[#A39A89]">
                Deleting removes this product from the store and all listings, permanently.
              </p>
            </div>
          </div>
          <Btn variant="danger" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="h-4 w-4" /> Delete product
          </Btn>
        </div>
      </Panel>

      {confirmDelete && product && (
        <ConfirmDialog
          title="Delete product?"
          body={
            <p>
              <span className="font-semibold text-[#F2EBDD]">“{product.name}”</span> will be removed
              from the store permanently. This cannot be undone.
            </p>
          }
          confirmLabel="Delete product"
          danger
          onCancel={() => setConfirmDelete(false)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
