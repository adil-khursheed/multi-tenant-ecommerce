import React from "react";
import Link from "next/link";

import { FavouriteIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import clsx from "clsx";

import { Media } from "@/components/Media";
import { Price } from "@/components/Price";
import { StarRating } from "@/components/StarRating";
import type { Product } from "@/payload-types";
import { Button } from "../ui/button";

type Props = {
  product: Partial<Product>;
};

export const ProductGridItem: React.FC<Props> = ({ product }) => {
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
  } = product;

  const image =
    gallery?.[0]?.image && typeof gallery[0]?.image !== "string"
      ? gallery[0]?.image
      : false;

  return (
    <Link
      className="relative inline-block aspect-9/16 max-w-3xs max-h-[297px] h-full w-full group ease-in-out duration-100 transition-all"
      href={`/products/${product.slug}`}
    >
      {image ? (
        <div className="relative w-full h-full overflow-hidden">
          <Media
            className={clsx(
              "relative w-full h-full object-cover border bg-primary-foreground",
            )}
            height={80}
            imgClassName={clsx("h-full w-full object-cover", {
              "transition duration-300 ease-in-out group-hover:scale-102": true,
            })}
            resource={image}
            width={80}
          />

          <Button
            size={"icon-lg"}
            className={
              "absolute right-2 top-2 opacity-0 group-hover:opacity-100 cursor-pointer rounded-full bg-white hover:bg-white/60 text-primary"
            }
          >
            <HugeiconsIcon icon={FavouriteIcon} />
          </Button>
        </div>
      ) : null}

      <div className="mt-3 flex flex-col gap-1">
        {typeof tenant === "object" && tenant?.storeName && (
          <div className="text-primary text-[10px] tracking-wider uppercase">
            {tenant.storeName}
          </div>
        )}

        <div className="text-sm font-medium w-full break-all">{title}</div>

        {ratings &&
          typeof ratings.average === "number" &&
          typeof ratings.count === "number" &&
          ratings.count > 0 && (
            <div className="flex items-center gap-2">
              <StarRating rating={ratings.average} iconClassName="size-3" />
              <div className="text-xs text-muted-foreground">
                ({ratings.count})
              </div>
            </div>
          )}

        <div className="font-mono font-medium text-base text-primary">
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
    </Link>
  );
};
