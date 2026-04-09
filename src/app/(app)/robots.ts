/* eslint-disable no-restricted-exports */
import { env } from "@/env";

const baseUrl = env.VERCEL_URL
  ? `https://${env.VERCEL_URL}`
  : env.NEXT_PUBLIC_SERVER_URL;

export default function robots() {
  return {
    host: baseUrl,
    rules: [
      {
        userAgent: "*",
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
