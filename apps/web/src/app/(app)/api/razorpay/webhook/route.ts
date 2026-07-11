import { getPayload } from "payload";

import configPromise from "@payload-config";
import { env } from "@/env";
import {
  verifyWebhookSignature,
  parseWebhookEvent,
  dispatchWebhookEvent,
  createDefaultWebhookHandlers,
  type WebhookHandlers,
} from "@repo/payments/razorpay";

const webhookHandlers: WebhookHandlers = createDefaultWebhookHandlers()

export async function POST(req: Request) {
  const payload = await getPayload({ config: configPromise });
  let rawBody: string;

  try {
    rawBody = (await req.text?.()) || "";
  } catch {
    return Response.json(
      { error: "Could not read request body" },
      { status: 400 },
    );
  }

  const signature = req.headers.get("x-razorpay-signature") ?? "";

  if (!verifyWebhookSignature(rawBody, signature, env.RAZORPAY_WEBHOOK_SECRET)) {
    payload.logger.warn({ msg: "Invalid Razorpay webhook signature" });
    return Response.json(
      { error: "Invalid webhook signature" },
      { status: 400 },
    );
  }

  let event;
  try {
    event = parseWebhookEvent(rawBody);
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  payload.logger.info({
    msg: `Razorpay webhook received: ${event.event}`,
    eventId: event.id,
  });

  try {
    await dispatchWebhookEvent(event, webhookHandlers, { payload } as any);
  } catch (err: any) {
    payload.logger.error({
      msg: `Webhook handler error for event: ${event.event}`,
      error: err?.message,
    });
    return Response.json({ error: "Handler failed" }, { status: 500 });
  }

  return Response.json({ received: true });
}
