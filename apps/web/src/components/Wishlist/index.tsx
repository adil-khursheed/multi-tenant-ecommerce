"use client";

import Link from "next/link";

import { useSuspenseQuery } from "@tanstack/react-query";

import {
  ProductGridItem,
  ProductGridItemSkeleton,
} from "@/components/ProductGridItem";
import { useTRPC } from "@/trpc/client";

const WishlistProducts = () => {
  const trpc = useTRPC();

  const { data } = useSuspenseQuery(
    trpc.wishlist.getAll.queryOptions(),
  );

  const products = (data.wishlist as { id: string }[]).filter(
    (item): item is { id: string } & Record<string, unknown> =>
      typeof item === "object" && item !== null && "id" in item,
  );

  return (
    <div className="w-full">
      <div className="border p-8 rounded-lg bg-primary-foreground w-full">
        <h1 className="text-3xl font-medium mb-8">Wishlist</h1>

        {products.length === 0 && (
          <div className="flex flex-col gap-4">
            <p className="text-muted-foreground">
              You haven&apos;t added any products to your wishlist yet.
            </p>
            <Link
              href="/shop"
              className="text-primary underline underline-offset-4 hover:text-primary/80 w-fit"
            >
              Browse Products
            </Link>
          </div>
        )}

        {products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
            {products.map((product) => (
              <ProductGridItem
                key={product.id}
                product={product}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistProducts;

export const WishlistProductsSkeleton = () => {
  return (
    <div className="w-full">
      <div className="border p-8 rounded-lg bg-primary-foreground w-full">
        <h1 className="text-3xl font-medium mb-8">Wishlist</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductGridItemSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};
