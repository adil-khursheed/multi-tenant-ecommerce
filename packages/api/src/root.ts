import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import { authRouter } from "./routers/auth";
import { categoriesRouter } from "./routers/categories";
import { productsRouter } from "./routers/products";
import { vendorRouter } from "./routers/vendor";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  vendor: vendorRouter,
  product: productsRouter,
  category: categoriesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
