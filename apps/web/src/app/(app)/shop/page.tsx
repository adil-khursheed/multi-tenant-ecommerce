import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import type { Metadata } from "next";

import ShopProducts, { ShopProductsSkeleton } from "@/components/Shop";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export const metadata: Metadata = {
  description: "Search for products in the store.",
  title: "Shop",
};

type SearchParams = { [key: string]: string | string[] | undefined };

type Props = {
  searchParams: Promise<SearchParams>;
};

export default async function ShopPage({ searchParams }: Props) {
  const {
    q: searchValue,
    sort,
    category,
    priceRange,
    size,
    color,
    brand,
    rating,
    occasion,
    material,
  } = (await searchParams) as {
    q?: string;
    sort?: string;
    category?: string;
    priceRange?: string;
    size?: string;
    color?: string;
    brand?: string;
    rating?: string;
    occasion?: string;
    material?: string;
  };

  void prefetch(
    trpc.product.getAllProducts.infiniteQueryOptions(
      {
        category,
        sort,
        searchValue,
        priceRange,
        size,
        color,
        brand,
        rating,
        occasion,
        material,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        initialCursor: 1,
      },
    ),
  );

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<div>Something went wrong!</div>}>
        <Suspense fallback={<ShopProductsSkeleton />}>
          <ShopProducts />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
}
