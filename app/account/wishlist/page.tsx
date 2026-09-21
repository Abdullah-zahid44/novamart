"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";
import { getProducts, getWishlist, toggleWishlist } from "@/lib/store";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductCard } from "@/components/shop/ProductCard";

export default function WishlistPage() {
  const [ids, setIds] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setIds(getWishlist());
    setReady(true);
  }, []);

  if (!ready) return null;

  const products: Product[] = getProducts().filter((p) => ids.includes(p.id));

  function handleRemove(productId: string) {
    setIds(toggleWishlist(productId));
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Wishlist</h1>
        <p className="mt-1 text-sm text-gray-600">
          {products.length === 0
            ? "Save items you love and find them here later."
            : `${products.length} ${products.length === 1 ? "item" : "items"} you're saving for later.`}
        </p>
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          hint="Tap the heart on any product to save it here for later."
          action={
            <Link href="/shop">
              <Button variant="primary">Discover products</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <div key={p.id} className="flex flex-col gap-2">
              <ProductCard product={p} />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full text-gray-500 hover:text-rose-600"
                onClick={() => handleRemove(p.id)}
              >
                <Trash2 className="mr-1.5 h-4 w-4" />
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
