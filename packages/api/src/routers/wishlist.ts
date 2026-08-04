import { z } from "zod";

import { protectedProcedure } from "../trpc";

export const wishlistRouter = {
  toggle: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const user = await ctx.payload.findByID({
        collection: "users",
        id: userId,
        depth: 0,
        select: { wishlist: true },
      });

      const currentWishlist = (user.wishlist as string[]) ?? [];
      const isWishlisted = currentWishlist.includes(input.productId);

      const updatedWishlist = isWishlisted
        ? currentWishlist.filter((id) => id !== input.productId)
        : [...currentWishlist, input.productId];

      await ctx.payload.update({
        collection: "users",
        id: userId,
        data: { wishlist: updatedWishlist },
      });

      return { isWishlisted: !isWishlisted };
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
      const user = await ctx.payload.findByID({
        collection: "users",
        id: ctx.session.user.id,
        depth: 2,
        select: { wishlist: true },
      });

    return { wishlist: user.wishlist ?? [] };
  }),

  check: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.payload.findByID({
        collection: "users",
        id: ctx.session.user.id,
        depth: 0,
        select: { wishlist: true },
      });

      const currentWishlist = (user.wishlist as string[]) ?? [];

      return { isWishlisted: currentWishlist.includes(input.productId) };
    }),
};
