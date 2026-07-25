import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import { addressesRouter } from "./routers/addresses";
import { authRouter } from "./routers/auth";
import { cartRouter } from "./routers/cart";
import { categoriesRouter } from "./routers/categories";
import { ordersRouter } from "./routers/orders";
import { paymentsRouter } from "./routers/payments";
import { productsRouter } from "./routers/products";
import { vendorRouter } from "./routers/vendor";
import { blocksRouter } from "./routers/blocks";
import { wishlistRouter } from "./routers/wishlist";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  addresses: addressesRouter,
  auth: authRouter,
  cart: cartRouter,
  category: categoriesRouter,
  blocks: blocksRouter,
  orders: ordersRouter,
  payments: paymentsRouter,
  product: productsRouter,
  vendor: vendorRouter,
  wishlist: wishlistRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
