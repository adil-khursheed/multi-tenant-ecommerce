import { baseProcedure } from "../trpc";

export const categoriesRouter = {
  getAllCategories: baseProcedure.query(async ({ ctx }) => {
    const categories = await ctx.payload.find({
      collection: "categories",
      sort: "order",
      pagination: false,
      depth: 0,
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
