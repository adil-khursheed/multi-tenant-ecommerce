import { Where } from "payload";

import { z } from "zod";

import { baseProcedure } from "../trpc";

export const productsRouter = {
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

      if (category) {
        andConstraints.push({ categories: { contains: category } });
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
        andConstraints.push({ occasion: { contains: occasion.toLowerCase() } });
      }

      if (brand) {
        const tenants = await ctx.payload.find({
          collection: "tenants",
          where: { storeName: { equals: brand } },
          pagination: false,
          depth: 0,
        });
        const tenant = tenants.docs[0];
        if (tenant) {
          andConstraints.push({ tenant: { equals: tenant.id } });
        } else {
          andConstraints.push({ id: { equals: "not-found" } });
        }
      }

      if (material) {
        const materials = await ctx.payload.find({
          collection: "materials",
          where: { name: { equals: material } },
          pagination: false,
          depth: 0,
        });
        const mat = materials.docs[0];
        if (mat) {
          andConstraints.push({ materials: { contains: mat.id } });
        } else {
          andConstraints.push({ id: { equals: "not-found" } });
        }
      }

      if (size || color) {
        let sizeProductIds: string[] | undefined;
        let colorProductIds: string[] | undefined;

        if (size) {
          const sizeOpts = await ctx.payload.find({
            collection: "variantOptions",
            where: { label: { equals: size } },
            pagination: false,
            depth: 0,
          });
          const optionIds = sizeOpts.docs.map((d) => d.id);
          if (optionIds.length > 0) {
            const variants = await ctx.payload.find({
              collection: "variants",
              where: { options: { in: optionIds } },
              pagination: false,
              depth: 0,
            });
            sizeProductIds = variants.docs.map((v) =>
              typeof v.product === "string" ? v.product : v.product.id,
            );
          } else {
            sizeProductIds = [];
          }
        }

        if (color) {
          const colorOpts = await ctx.payload.find({
            collection: "variantOptions",
            where: { label: { equals: color } },
            pagination: false,
            depth: 0,
          });
          const optionIds = colorOpts.docs.map((d) => d.id);
          if (optionIds.length > 0) {
            const variants = await ctx.payload.find({
              collection: "variants",
              where: { options: { in: optionIds } },
              pagination: false,
              depth: 0,
            });
            colorProductIds = variants.docs.map((v) =>
              typeof v.product === "string" ? v.product : v.product.id,
            );
          } else {
            colorProductIds = [];
          }
        }

        let intersectedIds: string[] = [];
        if (size && color) {
          intersectedIds = (sizeProductIds || []).filter((id) =>
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
