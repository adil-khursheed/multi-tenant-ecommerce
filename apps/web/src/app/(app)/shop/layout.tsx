import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

import { MobileFilterBar } from "@/components/Shop/MobileFilterBar";
import { ShopHeader } from "@/components/Shop/ShopHeader";
import { Sidebar } from "@/components/Shop/Sidebar";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  void prefetch(trpc.category.getAllCategories.queryOptions());

  return (
    <Suspense fallback={null}>
      <div className="container flex flex-col gap-4 my-10 pb-4">
        {/* Mobile Filter Bar (Sticky on mobile) */}
        <HydrateClient>
          <ErrorBoundary fallback={<div>Something went wrong!</div>}>
            <Suspense>
              <MobileFilterBar />
            </Suspense>
          </ErrorBoundary>
        </HydrateClient>

        {/* Header Zone */}
        <ShopHeader />

        <div className="flex flex-col md:flex-row items-start justify-between gap-16 md:gap-4 relative">
          {/* Desktop Sidebar */}
          <HydrateClient>
            <ErrorBoundary fallback={<div>Something went wrong!</div>}>
              <Suspense>
                <Sidebar />
              </Suspense>
            </ErrorBoundary>
          </HydrateClient>

          {/* Main Content Area */}
          <div className="min-h-screen w-full flex-1">{children}</div>
        </div>
      </div>
    </Suspense>
  );
}
