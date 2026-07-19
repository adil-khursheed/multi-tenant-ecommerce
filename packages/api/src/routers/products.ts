import { Where } from "payload";

import { z } from "zod";

import { baseProcedure } from "../trpc";

export const productsRouter = {
  getFilterOptions: baseProcedure.query(async ({ ctx }) => {
    const [variantTypesResult, allOptionsResult, materialsResult, tenantsResult] =
      await Promise.all([
        ctx.payload.find({
          collection: "variantTypes",
          select: { label: true, name: true },
          pagination: false,
          depth: 0,
        }),
        ctx.payload.find({
          collection: "variantOptions",
          select: { variantType: true, label: true },
          pagination: false,
          depth: 0,
        }),
        ctx.payload.find({
          collection: "materials",
          where: { active: { equals: true } },
          select: { name: true },
          sort: "order",
          pagination: false,
          depth: 0,
        }),
        ctx.payload.find({
          collection: "tenants",
          where: { storeName: { exists: true } },
          select: { storeName: true },
          pagination: false,
          depth: 0,
        }),
      ]);

    const sizeTypeIds = new Set<string | number>();
    const colorTypeIds = new Set<string | number>();

    for (const vt of variantTypesResult.docs) {
      const label = ((vt as any).label || (vt as any).name || "").toLowerCase();
      const id = vt.id;
      if (label.includes("size")) sizeTypeIds.add(id);
      else if (label.includes("color") || label.includes("colour"))
        colorTypeIds.add(id);
    }

    const sizes: string[] = [];
    const colors: string[] = [];

    for (const opt of allOptionsResult.docs) {
      const typeId =
        typeof (opt as any).variantType === "object"
          ? (opt as any).variantType?.id
          : (opt as any).variantType;
      const label = (opt as any).label as string;
      if (!label) continue;
      if (sizeTypeIds.has(typeId)) sizes.push(label);
      else if (colorTypeIds.has(typeId)) colors.push(label);
    }

    return {
      sizes: [...new Set(sizes)].sort(),
      colors: [...new Set(colors)].sort(),
      materials: materialsResult.docs
        .map((m) => (m as any).name as string)
        .filter(Boolean)
        .sort(),
      brands: tenantsResult.docs
        .map((t) => (t as any).storeName as string)
        .filter(Boolean)
        .sort(),
    };
  }),

  getAllProducts: baseProcedure
    .input(
      z.object({
        searchValue: z.string().optional(),
        category: z.string().optional(),
        sort: z.string().optional(),
        cursor: z.number().nullish(),
        priceRange: z.string().optional(),
        size: z.string().optional(),
        color: z.string().optional(),
        brand: z.string().optional(),
        rating: z.string().optional(),
        occasion: z.string().optional(),
        material: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const {
        searchValue,
        category,
        sort,
        cursor,
        priceRange,
        size,
        color,
        brand,
        rating,
        occasion,
        material,
      } = input;
      const page = cursor ?? 1;

      const andConstraints: Where[] = [
        {
          _status: {
            equals: "published",
          },
        },
      ];

      if (searchValue) {
        andConstraints.push({
          or: [
            { title: { like: searchValue } },
            { description: { like: searchValue } },
          ],
        });
      }

      if (priceRange) {
        let cleanStr = priceRange.replace(/[^0-9\-+–]/g, "");
        cleanStr = cleanStr.replace("–", "-");

        if (cleanStr.includes("+")) {
          const min = parseInt(cleanStr.replace("+", ""), 10);
          if (!isNaN(min)) {
            andConstraints.push({
              minEffectivePrice: { greater_than_equal: min },
            });
          }
        } else if (cleanStr.includes("-")) {
          const parts = cleanStr.split("-");
          const minPart = parts[0] || "";
          const maxPart = parts[1] || "";
          const min = parseInt(minPart, 10);
          const max = parseInt(maxPart, 10);
          if (!isNaN(min) && !isNaN(max)) {
            andConstraints.push({
              and: [
                { minEffectivePrice: { greater_than_equal: min } },
                { minEffectivePrice: { less_than_equal: max } },
              ],
            });
          }
        }
      }

      if (rating) {
        const ratingNum = parseInt(rating, 10);
        if (!isNaN(ratingNum)) {
          andConstraints.push({
            "ratings.average": { greater_than_equal: ratingNum },
          });
        }
      }

      if (occasion) {
        andConstraints.push({
          occasion: { in: [occasion.toLowerCase()] },
        });
      }

      // Run all filter pre-lookups in parallel
      const [catResult, tenantResult, matResult, sizeProductIds, colorProductIds] =
        await Promise.all([
          category
            ? ctx.payload.find({
                collection: "categories",
                where: { slug: { equals: category } },
                limit: 1,
                depth: 0,
              })
            : null,
          brand
            ? ctx.payload.find({
                collection: "tenants",
                where: { storeName: { equals: brand } },
                limit: 1,
                pagination: false,
                depth: 0,
              })
            : null,
          material
            ? ctx.payload.find({
                collection: "materials",
                where: { name: { equals: material } },
                limit: 1,
                pagination: false,
                depth: 0,
              })
            : null,
          size
            ? (async () => {
                const opts = await ctx.payload.find({
                  collection: "variantOptions",
                  where: { label: { equals: size } },
                  pagination: false,
                  depth: 0,
                });
                const optionIds = opts.docs.map((d) => d.id);
                if (optionIds.length === 0) return [];
                const variants = await ctx.payload.find({
                  collection: "variants",
                  where: { options: { in: optionIds } },
                  select: { product: true },
                  pagination: false,
                  depth: 0,
                });
                return variants.docs.map((v) => {
                  const p = (v as any).product;
                  return typeof p === "string" ? p : p?.id;
                });
              })()
            : null,
          color
            ? (async () => {
                const opts = await ctx.payload.find({
                  collection: "variantOptions",
                  where: { label: { equals: color } },
                  pagination: false,
                  depth: 0,
                });
                const optionIds = opts.docs.map((d) => d.id);
                if (optionIds.length === 0) return [];
                const variants = await ctx.payload.find({
                  collection: "variants",
                  where: { options: { in: optionIds } },
                  select: { product: true },
                  pagination: false,
                  depth: 0,
                });
                return variants.docs.map((v) => {
                  const p = (v as any).product;
                  return typeof p === "string" ? p : p?.id;
                });
              })()
            : null,
        ]);

      if (category) {
        if (catResult?.docs[0]) {
          andConstraints.push({
            categories: { contains: catResult.docs[0].id },
          });
        } else {
          andConstraints.push({ categories: { contains: category } });
        }
      }

      if (brand) {
        const tenant = tenantResult?.docs[0];
        if (tenant) {
          andConstraints.push({ tenant: { equals: tenant.id } });
        } else {
          andConstraints.push({ id: { equals: "not-found" } });
        }
      }

      if (material) {
        const mat = matResult?.docs[0];
        if (mat) {
          andConstraints.push({ materials: { contains: mat.id } });
        } else {
          andConstraints.push({ id: { equals: "not-found" } });
        }
      }

      if (size || color) {
        let intersectedIds: string[] = [];
        if (size && color) {
          intersectedIds = (sizeProductIds || []).filter((id: string) =>
            (colorProductIds || []).includes(id),
          );
        } else if (size) {
          intersectedIds = sizeProductIds || [];
        } else if (color) {
          intersectedIds = colorProductIds || [];
        }

        if (intersectedIds.length > 0) {
          andConstraints.push({ id: { in: intersectedIds } });
        } else {
          andConstraints.push({ id: { equals: "not-found" } });
        }
      }

      const products = await ctx.payload.find({
        collection: "products",
        limit: 20,
        page,
        draft: false,
        overrideAccess: false,
        context: {
          isStorefront: true,
        },
        select: {
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
          flags: true,
        },
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
        ...(sort ? { sort } : { sort: "title" }),
        where: { and: andConstraints },
      });

      return {
        products,
        nextCursor: products.hasNextPage ? products.nextPage : null,
      };
    }),

  getProductBySlug: baseProcedure
    .input(
      z.object({
        slug: z.string(),
        draft: z.boolean().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { slug, draft } = input;

      const result = await ctx.payload.find({
        collection: "products",
        depth: 3,
        draft,
        limit: 1,
        overrideAccess: draft,
        pagination: false,
        context: {
          isStorefront: true,
        },
        where: {
          and: [
            {
              slug: {
                equals: slug,
              },
            },
            ...(draft ? [] : [{ _status: { equals: "published" } }]),
          ],
        },
        populate: {
          tenants: {
            storeName: true,
            storeDescription: true,
            storeSlug: true,
            storeLogo: true,
            verificationStatus: true,
            shippingPolicy: true,
            returnAndExchangePolicy: true,
          },
          variants: {
            title: true,
            priceInINR: true,
            effectivePrice: true,
            inventory: true,
            options: true,
          },
        },
      });

      const product = result.docs?.[0] || null;

      if (!product) {
        return {
          product: null,
          reviews: { docs: [], totalDocs: 0, hasNextPage: false },
        };
      }

      // Fetch first page of reviews for this product
      const reviewsResult = await ctx.payload.find({
        collection: "reviews",
        where: {
          product: {
            equals: product.id,
          },
        },
        sort: "-createdAt",
        limit: 10,
        depth: 1, // populate user
        overrideAccess: false,
        context: {
          isStorefront: true,
        },
      });

      return {
        product,
        reviews: {
          docs: reviewsResult.docs,
          totalDocs: reviewsResult.totalDocs,
          hasNextPage: reviewsResult.hasNextPage,
        },
      };
    }),
};
