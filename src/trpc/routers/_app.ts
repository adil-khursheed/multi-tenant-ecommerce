import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import { createTRPCRouter } from "../init";
import { authRouter } from "./auth-router";
import { vendorRouter } from "./vendor-router";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  vendor: vendorRouter,
});

// export type definition of API
type AppRouter = typeof appRouter;
type RouterInputs = inferRouterInputs<AppRouter>;
type RouterOutputs = inferRouterOutputs<AppRouter>;

export type { AppRouter, RouterInputs, RouterOutputs };
