import React from "react";
import Link from "next/link";

import type { Product } from "@/payload-types";
import { ProductGridItem } from "../ProductGridItem";

export const RelatedProductsGrid: React.FC<{ relatedProducts: Product[] }> = ({
  relatedProducts,
}) => {
  if (!relatedProducts || relatedProducts.length === 0) return null;

  return (
    <div className="mt-24">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-heading font-medium tracking-tight">
          You Might Also Like
        </h2>
        <Link
          href="/shop"
          className="text-sm font-medium hover:underline underline-offset-4 hidden sm:block"
        >
          Shop All
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {relatedProducts.map((product) => (
          <ProductGridItem key={product.id} product={product} viewMode="grid" />
        ))}
      </div>
    </div>
  );
};
