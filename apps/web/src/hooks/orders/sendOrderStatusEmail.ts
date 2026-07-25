import type { CollectionAfterChangeHook } from "payload";

import { orderStatusUpdateHTML } from "@/email/templates";
import { getServerSideURL } from "@/utilities/getURL";

const NOTIFY_STATUSES = ["completed", "cancelled", "refunded"] as const;

export const sendOrderStatusEmail: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  if (operation !== "update") return;
  if (!previousDoc || doc.status === previousDoc.status) return;
  if (
    !NOTIFY_STATUSES.includes(doc.status as (typeof NOTIFY_STATUSES)[number])
  ) {
    return;
  }

  const email =
    doc.customerEmail ||
    (doc.customer && typeof doc.customer === "object"
      ? doc.customer.email
      : null);
  if (!email) return;

  try {
    const serverURL = getServerSideURL();
    const orderUrl = `${serverURL}/orders/${doc.id}?email=${encodeURIComponent(email)}&accessToken=${doc.accessToken || ""}`;

    const customerName =
      doc.customer && typeof doc.customer === "object"
        ? (doc.customer as any).name
        : undefined;

    const html = orderStatusUpdateHTML({
      customerName,
      orderId: doc.id,
      newStatus: doc.status as "completed" | "cancelled" | "refunded",
      orderUrl,
    });

    const statusLabels: Record<string, string> = {
      completed: "delivered",
      cancelled: "cancelled",
      refunded: "refunded",
    };

    await req.payload.jobs.queue({
      task: "sendEmail",
      queue: "emails",
      input: {
        to: email,
        subject: `Order ${statusLabels[doc.status] || doc.status} #${doc.id}`,
        html,
      },
    });

    req.payload.logger.info({
      msg: "Order status email queued",
      orderId: doc.id,
      status: doc.status,
      to: email,
    });
  } catch (err) {
    req.payload.logger.error({
      msg: "Failed to queue order status email",
      orderId: doc.id,
      status: doc.status,
      err,
    });
  }
};
