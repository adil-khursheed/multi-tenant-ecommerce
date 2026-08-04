import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import WishlistProducts, {
  WishlistProductsSkeleton,
} from "@/components/Wishlist";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { getUser } from "@/utilities/getUser";
import { mergeOpenGraph } from "@/utilities/mergeOpenGraph";

export default async function WishlistPage() {
  const user = await getUser();

  if (!user) {
    redirect(
      `/login?warning=${encodeURIComponent("Please login to view your wishlist.")}`,
    );
  }

  void prefetch(trpc.wishlist.getAll.queryOptions());

  return (
    <HydrateClient>
      <ErrorBoundary fallback={<div>Something went wrong!</div>}>
        <Suspense fallback={<WishlistProductsSkeleton />}>
          <WishlistProducts />
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
}

export const metadata: Metadata = {
  description: "Your wishlisted products.",
  openGraph: mergeOpenGraph({
    title: "Wishlist",
    url: "/wishlist",
  }),
  title: "Wishlist",
};
