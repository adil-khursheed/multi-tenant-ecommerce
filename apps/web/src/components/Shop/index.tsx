"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useSuspenseInfiniteQuery } from "@tanstack/react-query";

import {
  ProductGridItem,
  ProductGridItemSkeleton,
} from "@/components/ProductGridItem";
import { useTRPC } from "@/trpc/client";
import { cn } from "@/utilities/cn";
import { ControlsBar } from "./ControlsBar";
import { ScrollToTop } from "./ScrollToTop";

const ShopProducts = () => {
  const searchParams = useSearchParams();

  const searchValue = searchParams.get("q") ?? undefined;
  const category = searchParams.get("category") ?? undefined;
  const sort = searchParams.get("sort") ?? undefined;
  const priceRange = searchParams.get("priceRange") ?? undefined;
  const size = searchParams.get("size") ?? undefined;
  const color = searchParams.get("color") ?? undefined;
  const brand = searchParams.get("brand") ?? undefined;
  const rating = searchParams.get("rating") ?? undefined;
  const occasion = searchParams.get("occasion") ?? undefined;
  const material = searchParams.get("material") ?? undefined;

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const trpc = useTRPC();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(
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

  // Flatten all pages into a single array of products
  const products = data.pages.flatMap((page) => page.products.docs);

  const totalDocs = data.pages[0]?.products.totalDocs ?? 0;

  // Intersection Observer for automatic infinite scroll
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0,
      rootMargin: "200px",
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [handleObserver]);

  const resultsText = totalDocs > 1 ? "results" : "result";

  return (
    <div className="flex-1 w-full relative">
      {searchValue ? (
        <p className="mb-4 text-muted-foreground">
          {totalDocs === 0
            ? "There are no products that match "
            : `Showing ${totalDocs} ${resultsText} for `}
          <span className="font-bold text-foreground">
            &quot;{searchValue}&quot;
          </span>
        </p>
      ) : null}

      {!searchValue && products.length === 0 && (
        <p className="mb-4 text-muted-foreground">
          No products found. Please try different filters.
        </p>
      )}

      {products.length > 0 ? (
        <>
          <ControlsBar
            totalDocs={totalDocs}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
          <div
            className={cn(
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10"
                : "flex flex-col",
            )}
          >
            {products.map((product) => (
              <ProductGridItem
                key={product.id}
                product={product}
                viewMode={viewMode}
              />
            ))}
          </div>
        </>
      ) : null}

      {/* Invisible sentinel element that triggers the next page fetch */}
      <div ref={loadMoreRef}>
        {isFetchingNextPage && <ShopProductsSkeleton />}
      </div>

      <ScrollToTop />
    </div>
  );
};

export default ShopProducts;

export const ShopProductsSkeleton = () => {
  return (
    <div className="w-full mt-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {Array.from({ length: 20 }).map((_, i) => (
          <ProductGridItemSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};
