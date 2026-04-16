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
    BLOB_READ_WRITE_TOKEN: z
      .string()
      .min(1, "Blob read write token is required"),
  },
  client: {
    NEXT_PUBLIC_SERVER_URL: z
      .url()
      .min(1, "Next public server URL is required"),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z
      .string()
      .min(1, "Next public stripe publishable key is required"),
    NEXT_PUBLIC_FIREBASE_API_KEY: z
      .string()
      .min(1, "Firebase API key is required"),
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z
      .string()
      .min(1, "Firebase auth domain is required"),
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: z
      .string()
      .min(1, "Firebase project ID is required"),
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z
      .string()
      .min(1, "Firebase storage bucket is required"),
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z
      .string()
      .min(1, "Firebase messaging sender ID is required"),
    NEXT_PUBLIC_FIREBASE_APP_ID: z
      .string()
      .min(1, "Firebase app ID is required"),
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: z
      .string()
      .min(1, "Firebase measurement ID is required"),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID:
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID:
      process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  },
});
