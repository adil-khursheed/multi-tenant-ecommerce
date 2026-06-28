import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import { createTRPCRouter } from "./trpc";
import { authRouter } from "./routers/auth";
import { vendorRouter } from "./routers/vendor";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  vendor: vendorRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
