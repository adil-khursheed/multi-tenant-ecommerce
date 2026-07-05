import React from "react";

import { DefaultDocumentIDType, getPayload, Where } from "payload";

import configPromise from "@payload-config";

import { RichText } from "@/components/RichText";
import type {
  CarouselBlock as CarouselBlockProps,
  Category,
  Collection,
  Media,
  Product,
} from "@/payload-types";
import { CarouselClient, CarouselItem } from "./Component.client";

export const CarouselBlock: React.FC<
  CarouselBlockProps & {
    id?: DefaultDocumentIDType;
  }
> = async (props) => {
  const {
    id,
    heading,
    contentType = "products",
    categories,
    limit = 10,
    populateBy,
    productFilter,
    selectedDocs,
  } = props;

  let items: CarouselItem[] = [];

  if (contentType === "products") {
    items = await fetchProducts({
      populateBy,
      categories,
      limit,
      productFilter,
      selectedDocs,
    });
  } else if (contentType === "categories") {
    items = await fetchCategories({ limit });
  } else if (contentType === "collections") {
    items = await fetchCollections({ limit });
  }

  if (!items?.length) return null;

  return (
    <div className="w-full pb-6 pt-1">
      {heading && (
        <div className="container mb-4">
          <RichText data={heading} enableGutter={false} />
        </div>
      )}
      <CarouselClient items={items} />
    </div>
  );
};

// ─── Data-fetching helpers ──────────────────────────────────────────────────

async function fetchProducts({
  populateBy,
  categories,
  limit,
  productFilter,
  selectedDocs,
}: Pick<
  CarouselBlockProps,
  "populateBy" | "categories" | "limit" | "productFilter" | "selectedDocs"
>): Promise<CarouselItem[]> {
  let products: Product[] = [];

  if (populateBy === "collection") {
    const payload = await getPayload({ config: configPromise });

    const flattenedCategories = categories?.length
      ? categories.map((category) => {
          if (typeof category === "object") return category.id;
          else return category;
        })
      : null;

    // Build the where clause from category + productFilter
    const conditions: Where[] = [];

    if (flattenedCategories && flattenedCategories.length > 0) {
      conditions.push({ categories: { in: flattenedCategories } });
    }

    // Apply product flag filters
    if (productFilter && productFilter !== "none") {
      const filterMap: Record<string, Where> = {
        newArrivals: { "flags.isNewArrival": { equals: true } },
        featured: { "flags.isFeatured": { equals: true } },
        bestsellers: { "flags.isBestseller": { equals: true } },
        flashSale: { isFlashSale: { equals: true } },
      };

      if (filterMap[productFilter]) {
        conditions.push(filterMap[productFilter]);
      }
    }

    const fetchedProducts = await payload.find({
      collection: "products",
      depth: 1,
      limit: limit || undefined,
      ...(conditions.length > 0
        ? {
            where:
              conditions.length === 1 ? conditions[0] : { and: conditions },
          }
        : {}),
      // Sort latest first when a product filter is active
      ...(productFilter && productFilter !== "none"
        ? { sort: "-createdAt" }
        : {}),
    });

    products = fetchedProducts.docs;
  } else if (selectedDocs?.length) {
    products = selectedDocs
      .map((doc) => {
        if (typeof doc.value !== "string") return doc.value;
        return null;
      })
      .filter(Boolean) as Product[];
  }

  return products.map((product) => ({
    type: "product" as const,
    slug: product.slug ?? "",
    title: product.title,
    price: product.priceInINR ?? 0,
    image: (product.meta?.image as Media) ?? null,
  }));
}

async function fetchCategories({
  limit,
}: {
  limit: number | null | undefined;
}): Promise<CarouselItem[]> {
  const payload = await getPayload({ config: configPromise });

  const result = await payload.find({
    collection: "categories",
    depth: 1,
    limit: limit || undefined,
    where: { active: { equals: true } },
    sort: "order",
  });

  return result.docs.map((category: Category) => ({
    type: "category" as const,
    slug: category.slug ?? "",
    name: category.name,
    image: (typeof category.image === "object"
      ? category.image
      : null) as Media | null,
  }));
}

async function fetchCollections({
  limit,
}: {
  limit: number | null | undefined;
}): Promise<CarouselItem[]> {
  const payload = await getPayload({ config: configPromise });

  const now = new Date().toISOString();

  const result = await payload.find({
    collection: "collections",
    depth: 1,
    limit: limit || undefined,
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

  return result.docs.map((collection: Collection) => ({
    type: "collection" as const,
    slug: collection.slug ?? "",
    name: collection.name,
    coverImage: (typeof collection.coverImage === "object"
      ? collection.coverImage
      : null) as Media | null,
  }));
}
