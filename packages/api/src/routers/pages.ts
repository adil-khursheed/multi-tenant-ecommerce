import { z } from "zod";

import { baseProcedure } from "../trpc";
import { resolveHero } from "../utils/resolveHero";
import { resolveBlocks } from "../utils/resolveBlocks";

export const pagesRouter = {
  getPageBySlug: baseProcedure
    .input(
      z.object({
        slug: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { payload } = ctx;

      const result = await payload.find({
        collection: "pages",
        limit: 1,
        overrideAccess: true,
        pagination: false,
        depth: 2,
        where: {
          and: [
            { slug: { equals: input.slug } },
            { _status: { equals: "published" } },
          ],
        },
      });

      const page = result.docs?.[0];
      if (!page) return null;

      const hero = resolveHero((page as unknown as { hero: never }).hero);
      const layout = await resolveBlocks(
        payload,
        (page as unknown as { layout: unknown }).layout,
      );

      return { hero, layout };
    }),
};
