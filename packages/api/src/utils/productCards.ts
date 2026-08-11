import type { Payload } from "payload";

import type { WhereClause } from "./productQuery";

/**
 * Select + populate used to render product cards in shop grids and
 * block layouts (grids, carousel, archive). Kept in one place so every
 * consumer returns an identical product shape.
 */
export const CARD_SELECT = {
  title: true,
  slug: true,
  shortDescription: true,
  gallery: true,
  categories: true,
  priceInINR: true,
  tenant: true,
  ratings: true,
  discountPercent: true,
  effectivePrice: true,
  minEffectivePrice: true,
  maxEffectivePrice: true,
  flags: true,
} as const;

export async function fetchCardProducts(
  payload: Payload,
  {
    where,
    limit,
    sort,
    select,
  }: {
    where?: WhereClause;
    limit?: number;
    sort?: string;
    select?: Record<string, unknown>;
  } = {},
) {
  return payload.find({
    collection: "products",
    limit,
    draft: false,
    overrideAccess: false,
    context: {
      isStorefront: true,
    },
    select: select ? { ...CARD_SELECT, ...select } : CARD_SELECT,
    populate: {
      tenants: {
        storeName: true,
        storeSlug: true,
      },
      variants: {
        title: true,
        priceInINR: true,
        effectivePrice: true,
        inventory: true,
        options: true,
      },
    },
    ...(where ? { where } : {}),
    ...(sort ? { sort } : {}),
  });
}
