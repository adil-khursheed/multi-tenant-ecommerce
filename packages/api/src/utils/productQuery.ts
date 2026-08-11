import type { Where } from "payload";

export type WhereClause = Where;

export type ProductFilter =
  | "none"
  | "newArrivals"
  | "featured"
  | "bestsellers"
  | "flashSale";

const PRODUCT_FILTER_WHERE: Record<string, WhereClause> = {
  newArrivals: { "flags.isNewArrival": { equals: true } },
  featured: { "flags.isFeatured": { equals: true } },
  bestsellers: { "flags.isBestseller": { equals: true } },
  flashSale: { isFlashSale: { equals: true } },
};

export function productFilterToWhere(filter?: ProductFilter | null): WhereClause | null {
  if (!filter || filter === "none") return null;
  return PRODUCT_FILTER_WHERE[filter] ?? null;
}

export function flattenRelationshipIds<T>(values: (string | T)[] | null | undefined): string[] {
  if (!values?.length) return [];
  return values.map((value) => {
    if (typeof value === "object" && value !== null && "id" in value) {
      return (value as { id: string }).id;
    }
    return value as string;
  });
}

export function buildProductWhere({
  filter,
  categoryIds,
}: {
  filter?: ProductFilter | null;
  categoryIds?: string[];
}): WhereClause | undefined {
  const conditions: WhereClause[] = [];

  if (categoryIds && categoryIds.length > 0) {
    conditions.push({ categories: { in: categoryIds } });
  }

  const flagWhere = productFilterToWhere(filter);
  if (flagWhere) {
    conditions.push(flagWhere);
  }

  if (conditions.length === 0) return undefined;
  if (conditions.length === 1) return conditions[0];
  return { and: conditions };
}
