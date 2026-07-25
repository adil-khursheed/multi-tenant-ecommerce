"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { Product, Variant } from "@/payload-types";

type Props = {
  product: Product;
};

export const StockIndicator: React.FC<Props> = ({ product }) => {
  const searchParams = useSearchParams();

  const variants = product.variants?.docs || [];

  const selectedVariant = useMemo<Variant | undefined>(() => {
    if (product.enableVariants && variants.length) {
      const variantId = searchParams.get("variant");
      const validVariant = variants.find((variant) => {
        if (typeof variant === "object") {
          return String(variant.id) === variantId;
        }
        return String(variant) === variantId;
      });

      if (validVariant && typeof validVariant === "object") {
        return validVariant;
      }
    }

    return undefined;
  }, [product.enableVariants, searchParams, variants]);

  const stockQuantity = useMemo(() => {
    if (product.enableVariants) {
      if (selectedVariant) {
        return selectedVariant.inventory || 0;
      }
    }
    return product.inventory || 0;
  }, [product.enableVariants, selectedVariant, product.inventory]);

  if (product.enableVariants && !selectedVariant) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 mt-6">
      {stockQuantity >= 10 && (
        <>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[12px] text-emerald-600 font-medium">
            In Stock
          </span>
        </>
      )}
      {stockQuantity < 10 && stockQuantity > 0 && (
        <>
          <div className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
          <span className="text-[12px] text-warning font-medium">
            Only {stockQuantity} left in stock
          </span>
        </>
      )}
      {(stockQuantity === 0 || !stockQuantity) && (
        <>
          <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
          <span className="text-[12px] text-destructive font-medium">
            Out of stock
          </span>
        </>
      )}
    </div>
  );
};
