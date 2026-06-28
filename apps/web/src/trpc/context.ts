import { cookies } from "next/headers";
import { getPayload } from "payload";
import config from "@payload-config";
import type { TRPCContext } from "@repo/api";
import { parseCookies } from "payload"; // payload 3 exposes parseCookies, or we can get user from payload

export const createTRPCContext = async (opts: { headers: Headers }): Promise<TRPCContext> => {
  const payload = await getPayload({ config });
  
  // TODO: Implement actual session fetching based on your auth strategy
  // For now we'll just mock the session as null, or we can use next/headers if needed
  
  return {
    payload,
    session: { user: null },
    setCookie: async (name, value, options) => {
      const cookieStore = await cookies();
      cookieStore.set(name, value, options);
    },
  };
};
