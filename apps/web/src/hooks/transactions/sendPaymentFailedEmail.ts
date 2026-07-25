import type { CollectionAfterChangeHook } from "payload";

import { orderFailedHTML } from "@/email/templates";
import { getServerSideURL } from "@/utilities/getURL";

export const sendPaymentFailedEmail: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  if (operation !== "update") return;
  if (!previousDoc || previousDoc.status === "failed") return;
  if (doc.status !== "failed") return;

  const email =
    doc.customerEmail ||
    (doc.customer && typeof doc.customer === "object"
      ? doc.customer.email
      : null);
  if (!email) return;

  try {
    const customerName =
      doc.customer && typeof doc.customer === "object"
        ? (doc.customer as any).name
        : undefined;

    const serverURL = getServerSideURL();
    const retryUrl = `${serverURL}/checkout`;

    const html = orderFailedHTML({
      customerName,
      transactionId: doc.id,
      paymentMethod: doc.paymentMethod || "razorpay",
      amount: doc.amount || 0,
      retryUrl,
      failureReason: "The payment could not be processed by your bank.",
    });

    await req.payload.jobs.queue({
      task: "sendEmail",
      queue: "emails",
      input: {
        to: email,
        subject: `Payment failed for order attempt #${doc.id}`,
        html,
      },
    });

    req.payload.logger.info({
      msg: "Payment failed email queued",
      transactionId: doc.id,
      to: email,
    });
  } catch (err) {
    req.payload.logger.error({
      msg: "Failed to queue payment failed email",
      transactionId: doc.id,
      err,
    });
  }
};
