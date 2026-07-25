import { protectedProcedure } from "../trpc";

export const ordersRouter = {
  list: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const result = await ctx.payload.find({
      collection: "orders",
      where: {
        customer: { equals: userId },
      },
      depth: 2,
      sort: "-createdAt",
      limit: 0,
      pagination: false,
    });

    return { orders: result.docs };
  }),
};
