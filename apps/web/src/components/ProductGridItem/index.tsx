import React from "react";
import Link from "next/link";

import { FavouriteIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import clsx from "clsx";
import { AnimatePresence, motion } from "motion/react";

import { Media } from "@/components/Media";
import { Price } from "@/components/Price";
import { StarRating } from "@/components/StarRating";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@/payload-types";

type Props = {
  product: Partial<Product>;
  viewMode?: "grid" | "list";
};

export const ProductGridItem: React.FC<Props> = ({
  product,
  viewMode = "grid",
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isWishlisted, setIsWishlisted] = React.useState(false);

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
    description,
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
          className="w-[200px] h-[240px] bg-secondary overflow-hidden shrink-0 group"
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
          <p className="font-sans text-[14px] text-secondary-foreground mb-4 max-w-xl line-clamp-2">
            Experience timeless elegance with this handcrafted piece. Made from
            premium quality materials with meticulous attention to detail.
          </p>
          <div className="flex items-center gap-6 mb-4">
            {/* Color swatches placeholder */}
            <div className="flex gap-2">
              <div
                className="w-4 h-4 rounded-full border border-border"
                style={{ backgroundColor: "#1A1714" }}
              />
              <div
                className="w-4 h-4 rounded-full border border-border"
                style={{ backgroundColor: "#C19A6B" }}
              />
            </div>
            {/* Size options placeholder */}
            <div className="flex gap-2">
              {["S", "M", "L"].map((s) => (
                <span
                  key={s}
                  className="w-8 h-8 flex items-center justify-center border border-border font-sans text-[11px] text-secondary-foreground"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
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
            <button className="hidden md:flex border border-border text-foreground px-8 py-2.5 font-sans font-medium text-[13px] uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors rounded-[2px]">
              Save
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative"
    >
      <Link
        href={`/products/${product.slug}`}
        className="block relative aspect-4/5 bg-secondary overflow-hidden"
      >
        {image && (
          <Media
            className="w-full h-full object-cover transition duration-300 ease-out group-hover:scale-[1.03]"
            imgClassName="w-full h-full object-cover"
            resource={image}
          />
        )}

        {ribbon && (
          <div
            className={clsx(
              "absolute top-0 left-0 px-3 py-1 font-sans text-[9px] font-bold uppercase tracking-widest z-20",
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

        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 z-10 pointer-events-none"
            >
              <div className="absolute top-3 left-3 flex flex-col gap-2 pointer-events-auto">
                {typeof tenant === "object" && tenant?.storeName && (
                  <span className="font-sans text-[9px] uppercase tracking-widest text-foreground bg-card/90 backdrop-blur-md border border-border/40 px-2.5 py-1">
                    {tenant.storeName}
                  </span>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsWishlisted(!isWishlisted);
                }}
                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-card/90 rounded-full border border-border/40 hover:bg-card transition-colors pointer-events-auto"
              >
                <motion.div
                  animate={isWishlisted ? { scale: [1, 1.3, 1] } : {}}
                >
                  <HugeiconsIcon
                    icon={FavouriteIcon}
                    className={
                      isWishlisted
                        ? "text-primary fill-primary"
                        : "text-foreground"
                    }
                    size={16}
                  />
                </motion.div>
              </button>

              <motion.div
                initial={{ y: 40 }}
                animate={{ y: 0 }}
                className="absolute bottom-0 left-0 w-full pointer-events-auto"
              >
                <button
                  onClick={(e) => e.preventDefault()}
                  className="w-full h-10 bg-foreground text-background font-sans font-medium text-[12px] uppercase tracking-wider flex items-center justify-center group/btn hover:bg-primary transition-colors"
                >
                  <span className="group-hover/btn:hidden">Quick Add</span>
                  <div className="hidden group-hover/btn:flex gap-4">
                    {["S", "M", "L"].map((s, i) => (
                      <motion.span
                        key={s}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                        className="hover:text-white/80"
                      >
                        {s}
                      </motion.span>
                    ))}
                  </div>
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>

      <div className="mt-4">
        {categories?.[0] && typeof categories[0] === "object" && (
          <span className="block font-sans text-[10px] uppercase tracking-[0.1em] text-accent-foreground mb-1">
            {categories[0].name}
          </span>
        )}
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-sans font-medium text-[14px] text-foreground line-clamp-2 mb-1 hover:underline">
            {title}
          </h3>
        </Link>

        {/* Color swatches placeholder */}
        <div className="flex items-center gap-2 mb-2 h-3">
          <div className="flex gap-1">
            <div
              className="size-2 rounded-full border border-border"
              style={{ backgroundColor: "#1A1714" }}
            />
            <div
              className="size-2 rounded-full border border-border"
              style={{ backgroundColor: "#C19A6B" }}
            />
          </div>
        </div>

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
