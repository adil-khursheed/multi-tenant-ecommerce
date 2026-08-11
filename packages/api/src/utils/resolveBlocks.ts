import type { Payload } from "payload";

import type { ResolvedLink } from "./links";
import { resolveLink, resolveLinks } from "./links";
import type { MediaReference } from "./media";
import { fetchCardProducts } from "./productCards";
import {
  buildProductWhere,
  flattenRelationshipIds,
  type ProductFilter,
} from "./productQuery";

// ─── Mobile-facing block shapes ─────────────────────────────────────────────

export type MobileMedia = MediaReference;

export type CarouselItem =
  | {
      type: "product";
      slug: string;
      title?: string | null;
      price: number | null;
      image: MobileMedia;
    }
  | {
      type: "category";
      slug: string;
      name?: string | null;
      image: MobileMedia;
    }
  | {
      type: "collection";
      slug: string;
      name?: string | null;
      coverImage: MobileMedia;
    };

export type CollectionStripItem = {
  slug: string;
  name?: string | null;
  coverImage: MobileMedia;
};

export type CategoryCardItem = {
  id?: string | number;
  slug: string;
  name?: string | null;
  image: MobileMedia;
};

export type CategoryTab = {
  parentName?: string | null;
  parentSlug?: string | null;
  children: CategoryCardItem[];
};

export type CustomTab = {
  tab: string;
  content: unknown;
};

export type MobileBlock =
  | {
      blockType: "banner";
      id?: string | null;
      blockName?: string | null;
      style: string;
      content: unknown;
    }
  | {
      blockType: "cta";
      id?: string | null;
      blockName?: string | null;
      richText: unknown;
      links: ResolvedLink[];
    }
  | {
      blockType: "content";
      id?: string | null;
      blockName?: string | null;
      columns: {
        size?: string | null;
        richText?: unknown;
        link?: ResolvedLink | null;
      }[];
    }
  | {
      blockType: "mediaBlock";
      id?: string | null;
      blockName?: string | null;
      media: MobileMedia;
      caption: unknown;
    }
  | {
      blockType: "archive";
      id?: string | null;
      blockName?: string | null;
      introContent: unknown;
      products: unknown[];
    }
  | {
      blockType: "carousel";
      id?: string | null;
      blockName?: string | null;
      heading: unknown;
      items: CarouselItem[];
    }
  | {
      blockType: "collectionsStrip";
      id?: string | null;
      blockName?: string | null;
      heading: unknown;
      items: CollectionStripItem[];
    }
  | {
      blockType: "threeItemGrid";
      id?: string | null;
      blockName?: string | null;
      products: unknown[];
    }
  | {
      blockType: "fourItemGrid";
      id?: string | null;
      blockName?: string | null;
      categories: CategoryCardItem[];
    }
  | {
      blockType: "fiveItemGrid";
      id?: string | null;
      blockName?: string | null;
      heading: unknown;
      products: unknown[];
    }
  | {
      blockType: "tabs";
      id?: string | null;
      blockName?: string | null;
      heading: unknown;
      contentType: "categories" | "custom";
      categoryTabs: CategoryTab[];
      customTabs: CustomTab[];
    };

// ─── Internal raw types (subset of payload-types) ───────────────────────────

type RawBlock = {
  id?: string | null;
  blockName?: string | null;
  blockType: string;
  [k: string]: unknown;
};

type RawProduct = {
  id: string;
  slug?: string | null;
  title?: string | null;
  priceInINR?: number | null;
  meta?: { image?: MediaReference };
  [k: string]: unknown;
};

type RawCategory = {
  id: string;
  slug?: string | null;
  name?: string | null;
  image?: MediaReference;
  parent?: string | null;
  order?: number | null;
  active?: boolean | null;
};

type RawCollection = {
  id: string;
  slug?: string | null;
  name?: string | null;
  coverImage?: MediaReference;
  active?: boolean | null;
  order?: number | null;
};

function objectItems<T>(values: unknown): T[] {
  if (!Array.isArray(values)) return [];
  return values.filter((v): v is T => typeof v === "object" && v !== null);
}

// ─── Data resolvers (mirrors web server components) ─────────────────────────

async function resolveCarouselItems(
  payload: Payload,
  block: RawBlock,
): Promise<CarouselItem[]> {
  const contentType = block.contentType ?? "products";
  const limit = (block.limit as number | null | undefined) ?? 10;

  if (contentType === "products") {
    let products: RawProduct[] = [];

    if (block.populateBy === "collection") {
      const result = await fetchCardProducts(payload, {
        limit,
        where: buildProductWhere({
          filter: block.productFilter as ProductFilter | null,
          categoryIds: flattenRelationshipIds<{ id: string }>(
            block.categories as never,
          ),
        }),
        ...(block.productFilter && block.productFilter !== "none"
          ? { sort: "-createdAt" }
          : {}),
        select: { meta: { image: true } },
      });
      products = result.docs as RawProduct[];
    } else if ((block.selectedDocs as unknown[] | undefined)?.length) {
      products = (block.selectedDocs as { value: unknown }[])
        .map((doc) =>
          typeof doc.value === "object" ? (doc.value as RawProduct) : null,
        )
        .filter((p): p is RawProduct => p !== null);
    }

    return products.map((product) => ({
      type: "product" as const,
      slug: product.slug ?? "",
      title: product.title,
      price: product.priceInINR ?? 0,
      image: product.meta?.image ?? null,
    }));
  }

  if (contentType === "categories") {
    const result = await payload.find({
      collection: "categories",
      depth: 1,
      limit: limit || undefined,
      where: { active: { equals: true } },
      sort: "order",
    });

    return (result.docs as RawCategory[]).map((category) => ({
      type: "category" as const,
      slug: category.slug ?? "",
      name: category.name,
      image: typeof category.image === "object" ? category.image : null,
    }));
  }

  if (contentType === "collections") {
    const collections = await fetchActiveCollections(payload, { limit });
    return collections.map((collection) => ({
      type: "collection" as const,
      slug: collection.slug ?? "",
      name: collection.name,
      coverImage:
        typeof collection.coverImage === "object"
          ? collection.coverImage
          : null,
    }));
  }

  return [];
}

async function fetchActiveCollections(
  payload: Payload,
  { limit, ids }: { limit?: number; ids?: string[] } = {},
): Promise<RawCollection[]> {
  const now = new Date().toISOString();

  if (ids?.length) {
    const result = await payload.find({
      collection: "collections",
      depth: 1,
      limit: ids.length,
      where: { id: { in: ids } },
    });

    const byId = new Map(
      (result.docs as RawCollection[]).map((doc) => [doc.id, doc]),
    );
    return ids
      .map((id) => byId.get(id))
      .filter((collection): collection is RawCollection => Boolean(collection))
      .filter((collection) => collection.active);
  }

  const result = await payload.find({
    collection: "collections",
    depth: 1,
    limit: limit || 100,
    where: {
      and: [
        { active: { equals: true } },
        {
          or: [
            { startDate: { exists: false } },
            { startDate: { less_than_equal: now } },
          ],
        },
        {
          or: [
            { endDate: { exists: false } },
            { endDate: { greater_than_equal: now } },
          ],
        },
      ],
    },
    sort: "order",
  });

  return result.docs as RawCollection[];
}

async function resolveArchiveProducts(
  payload: Payload,
  block: RawBlock,
): Promise<RawProduct[]> {
  if (block.populateBy === "collection") {
    const categoryIds = flattenRelationshipIds<{ id: string }>(
      block.categories as never,
    );
    const result = await fetchCardProducts(payload, {
      limit: (block.limit as number | null | undefined) || 3,
      where:
        categoryIds.length > 0
          ? { categories: { in: categoryIds } }
          : undefined,
    });
    return result.docs as RawProduct[];
  }

  if ((block.selectedDocs as unknown[] | undefined)?.length) {
    return (block.selectedDocs as { value: unknown }[])
      .map((doc) =>
        typeof doc.value === "object" ? (doc.value as RawProduct) : null,
      )
      .filter((p): p is RawProduct => p !== null);
  }

  return [];
}

async function resolveFiveItemGridProducts(
  payload: Payload,
  block: RawBlock,
): Promise<RawProduct[]> {
  if (block.populateBy === "collection") {
    const filter = block.productFilter as ProductFilter | null;
    const result = await fetchCardProducts(payload, {
      limit: 5,
      where: buildProductWhere({
        filter,
        categoryIds: flattenRelationshipIds<{ id: string }>(
          block.categories as never,
        ),
      }),
      ...(filter && filter !== "none" ? { sort: "-createdAt" } : {}),
    });
    return result.docs as RawProduct[];
  }

  return objectItems<RawProduct>(block.selectedDocs);
}

async function resolveCategoryTabs(
  payload: Payload,
  block: RawBlock,
): Promise<CategoryTab[]> {
  let parents: RawCategory[] = [];

  if ((block.parentCategories as unknown[] | undefined)?.length) {
    parents = objectItems<RawCategory>(block.parentCategories);
  } else {
    const result = await payload.find({
      collection: "categories",
      where: {
        and: [{ parent: { exists: false } }, { active: { equals: true } }],
      },
      sort: "order",
      depth: 0,
      limit: 100,
    });
    parents = result.docs as RawCategory[];
  }

  const parentIds = parents
    .map((parent) => parent?.id)
    .filter((id): id is string => Boolean(id));

  if (parentIds.length === 0) return [];

  const childrenResult = await payload.find({
    collection: "categories",
    where: {
      and: [{ parent: { in: parentIds } }, { active: { equals: true } }],
    },
    sort: "order",
    depth: 1,
    limit: 1000,
  });

  const childrenByParent = new Map<string, RawCategory[]>();
  for (const child of childrenResult.docs as RawCategory[]) {
    const parentId =
      child.parent && typeof child.parent === "object"
        ? (child.parent as { id?: string }).id
        : child.parent;
    if (!parentId) continue;
    const bucket = childrenByParent.get(parentId) ?? [];
    bucket.push(child);
    childrenByParent.set(parentId, bucket);
  }

  const tabs: CategoryTab[] = [];

  for (const parent of parents) {
    if (!parent) continue;

    const children = childrenByParent.get(parent.id) ?? [];
    if (children.length === 0) continue;

    tabs.push({
      parentName: parent.name,
      parentSlug: parent.slug,
      children: children.map((child) => ({
        id: child.id,
        name: child.name,
        slug: child.slug ?? "",
        image: typeof child.image === "object" ? child.image : null,
      })),
    });
  }

  return tabs;
}

// ─── Public entry ────────────────────────────────────────────────────────────

export async function resolveBlocks(
  payload: Payload,
  layout: unknown,
): Promise<MobileBlock[]> {
  const blocks = Array.isArray(layout) ? layout : [];
  const resolved: MobileBlock[] = [];

  for (const raw of blocks) {
    const block = raw as RawBlock;
    const base = { id: block.id ?? null, blockName: block.blockName ?? null };

    switch (block.blockType) {
      case "banner":
        resolved.push({
          blockType: "banner",
          ...base,
          style: (block.style as string) ?? "info",
          content: block.content ?? null,
        });
        break;

      case "cta":
        resolved.push({
          blockType: "cta",
          ...base,
          richText: block.richText ?? null,
          links: resolveLinks(block.links as never),
        });
        break;

      case "content":
        resolved.push({
          blockType: "content",
          ...base,
          columns: objectItems<{
            size?: string | null;
            richText?: unknown;
            enableLink?: boolean | null;
            link?: unknown;
          }>(block.columns).map((column) => ({
            size: column.size ?? null,
            richText: column.richText ?? null,
            link: column.enableLink ? resolveLink(column.link as never) : null,
          })),
        });
        break;

      case "mediaBlock":
        resolved.push({
          blockType: "mediaBlock",
          ...base,
          media: (block.media as MediaReference) ?? null,
          caption:
            typeof block.media === "object" &&
            block.media !== null &&
            "caption" in block.media
              ? ((block.media as { caption?: unknown }).caption ?? null)
              : null,
        });
        break;

      case "archive": {
        const products = await resolveArchiveProducts(payload, block);
        if (products.length === 0) break;
        resolved.push({
          blockType: "archive",
          ...base,
          introContent: block.introContent ?? null,
          products,
        });
        break;
      }

      case "carousel": {
        const items = await resolveCarouselItems(payload, block);
        if (items.length === 0) break;
        resolved.push({
          blockType: "carousel",
          ...base,
          heading: block.heading ?? null,
          items,
        });
        break;
      }

      case "collectionsStrip": {
        const selected = block.collections as unknown;
        const selectedIds = Array.isArray(selected)
          ? flattenRelationshipIds<{ id: string }>(selected as never)
          : undefined;

        const collections = await fetchActiveCollections(payload, {
          ...(selectedIds?.length ? { ids: selectedIds } : { limit: 100 }),
        });

        const items = collections.map((collection) => ({
          slug: collection.slug ?? "",
          name: collection.name,
          coverImage:
            typeof collection.coverImage === "object"
              ? collection.coverImage
              : null,
        }));

        if (items.length === 0) break;
        resolved.push({
          blockType: "collectionsStrip",
          ...base,
          heading: block.heading ?? null,
          items,
        });
        break;
      }

      case "threeItemGrid": {
        const products = objectItems<RawProduct>(block.products);
        if (products.length !== 3) break;
        resolved.push({ blockType: "threeItemGrid", ...base, products });
        break;
      }

      case "fourItemGrid": {
        const categories = objectItems<RawCategory>(block.categories);
        if (categories.length < 4) break;
        resolved.push({
          blockType: "fourItemGrid",
          ...base,
          categories: categories.map((category) => ({
            id: category.id,
            slug: category.slug ?? "",
            name: category.name,
            image: typeof category.image === "object" ? category.image : null,
          })),
        });
        break;
      }

      case "fiveItemGrid": {
        const products = await resolveFiveItemGridProducts(payload, block);
        if (products.length === 0) break;
        resolved.push({
          blockType: "fiveItemGrid",
          ...base,
          heading: block.heading ?? null,
          products,
        });
        break;
      }

      case "tabs": {
        const contentType =
          (block.contentType as string | null) ?? "categories";

        if (contentType === "custom") {
          const customTabs = objectItems<{
            tab?: string | null;
            content?: unknown;
          }>(block.tabs).map((tab) => ({
            tab: tab.tab ?? "",
            content: tab.content ?? null,
          }));
          if (customTabs.length === 0) break;
          resolved.push({
            blockType: "tabs",
            ...base,
            heading: block.heading ?? null,
            contentType: "custom",
            categoryTabs: [],
            customTabs,
          });
        } else {
          const categoryTabs = await resolveCategoryTabs(payload, block);
          if (categoryTabs.length === 0) break;
          resolved.push({
            blockType: "tabs",
            ...base,
            heading: block.heading ?? null,
            contentType: "categories",
            categoryTabs,
            customTabs: [],
          });
        }
        break;
      }

      default:
        break;
    }
  }

  return resolved;
}
