"use client";

import React from "react";

import { ProductGridItem } from "@/components/ProductGridItem";
import type { Product } from "@/payload-types";
import { cn } from "@/utilities/cn";

export const FiveItemGridClient: React.FC<{ products: Product[] }> = ({
  products,
}) => {
  if (!products || products.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4 lg:grid-rows-2">
      {products.map((product, index) => {
        const isHero = index === 0;

        return (
          <div
            key={product.id}
            style={{ animationDelay: `${index * 70}ms` }}
            className={cn(
              "animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500 ease-out motion-reduce:animate-none",
              isHero
                ? "col-span-2 row-span-1 lg:row-span-2 lg:[&>div]:flex lg:[&>div]:h-full lg:[&>div]:flex-col lg:[&>div>a]:aspect-auto lg:[&>div>a]:min-h-0 lg:[&>div>a]:flex-1"
                : "col-span-1 row-span-1",
            )}
          >
            <ProductGridItem product={product} />
          </div>
        );
      })}
    </div>
  );
};
