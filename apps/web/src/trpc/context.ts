import { cookies } from "next/headers";

import { getPayload } from "payload";

import config from "@payload-config";

import type { TRPCContext } from "@repo/api";

export const createTRPCContext = async (opts: {
  headers: Headers;
}): Promise<TRPCContext> => {
  const payload = await getPayload({ config });

  const { user } = await payload.auth({ headers: opts.headers });

  return {
    payload,
    session: { user },
    setCookie: async (name, value, options) => {
      const cookieStore = await cookies();
      cookieStore.set(name, value, options);
    },
  };
};
