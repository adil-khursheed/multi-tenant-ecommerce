import Razorpay from "razorpay";

import { env } from "@/env";

let client: Razorpay | null = null;

/**
 * Returns a singleton Razorpay client.
 * Throws clearly if credentials are missing rather than failing silently at runtime.
 */
export function getRazorpayClient(): Razorpay {
  if (client) return client;

  const keyId = env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error(
      "RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in environment variables",
    );
  }

  client = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return client;
}
