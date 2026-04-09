import { createEnv } from "@t3-oss/env-nextjs";
import { vercel } from "@t3-oss/env-nextjs/presets-zod";
import * as z from "zod";

export const env = createEnv({
  extends: [vercel()],
  server: {
    PAYLOAD_SECRET: z.string().min(1, "Payload secret is required"),
    DATABASE_URL: z.url().min(1, "Database URL is required"),
    COMPANY_NAME: z.string().min(1, "Company name is required"),
    TWITTER_CREATOR: z.string().min(1, "Twitter creator is required"),
    TWITTER_SITE: z.string().min(1, "Twitter site is required"),
    SITE_NAME: z.string().min(1, "Site name is required"),
    PAYLOAD_PUBLIC_SERVER_URL: z
      .url()
      .min(1, "Payload public server URL is required"),
    PREVIEW_SECRET: z.string().min(1, "Preview secret is required"),
    STRIPE_SECRET_KEY: z.string().min(1, "Stripe secret key is required"),
    STRIPE_WEBHOOKS_SIGNING_SECRET: z
      .string()
      .min(1, "Stripe webhooks signing secret is required"),
  },
  client: {
    NEXT_PUBLIC_SERVER_URL: z
      .url()
      .min(1, "Next public server URL is required"),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z
      .string()
      .min(1, "Next public stripe publishable key is required"),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },
});
