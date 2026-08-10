import { TRPCError } from "@trpc/server";
import Razorpay from "razorpay";
import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils";
import { z } from "zod";

import { COD_FEE, decrementInventory } from "@repo/payments";

import { protectedProcedure } from "../trpc";

type CartItem = {
  product?: unknown;
  variant?: unknown;
  quantity: number;
  [key: string]: unknown;
};

type FlattenCartItem = {
  product: string;
  quantity: number;
  variant?: string;
  [key: string]: unknown;
};

const billingAddressSchema = z
  .object({
    title: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    company: z.string().optional(),
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
    phone: z.string().optional(),
  })
  .optional();

function flattenCartItems(items: CartItem[]): FlattenCartItem[] {
  return items.map((item) => {
    const productID =
      typeof item.product === "object" && item.product !== null
        ? (item.product as { id: string }).id
        : (item.product as string);

    const variantID = item.variant
      ? typeof item.variant === "object" && item.variant !== null
        ? (item.variant as { id: string }).id
        : (item.variant as string)
      : undefined;

    const { product: _product, variant: _variant, ...customProps } = item;

    return {
      ...customProps,
      product: productID,
      quantity: item.quantity,
      ...(variantID ? { variant: variantID } : {}),
    };
  });
}

function getRazorpayCredentials() {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  return { keyId, keySecret };
}

/**
 * Mirrors the ecommerce plugin's `defaultProductsValidation`: every item must
 * resolve to a product/variant with a price in INR and enough inventory.
 */
async function validateCartItems(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any,
  items: CartItem[],
): Promise<void> {
  for (const item of items) {
    const quantity = item.quantity || 1;

    if (item.variant) {
      const variantID =
        typeof item.variant === "object" && item.variant !== null
          ? (item.variant as { id: string }).id
          : (item.variant as string);

      const variant = await payload.findByID({
        id: variantID,
        collection: "variants",
        depth: 0,
        select: { inventory: true, priceInINR: true },
      });

      if (!variant) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Variant with ID ${variantID} not found.`,
        });
      }
      if (!variant.priceInINR) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Variant with ID ${variantID} does not have a price in INR.`,
        });
      }
      if (
        variant.inventory === 0 ||
        (variant.inventory && variant.inventory < quantity)
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Variant with ID ${variantID} is out of stock or does not have enough inventory.`,
        });
      }
    } else {
      const productID =
        typeof item.product === "object" && item.product !== null
          ? (item.product as { id: string }).id
          : (item.product as string);

      const product = await payload.findByID({
        id: productID,
        collection: "products",
        depth: 0,
        select: { inventory: true, priceInINR: true },
      });

      if (!product) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Product with ID ${productID} not found.`,
        });
      }
      if (!product.priceInINR) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Product with ID ${productID} does not have a price in INR.`,
        });
      }
      if (
        product.inventory === 0 ||
        (product.inventory && product.inventory < quantity)
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Product with ID ${productID} is out of stock or does not have enough inventory.`,
        });
      }
    }
  }
}

function getCustomerID(
  customer: string | { id?: string } | null | undefined,
): string | null | undefined {
  return typeof customer === "object" && customer !== null
    ? customer.id
    : customer;
}

export const paymentsRouter = {
  initiate: protectedProcedure
    .input(
      z.object({
        method: z.enum(["razorpay", "cod"]),
        billingAddress: billingAddressSchema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { method } = input;

      const result = await ctx.payload.find({
        collection: "carts",
        where: { customer: { equals: userId } },
        sort: "-updatedAt",
        depth: 2,
        limit: 1,
      });

      const cart = result.docs[0];
      if (!cart || cart.status !== "active" || !cart.items?.length) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cart is empty or not found",
        });
      }

      const user = await ctx.payload.findByID({
        collection: "users",
        id: userId,
        depth: 0,
      });

      const customerEmail = user?.email || "";
      if (!customerEmail) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User email is required for checkout",
        });
      }

      const currency = "INR";
      const flattenedItems = flattenCartItems(cart.items ?? []);
      const subtotal = cart.subtotal ?? 0;
      const discount = cart.discount ?? 0;
      const couponCode = cart.couponCode ?? null;

      await validateCartItems(ctx.payload, cart.items ?? []);

      // NOTE: orders/transactions are admin-only in the plugin — keep overrideAccess defaulted
      // (bypassed) here, but attach user for hooks (accessToken generation, masking).
      const req = {
        payload: ctx.payload,
        user: ctx.session.user,
      };

      if (method === "razorpay") {
        const { keyId, keySecret } = getRazorpayCredentials();
        if (!keyId || !keySecret) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Razorpay credentials not configured",
          });
        }

        const total = cart.total ?? subtotal - discount;
        if (total <= 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid payment amount",
          });
        }

        const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

        const razorpayOrder = (await razorpay.orders.create({
          amount: total,
          currency,
          receipt: String(cart.id),
          notes: { cartID: String(cart.id) },
        })) as { id: string };

        const transaction = await ctx.payload.create({
          collection: "transactions",
          data: {
            customer: userId,
            amount: total,
            cart: cart.id,
            currency,
            items: flattenedItems,
            paymentMethod: "razorpay",
            status: "pending",
            razorpay: {
              orderID: razorpayOrder.id,
            },
            ...(couponCode ? { couponCode } : {}),
            ...(input.billingAddress
              ? { billingAddress: input.billingAddress }
              : {}),
            discount,
            shippingCharge: 0,
          },
          req,
        });

        return {
          razorpayOrderID: razorpayOrder.id,
          amount: total,
          currency,
          keyId,
          transactionID: transaction.id,
        };
      }

      // COD
      const total = cart.total ?? subtotal - discount;
      const amount = total + COD_FEE;

      const transaction = await ctx.payload.create({
        collection: "transactions",
        data: {
          customer: userId,
          amount,
          cart: cart.id,
          currency,
          items: flattenedItems,
          paymentMethod: "cod",
          status: "pending",
          cod: {
            codConfirmed: false,
          },
          ...(couponCode ? { couponCode } : {}),
          ...(input.billingAddress
            ? { billingAddress: input.billingAddress }
            : {}),
          discount,
          shippingCharge: COD_FEE,
        },
        req,
      });

      return {
        transactionID: transaction.id,
        amount,
        currency,
      };
    }),

  confirm: protectedProcedure
    .input(
      z.object({
        method: z.enum(["razorpay", "cod"]),
        razorpayPaymentID: z.string().optional(),
        razorpayOrderID: z.string().optional(),
        razorpaySignature: z.string().optional(),
        transactionID: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const { method } = input;

      const req = {
        payload: ctx.payload,
        user: ctx.session.user,
      };

      if (method === "razorpay") {
        const { razorpayPaymentID, razorpayOrderID, razorpaySignature } = input;
        const { keyId, keySecret } = getRazorpayCredentials();

        if (!keyId || !keySecret) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Razorpay credentials not configured",
          });
        }
        if (!razorpayPaymentID || !razorpayOrderID) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Razorpay Payment ID and Order ID are required",
          });
        }

        const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

        const transactionsResult = await ctx.payload.find({
          collection: "transactions",
          where: {
            "razorpay.orderID": { equals: razorpayOrderID },
          },
          depth: 0,
        });

        const transaction = transactionsResult.docs[0];
        if (!transaction) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Transaction not found for the provided Razorpay Order ID",
          });
        }

        if (getCustomerID(transaction.customer) !== userId) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Transaction not found for the provided Razorpay Order ID",
          });
        }

        if (transaction.paymentMethod !== "razorpay") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Transaction is not a Razorpay transaction",
          });
        }

        if (razorpaySignature) {
          const body = razorpayOrderID + "|" + razorpayPaymentID;
          const valid = validateWebhookSignature(
            body,
            razorpaySignature,
            keySecret,
          );
          if (!valid) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid Razorpay signature",
            });
          }
        }

        const existingOrders = await ctx.payload.find({
          collection: "orders",
          where: {
            transactions: { equals: transaction.id },
          },
          limit: 1,
          depth: 0,
        });

        if (existingOrders.totalDocs > 0 && existingOrders.docs[0]) {
          const existing = existingOrders.docs[0];
          return {
            orderID: existing.id,
            transactionID: transaction.id,
            accessToken: existing.accessToken,
          };
        }

        const payment = (await razorpay.payments.fetch(razorpayPaymentID)) as {
          status: string;
        };
        if (payment.status !== "captured") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Payment status is '${payment.status}', expected 'captured'`,
          });
        }

        const order = await ctx.payload.create({
          collection: "orders",
          data: {
            amount: transaction.amount,
            currency: transaction.currency,
            customer: userId,
            items: transaction.items,
            shippingAddress: transaction.billingAddress,
            status: "processing",
            transactions: [transaction.id],
            ...(transaction.couponCode
              ? { couponCode: transaction.couponCode }
              : {}),
            discount: transaction.discount ?? 0,
            shippingCharge: transaction.shippingCharge ?? 0,
          },
          req,
        });

        await decrementInventory(ctx.payload, transaction.items ?? []);

        await ctx.payload.update({
          id: transaction.cart as string,
          collection: "carts",
          data: {
            purchasedAt: new Date().toISOString(),
          },
          req,
        });

        await ctx.payload.update({
          id: transaction.id,
          collection: "transactions",
          data: {
            order: order.id,
            status: "succeeded",
            razorpay: {
              ...(typeof transaction.razorpay === "object" &&
              transaction.razorpay !== null
                ? transaction.razorpay
                : {}),
              paymentID: razorpayPaymentID,
            },
          },
          req,
        });

        return {
          orderID: order.id,
          transactionID: transaction.id,
          accessToken: order.accessToken,
        };
      }

      // COD
      const { transactionID } = input;
      if (!transactionID) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Transaction ID is required for COD confirmation",
        });
      }

      const transaction = await ctx.payload.findByID({
        id: transactionID,
        collection: "transactions",
        depth: 0,
      });

      if (!transaction) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Transaction not found",
        });
      }

      if (getCustomerID(transaction.customer) !== userId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Transaction not found",
        });
      }

      if (transaction.paymentMethod !== "cod") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Transaction is not a COD transaction",
        });
      }

      if (transaction.status !== "pending") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Transaction is not pending",
        });
      }

      const existingOrders = await ctx.payload.find({
        collection: "orders",
        where: {
          transactions: { equals: transaction.id },
        },
        limit: 1,
        depth: 0,
      });

      if (existingOrders.totalDocs > 0 && existingOrders.docs[0]) {
        const existing = existingOrders.docs[0];
        return {
          orderID: existing.id,
          transactionID: transaction.id,
          accessToken: existing.accessToken,
        };
      }

      const order = await ctx.payload.create({
        collection: "orders",
        data: {
          amount: transaction.amount,
          currency: transaction.currency,
          customer: userId,
          items: transaction.items,
          shippingAddress: transaction.billingAddress,
          status: "processing",
          transactions: [transaction.id],
          ...(transaction.couponCode
            ? { couponCode: transaction.couponCode }
            : {}),
          discount: transaction.discount ?? 0,
          shippingCharge: transaction.shippingCharge ?? 0,
        },
        req,
      });

      await decrementInventory(ctx.payload, transaction.items ?? []);

      await ctx.payload.update({
        id: transaction.cart as string,
        collection: "carts",
        data: {
          purchasedAt: new Date().toISOString(),
        },
        req,
      });

      await ctx.payload.update({
        id: transaction.id,
        collection: "transactions",
        data: {
          order: order.id,
          status: "succeeded",
          cod: {
            codConfirmed: true,
          },
        },
        req,
      });

      return {
        orderID: order.id,
        transactionID: transaction.id,
        accessToken: order.accessToken,
      };
    }),
};
