"use client";

import React, { useEffect, useMemo, useState } from "react";

import { useCurrency } from "@payloadcms/plugin-ecommerce/client/react";

import { AnimatePresence, motion } from "motion/react";

import { AddToCart } from "@/components/Cart/AddToCart";
import { Media } from "@/components/Media";
import { Price } from "@/components/Price";
import type { Product, Variant } from "@/payload-types";
import { useSearchParams } from "next/navigation";

export const StickyBottomBar: React.FC<{ product: Product }> = ({
  product,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const { currency } = useCurrency();
  const searchParams = useSearchParams();

  const displayPrice = useMemo(() => {
    const basePriceField = `priceIn${currency.code}` as keyof Product;
    const basePrice = (product[basePriceField] as number) ?? 0;

    if (product.enableVariants && searchParams) {
      const variantId = searchParams.get("variant");
      if (variantId && product.variants?.docs) {
        const variant = product.variants.docs.find(
          (v) => typeof v === "object" && String(v.id) === variantId,
        ) as Variant | undefined;
        if (variant) {
          return variant.effectivePrice ?? basePrice;
        }
      }
    }

    return product.effectivePrice ?? basePrice;
  }, [product, currency.code, searchParams]);

  useEffect(() => {
    // We observe the main AddToCart button in ProductInfo
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          // If the main add to cart button is out of view (above the viewport), show sticky bar
          setIsVisible(entry.boundingClientRect.y < 0 && !entry.isIntersecting);
        }
      },
      { threshold: 0 },
    );

    // Wait a moment for DOM to paint
    setTimeout(() => {
      const mainAddToCart = document.querySelector("[data-main-add-to-cart]");
      if (mainAddToCart) {
        observer.observe(mainAddToCart);
      }
    }, 500);

    return () => observer.disconnect();
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-t border-border shadow-2xl py-3 px-4 md:px-8 flex items-center justify-between gap-4"
        >
          <div className="hidden sm:flex items-center gap-4 flex-1">
            {product.meta?.image && typeof product.meta.image === "object" && (
              <div className="w-12 h-12 shrink-0 rounded bg-muted overflow-hidden">
                <Media
                  resource={product.meta.image}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-medium text-sm line-clamp-1">
                {product.title}
              </span>
              <Price
                amount={displayPrice}
                className="text-sm text-muted-foreground font-medium"
              />
            </div>
          </div>

          <div className="flex-1 sm:flex-none w-full sm:w-auto max-w-sm">
            <AddToCart product={product} className="w-full shadow-lg" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
