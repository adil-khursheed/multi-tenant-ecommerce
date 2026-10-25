"use client";

import React from "react";
import Link from "next/link";

import clsx from "clsx";
import { motion } from "motion/react";

import { Media } from "@/components/Media";
import { Price } from "@/components/Price";
import { StarRating } from "@/components/StarRating";
import { Skeleton } from "@/components/ui/skeleton";
import { WishlistButton } from "@/components/WishlistButton";
import type { Product } from "@/payload-types";

type Props = {
  product: Partial<Product>;
  viewMode?: "grid" | "list";
};

export const ProductGridItem: React.FC<Props> = ({
  product,
  viewMode = "grid",
}) => {
  const {
    gallery,
    priceInINR,
    title,
    tenant,
    ratings,
    effectivePrice,
    minEffectivePrice,
    maxEffectivePrice,
    enableVariants,
    discountPercent,
    flags,
    categories,
    shortDescription,
  } = product;

  const image =
    gallery?.[0]?.image && typeof gallery[0]?.image !== "string"
      ? gallery[0]?.image
      : false;

  const ribbon = flags?.isNewArrival
    ? "NEW"
    : flags?.isExclusive
      ? "SALE"
      : flags?.isBestseller
        ? "TRENDING"
        : null;

  if (viewMode === "list") {
    return (
      <motion.div
        layout
        className="flex gap-8 border-b border-border pb-8 mb-8 last:border-0 relative"
      >
        <Link
          className="w-50 h-60 bg-secondary overflow-hidden shrink-0 group"
          href={`/products/${product.slug}`}
        >
          {image && (
            <Media
              className="w-full h-full object-cover"
              imgClassName="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-[1.05]"
              resource={image}
            />
          )}
        </Link>
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            {typeof tenant === "object" && tenant?.storeName && (
              <span className="font-sans text-[9px] uppercase tracking-widest text-foreground bg-card/90 border border-border/40 px-2 py-1">
                {tenant.storeName}
              </span>
            )}
            {categories?.[0] && typeof categories[0] === "object" && (
              <span className="font-sans text-[10px] uppercase tracking-[0.1em] text-accent-foreground">
                {categories[0].name}
              </span>
            )}
          </div>
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-serif text-[22px] text-foreground mb-2 leading-tight hover:underline">
              {title}
            </h3>
          </Link>
          {shortDescription && (
            <p className="font-sans text-[14px] text-secondary-foreground mb-4 max-w-xl line-clamp-2">
              {shortDescription}
            </p>
          )}

          <div className="flex items-center gap-4">
            {ratings &&
              typeof ratings.average === "number" &&
              ratings.count &&
              ratings.count > 0 && (
                <div className="flex items-center gap-1">
                  <StarRating rating={ratings.average} iconClassName="size-3" />
                  <span className="font-mono text-[11px] text-muted-foreground">
                    ({ratings.count})
                  </span>
                </div>
              )}
            <div className="flex items-baseline gap-2 font-mono font-medium text-[16px] text-primary">
              {enableVariants &&
              minEffectivePrice !== undefined &&
              maxEffectivePrice !== undefined &&
              minEffectivePrice !== maxEffectivePrice ? (
                <Price
                  lowestAmount={minEffectivePrice ?? 0}
                  highestAmount={maxEffectivePrice ?? 0}
                />
              ) : (
                <Price
                  amount={effectivePrice ?? priceInINR ?? 0}
                  originalAmount={priceInINR ?? undefined}
                  discountPercent={discountPercent ?? undefined}
                />
              )}
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button className="bg-primary text-primary-foreground px-8 py-2.5 font-sans font-medium text-[13px] uppercase tracking-wider rounded-[2px] hover:bg-primary/90 transition-colors">
              Add to Bag
            </button>
            <WishlistButton
              productId={product.id!}
              className="hidden md:flex border border-border text-foreground px-8 py-2.5 font-sans font-medium text-[13px] uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors rounded-[2px] items-center justify-center gap-2"
            />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div layout className="group relative">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-4/5 overflow-hidden bg-secondary shadow-2xs transition-shadow duration-300 group-hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        {image && (
          <Media
            className="h-full w-full object-cover"
            imgClassName="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
            resource={image}
          />
        )}

        {ribbon && (
          <div
            className={clsx(
              "absolute top-0 left-0 px-3 py-1 font-sans text-[9px] font-bold uppercase tracking-widest z-10",
              ribbon === "NEW"
                ? "bg-primary text-primary-foreground"
                : ribbon === "SALE"
                  ? "bg-foreground text-background"
                  : "bg-accent-foreground text-background",
            )}
          >
            {ribbon}
          </div>
        )}
      </Link>

      {typeof tenant === "object" && tenant?.storeName && (
        <span className="pointer-events-none absolute left-3 top-3 z-20 max-w-[70%] -translate-y-1 truncate border border-border/40 bg-card/90 px-2.5 py-1 font-sans text-[9px] uppercase tracking-widest text-foreground opacity-0 backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
          {tenant.storeName}
        </span>
      )}

      <WishlistButton
        productId={product.id!}
        className="absolute right-3 top-3 z-20 flex size-8 items-center justify-center rounded-full border border-border/40 bg-card/90 pointer-events-auto opacity-100 transition-opacity duration-300 hover:bg-card md:pointer-events-none md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:opacity-100 md:group-focus-within:pointer-events-auto md:group-focus-within:opacity-100"
      />

      <div className="mt-4">
        {categories?.[0] && typeof categories[0] === "object" && (
          <span className="block font-sans text-[10px] uppercase tracking-[0.1em] text-accent-foreground mb-1">
            {categories[0].name}
          </span>
        )}
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-sans font-medium text-[14px] text-foreground line-clamp-2 mb-1 decoration-primary/40 underline-offset-4 hover:underline">
            {title}
          </h3>
        </Link>

        {ratings &&
          typeof ratings.average === "number" &&
          ratings.count &&
          ratings.count > 0 && (
            <div className="flex items-center gap-2 mb-2 min-h-4">
              <StarRating rating={ratings.average} iconClassName="size-3" />
              <span className="font-mono text-[10px] text-muted-foreground">
                ({ratings.count})
              </span>
            </div>
          )}

        <div className="flex items-baseline gap-2 font-mono font-medium text-[16px] text-primary">
          {enableVariants &&
          minEffectivePrice !== undefined &&
          maxEffectivePrice !== undefined &&
          minEffectivePrice !== maxEffectivePrice ? (
            <Price
              lowestAmount={minEffectivePrice ?? 0}
              highestAmount={maxEffectivePrice ?? 0}
            />
          ) : (
            <Price
              amount={effectivePrice ?? priceInINR ?? 0}
              originalAmount={priceInINR ?? undefined}
              discountPercent={discountPercent ?? undefined}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const ProductGridItemSkeleton = () => {
  return (
    <div className="relative inline-block aspect-4/5 h-full w-full">
      <Skeleton className="w-full h-full rounded-none" />
      <div className="mt-3 flex flex-col gap-2">
        <Skeleton className="h-2 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
};
