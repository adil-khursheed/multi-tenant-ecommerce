import type { PayloadRequest } from "payload";

import { COD_FEE } from "../constants";

type CartItem = {
  product: unknown;
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPayload = any;

export const initiatePayment =
  () =>
  async ({
    data,
    req,
    transactionsSlug,
  }: {
    data: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      billingAddress: any;
      cart: {
        id: string | number;
        items: CartItem[];
        subtotal?: number;
        total?: number;
        couponCode?: string | null;
        discount?: number;
        customerEmail?: string;
      };
      currency: string;
      customerEmail: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      shippingAddress?: any;
    };
    req: PayloadRequest;
    transactionsSlug: string;
  }) => {
    const payload = req.payload as AnyPayload;
    const { customerEmail, currency, cart, billingAddress } = data;
    const amount = (cart.total || cart.subtotal || 0) + COD_FEE;

    if (!cart?.items?.length) {
      throw new Error("Cart is empty or not provided.");
    }
    if (!customerEmail || typeof customerEmail !== "string") {
      throw new Error("A valid customer email is required to make a purchase.");
    }
    if (!amount || typeof amount !== "number" || amount <= 0) {
      throw new Error("A valid amount is required to initiate a payment.");
    }

    const flattenedCart = flattenCartItems(cart.items);

    try {
      const transaction = await payload.create({
        collection: transactionsSlug,
        data: {
          ...(req.user ? { customer: req.user.id } : { customerEmail }),
          amount,
          billingAddress,
          cart: cart.id,
          currency: currency.toUpperCase(),
          items: flattenedCart,
          paymentMethod: "cod",
          status: "pending",
          cod: {
            codConfirmed: false,
          },
          couponCode: (cart as Record<string, unknown>).couponCode || undefined,
          discount: (cart as Record<string, unknown>).discount || 0,
          shippingCharge: COD_FEE,
        },
        req,
      });

      return {
        transactionID: transaction.id,
        message: "COD order placed. Payment will be collected on delivery.",
      };
    } catch (error) {
      payload.logger.error({
        err: error,
        msg: "Error initiating COD order",
      });
      throw new Error(
        error instanceof Error
          ? error.message
          : "Unknown error initiating COD order",
      );
    }
  };
