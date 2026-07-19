import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure } from "../trpc";

const CART_DEPTH = 2;

async function findActiveCart(ctx: any, userId: string) {
  const result = await ctx.payload.find({
    collection: "carts",
    where: {
      and: [
        { customer: { equals: userId } },
        { status: { equals: "active" } },
      ],
    },
    depth: CART_DEPTH,
    limit: 1,
  });

  return result.docs[0] ?? null;
}

async function createOrGetCart(ctx: any, userId: string) {
  const existing = await findActiveCart(ctx, userId);
  if (existing) return existing;

  const cart = await ctx.payload.create({
    collection: "carts",
    data: {
      customer: userId,
      status: "active",
      currency: "INR",
      items: [],
    },
    depth: CART_DEPTH,
  });

  return cart;
}

export const cartRouter = {
  get: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const cart = await createOrGetCart(ctx, userId);
    return { cart };
  }),

  addItem: protectedProcedure
    .input(
      z.object({
        productId: z.string(),
        variantId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const cart = await createOrGetCart(ctx, userId);

      const existingItems = cart.items ?? [];
      const existingItemIndex = existingItems.findIndex((item: any) => {
        const itemProductId =
          typeof item.product === "object" ? item.product?.id : item.product;
        const itemVariantId = item.variant
          ? typeof item.variant === "object"
            ? item.variant?.id
            : item.variant
          : null;
        const targetVariantId = input.variantId ?? null;

        return (
          itemProductId === input.productId &&
          itemVariantId === targetVariantId
        );
      });

      let updatedItems;
      if (existingItemIndex >= 0) {
        updatedItems = existingItems.map((item: any, i: number) =>
          i === existingItemIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      } else {
        updatedItems = [
          ...existingItems,
          {
            product: input.productId,
            variant: input.variantId ?? null,
            quantity: 1,
          },
        ];
      }

      const updated = await ctx.payload.update({
        collection: "carts",
        id: cart.id,
        data: { items: updatedItems },
        depth: CART_DEPTH,
      });

      return { cart: updated };
    }),

  removeItem: protectedProcedure
    .input(z.object({ itemId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const cart = await findActiveCart(ctx, userId);

      if (!cart) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cart not found",
        });
      }

      const updatedItems = (cart.items ?? []).filter(
        (item: any) => item.id !== input.itemId,
      );

      const updated = await ctx.payload.update({
        collection: "carts",
        id: cart.id,
        data: { items: updatedItems },
        depth: CART_DEPTH,
      });

      return { cart: updated };
    }),

  updateItemQuantity: protectedProcedure
    .input(z.object({ itemId: z.string(), quantity: z.number().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const cart = await findActiveCart(ctx, userId);

      if (!cart) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cart not found",
        });
      }

      const updatedItems = (cart.items ?? []).map((item: any) =>
        item.id === input.itemId
          ? { ...item, quantity: input.quantity }
          : item,
      );

      const updated = await ctx.payload.update({
        collection: "carts",
        id: cart.id,
        data: { items: updatedItems },
        depth: CART_DEPTH,
      });

      return { cart: updated };
    }),

  clear: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const cart = await findActiveCart(ctx, userId);

    if (!cart) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Cart not found",
      });
    }

    const updated = await ctx.payload.update({
      collection: "carts",
      id: cart.id,
      data: { items: [] },
      depth: CART_DEPTH,
    });

    return { cart: updated };
  }),
};
