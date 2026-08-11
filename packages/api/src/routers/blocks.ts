import { z } from "zod";

import { baseProcedure } from "../trpc";
import { fetchCardProducts } from "../utils/productCards";
import { buildProductWhere, type ProductFilter } from "../utils/productQuery";

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

      const result = await fetchCardProducts(payload, {
        limit,
        where: buildProductWhere({
          filter: filter as ProductFilter,
          categoryIds,
        }),
        ...(filter && filter !== "none" ? { sort: "-createdAt" } : {}),
      });

      return result.docs;
    }),
};
