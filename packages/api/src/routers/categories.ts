import { z } from "zod";

import { baseProcedure } from "../trpc";

export const categoriesRouter = {
  getCategoryBySlug: baseProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.payload.find({
        collection: "categories",
        where: { slug: { equals: input.slug } },
        limit: 1,
        depth: 0,
      });
      return result.docs[0] ?? null;
    }),

  getAllCategories: baseProcedure.query(async ({ ctx }) => {
    const categories = await ctx.payload.find({
      collection: "categories",
      sort: "order",
      pagination: false,
      depth: 0,
      select: { name: true, slug: true, parent: true, order: true },
      where: {
        active: {
          equals: true,
        },
      },
    });

    const categoryMap = new Map<string | number, any>();
    categories.docs.forEach((doc) => {
      categoryMap.set(doc.id, { ...doc, children: [] });
    });

    const tree: any[] = [];

    categoryMap.forEach((node) => {
      if (node.parent) {
        const parentId =
          typeof node.parent === "object" ? node.parent.id : node.parent;
        const parentNode = categoryMap.get(parentId);
        if (parentNode) {
          parentNode.children.push(node);
        } else {
          tree.push(node);
        }
      } else {
        tree.push(node);
      }
    });

    return { docs: tree };
  }),
};
