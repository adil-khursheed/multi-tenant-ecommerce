import type { NextRequest } from "next/server";

import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { appRouter } from "@repo/api";
import { createTRPCContext } from "@/trpc/context";

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () =>
      createTRPCContext({
        headers: req.headers,
      }),
    onError({ error, path }) {
      console.error(`>>> tRPC Error on '${path}'`, error);
    },
  });

export { handler as GET, handler as POST };
