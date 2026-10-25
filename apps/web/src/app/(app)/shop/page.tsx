import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import type { Metadata } from "next";

import ShopProducts, { ShopProductsSkeleton } from "@/components/Shop";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { mergeOpenGraph } from "@/utilities/mergeOpenGraph";
import { getTwitterMetadata, HOME_TWITTER_IMAGE } from "@/utilities/seo";

type SearchParams = { [key: string]: string | string[] | undefined };

type Props = {
  searchParams: Promise<SearchParams>;
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const params = await searchParams;
  const searchValue = typeof params.q === "string" ? params.q : undefined;
  const hasFilters = [
    "q",
    "category",
    "priceRange",
    "size",
    "color",
    "brand",
    "rating",
    "occasion",
    "material",
    "sort",
  ].some((key) => Boolean(params[key]));

  const title = searchValue ? `Search: ${searchValue}` : "Shop";
  const description = searchValue
    ? `Products matching “${searchValue}” from independent sellers on DTlea.`
    : "Browse products from independent sellers on DTlea.";

  return {
    alternates: {
      canonical: "/shop",
    },
    description,
    openGraph: mergeOpenGraph({
      description,
      title,
      url: "/shop",
    }),
    robots: hasFilters ? { follow: true, index: false } : undefined,
    title,
    twitter: getTwitterMetadata({
      description,
      images: [HOME_TWITTER_IMAGE],
      title,
    }),
  };
}

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
