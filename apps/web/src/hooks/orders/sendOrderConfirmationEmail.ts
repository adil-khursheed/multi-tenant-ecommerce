import type { CollectionAfterChangeHook } from "payload";

import { orderConfirmationHTML } from "@/email/templates";
import { getServerSideURL } from "@/utilities/getURL";
import { sendTenantNotifications } from "./sendTenantNotifications";

export const sendOrderConfirmationEmail: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== "create") return;

  const email =
    doc.customerEmail ||
    (doc.customer && typeof doc.customer === "object"
      ? doc.customer.email
      : null);
  if (!email) return;

  try {
    const populatedOrder = await req.payload.findByID({
      collection: "orders",
      id: doc.id,
      depth: 2,
      req,
    });

    const transaction = populatedOrder.transactions?.[0];
    if (
      transaction &&
      typeof transaction === "object" &&
      transaction.paymentMethod === "razorpay"
    ) {
      return;
    }

    const items =
      populatedOrder.items?.map((item: any) => ({
        name:
          item.product && typeof item.product === "object"
            ? item.product.title || "Product"
            : "Product",
        quantity: item.quantity,
      })) || [];

    const serverURL = getServerSideURL();
    const orderUrl = `${serverURL}/orders/${doc.id}?email=${encodeURIComponent(email)}&accessToken=${doc.accessToken || ""}`;

    const html = orderConfirmationHTML({
      customerName:
        populatedOrder.customer && typeof populatedOrder.customer === "object"
          ? (populatedOrder.customer as any).name
          : undefined,
      orderId: doc.id,
      items,
      subtotal: doc.amount || 0,
      discount: doc.discount || 0,
      shippingCharge: doc.shippingCharge || 0,
      total: doc.amount || 0,
      paymentMethod:
        transaction &&
        typeof transaction === "object" &&
        transaction.paymentMethod === "cod"
          ? "cod"
          : "razorpay",
      shippingAddress: doc.shippingAddress || undefined,
      orderUrl,
    });

    await req.payload.jobs.queue({
      task: "sendEmail",
      queue: "emails",
      input: {
        to: email,
        subject: `Order confirmed #${doc.id}`,
        html,
      },
    });

    req.payload.logger.info({
      msg: "Order confirmation email queued",
      orderId: doc.id,
      to: email,
    });

    await sendTenantNotifications({ order: populatedOrder, req });
  } catch (err) {
    req.payload.logger.error({
      msg: "Failed to queue order confirmation email",
      orderId: doc.id,
      err,
    });
  }
};
