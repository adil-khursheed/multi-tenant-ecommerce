import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import { authRouter } from "./routers/auth";
import { cartRouter } from "./routers/cart";
import { categoriesRouter } from "./routers/categories";
import { productsRouter } from "./routers/products";
import { vendorRouter } from "./routers/vendor";
import { blocksRouter } from "./routers/blocks";
import { wishlistRouter } from "./routers/wishlist";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  cart: cartRouter,
  vendor: vendorRouter,
  product: productsRouter,
  category: categoriesRouter,
  blocks: blocksRouter,
  wishlist: wishlistRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
