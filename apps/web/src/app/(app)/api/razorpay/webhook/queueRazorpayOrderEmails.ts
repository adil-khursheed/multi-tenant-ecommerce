import type { Payload } from "payload";

import { orderConfirmationHTML } from "@/email/templates";
import { sendTenantNotifications } from "@/hooks/orders/sendTenantNotifications";
import { getServerSideURL } from "@/utilities/getURL";

interface Args {
  payload: Payload;
  razorpayOrderId: string;
}

export async function queueRazorpayOrderEmails({
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
    if (transaction.status === "succeeded") {
      const existingOrders = await payload.find({
        collection: "orders",
        where: {
          transactions: { equals: transaction.id },
        },
        limit: 1,
        depth: 0,
      });
      if (existingOrders.totalDocs > 0 && existingOrders.docs[0]) {
        const email =
          existingOrders.docs[0].customerEmail ||
          (existingOrders.docs[0].customer &&
          typeof existingOrders.docs[0].customer === "object"
            ? (existingOrders.docs[0].customer as { email?: string }).email
            : null);
        if (!email) return;

        const populatedOrder = await payload.findByID({
          collection: "orders",
          id: existingOrders.docs[0].id,
          depth: 2,
        });

        const items =
          populatedOrder.items?.map((item) => ({
            name:
              item.product && typeof item.product === "object"
                ? item.product.title || "Product"
                : "Product",
            quantity: item.quantity,
          })) || [];

        const serverURL = getServerSideURL();
        const orderUrl = `${serverURL}/orders/${populatedOrder.id}?email=${encodeURIComponent(email)}&accessToken=${populatedOrder.accessToken || ""}`;

        const customerName =
          populatedOrder.customer && typeof populatedOrder.customer === "object"
            ? populatedOrder.customer.name
            : undefined;

        const html = orderConfirmationHTML({
          customerName,
          orderId: populatedOrder.id,
          items,
          subtotal: populatedOrder.amount || 0,
          discount: populatedOrder.discount || 0,
          shippingCharge: populatedOrder.shippingCharge || 0,
          total: populatedOrder.amount || 0,
          paymentMethod: "razorpay",
          shippingAddress: populatedOrder.shippingAddress || undefined,
          orderUrl,
        });

        await payload.jobs.queue({
          task: "sendEmail",
          queue: "emails",
          input: {
            to: email,
            subject: `Order confirmed #${populatedOrder.id}`,
            html,
          },
        });

        payload.logger.info({
          msg: "Razorpay order confirmation email queued",
          orderId: populatedOrder.id,
          to: email,
        });

        await sendTenantNotifications({
          order: populatedOrder,
          req: { payload } as any,
        });
      }
    }
  } catch (err) {
    payload.logger.error({
      msg: "Failed to queue Razorpay order emails",
      razorpayOrderId,
      err,
    });
  }
}
