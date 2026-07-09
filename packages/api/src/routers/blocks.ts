import { z } from "zod";

import { baseProcedure } from "../trpc";

export const blocksRouter = {
  getFiveItemGrid: baseProcedure
    .input(
      z.object({
        filter: z
          .enum(["featured", "newArrivals", "bestsellers", "flashSale", "none"])
          .optional(),
        categoryIds: z.array(z.string()).optional(),
        limit: z.number().default(5),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { payload } = ctx;
      const { filter, categoryIds, limit } = input;

      const andConditions: any[] = [];

      if (filter && filter !== "none") {
        let flagKey = "";
        switch (filter) {
          case "featured":
            flagKey = "flags.isFeatured";
            break;
          case "newArrivals":
            flagKey = "flags.isNewArrival";
            break;
          case "bestsellers":
            flagKey = "flags.isBestseller";
            break;
          case "flashSale":
            flagKey = "isFlashSale";
            break;
        }
        if (flagKey) {
          andConditions.push({ [flagKey]: { equals: true } });
        }
      }

      if (categoryIds && categoryIds.length > 0) {
        andConditions.push({ categories: { in: categoryIds } });
      }

      const where =
        andConditions.length > 0 ? { and: andConditions } : undefined;

      const result = await payload.find({
        collection: "products",
        where,
        limit,
        depth: 1, // To populate image/categories
      });

      return result.docs;
    }),
};
