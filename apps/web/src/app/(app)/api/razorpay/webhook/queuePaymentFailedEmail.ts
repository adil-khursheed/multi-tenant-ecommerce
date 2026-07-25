import type { Payload } from "payload";

import { orderFailedHTML } from "@/email/templates";
import { getServerSideURL } from "@/utilities/getURL";

interface Args {
  payload: Payload;
  razorpayOrderId: string;
}

export async function queuePaymentFailedEmail({
  payload,
  razorpayOrderId,
}: Args): Promise<void> {
  try {
    const transactions = await payload.find({
      collection: "transactions",
      where: {
        "razorpay.orderID": { equals: razorpayOrderId },
      },
      limit: 1,
      depth: 0,
    });

    const transaction = transactions.docs[0];
    if (!transaction) return;

    const email = transaction.customerEmail || null;
    if (!email) return;

    const customerName =
      transaction.customer && typeof transaction.customer === "object"
        ? (transaction.customer as { name?: string }).name
        : undefined;

    const serverURL = getServerSideURL();
    const retryUrl = `${serverURL}/checkout`;

    const html = orderFailedHTML({
      customerName,
      transactionId: transaction.id,
      paymentMethod: transaction.paymentMethod || "razorpay",
      amount: transaction.amount || 0,
      retryUrl,
      failureReason: "The payment could not be processed by your bank.",
    });

    await payload.jobs.queue({
      task: "sendEmail",
      queue: "emails",
      input: {
        to: email,
        subject: `Payment failed for order attempt #${transaction.id}`,
        html,
      },
    });

    payload.logger.info({
      msg: "Payment failed email queued",
      transactionId: transaction.id,
      to: email,
    });
  } catch (err) {
    payload.logger.error({
      msg: "Failed to queue payment failed email",
      razorpayOrderId,
      err,
    });
  }
}
