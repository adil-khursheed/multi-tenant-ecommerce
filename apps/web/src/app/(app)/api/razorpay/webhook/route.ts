import { getPayload } from "payload";
import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils";

import configPromise from "@payload-config";
import { env } from "@/env";

// TODO: Implement actual handlers
const handlePaymentCapture = async (event: any, payload: any) => {};
const handleTransferProcessed = async (event: any, payload: any) => {};
const handleRefundProcessed = async (event: any, payload: any) => {};
const handlePaymentDisputeCreated = async (event: any, payload: any) => {};

// Define basic type for RazorpayWebhookEvent to fix undefined type
type RazorpayWebhookEvent = { event: string; id: string; [key: string]: any };

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

  try {
    validateWebhookSignature(rawBody, signature, env.RAZORPAY_WEBHOOK_SECRET);
  } catch {
    payload.logger.warn({ msg: "Invalid Razorpay webhook signature" });
    return Response.json(
      { error: "Invalid webhook signature" },
      { status: 400 },
    );
  }

  let event: RazorpayWebhookEvent;

  try {
    event = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  payload.logger.info({
    msg: `Razorpay webhook received: ${event.event}`,
    eventId: event.id,
  });

  try {
    switch (event.event) {
      case "payment.captured":
        await handlePaymentCapture(event, payload);
        break;
      case "transfer.processed":
        await handleTransferProcessed(event, payload);
        break;
      case "refund.processed":
        await handleRefundProcessed(event, payload);
        break;
      case "payment.dispute.created":
        await handlePaymentDisputeCreated(event, payload);
        break;
      default:
        payload.logger.info({
          msg: `Unknown Razorpay webhook event: ${event.event}`,
          eventId: event.id,
        });
    }
  } catch (err: any) {
    payload.logger.error({
      msg: `Webhook handler error for event: ${event.event}`,
      error: err?.message,
    });
    // Return 500 so Razorpay retries the event
    return Response.json({ error: "Handler failed" }, { status: 500 });
  }

  // Always return 200 for handled events so Razorpay doesn't retry
  return Response.json({ received: true });
}
