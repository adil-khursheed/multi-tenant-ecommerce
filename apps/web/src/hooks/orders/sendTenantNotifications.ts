import type { PayloadRequest } from "payload";

import { tenantNewOrderHTML } from "@/email/templates";
import { getServerSideURL } from "@/utilities/getURL";

interface TenantNotificationArgs {
  order: any;
  req: PayloadRequest;
}

export async function sendTenantNotifications({
  order,
  req,
}: TenantNotificationArgs): Promise<void> {
  const payload = req.payload as any;

  const tenantMap = new Map<
    string,
    { name: string; itemCount: number; total: number }
  >();

  for (const item of order.items || []) {
    const tenant = item.tenant;
    if (!tenant || typeof tenant === "string" || !tenant.id) continue;

    const existing = tenantMap.get(tenant.id);
    if (existing) {
      existing.itemCount += item.quantity;
    } else {
      tenantMap.set(tenant.id, {
        name: tenant.storeName || "Vendor",
        itemCount: item.quantity,
        total: 0,
      });
    }
  }

  if (tenantMap.size === 0) return;

  const tenantIds = [...tenantMap.keys()];
  const tenants = await payload.find({
    collection: "tenants",
    where: {
      id: { in: tenantIds },
    },
    limit: tenantIds.length,
    depth: 0,
  });

  const serverURL = getServerSideURL();

  for (const tenant of tenants.docs) {
    const tenantData = tenantMap.get(tenant.id);
    if (!tenantData) continue;

    const orderAdminUrl = `${serverURL}/admin/collections/orders/${order.id}`;

    const html = tenantNewOrderHTML({
      tenantName: tenant.storeName || "Vendor",
      orderId: order.id,
      tenantTotal: order.amount || 0,
      itemCount: tenantData.itemCount,
      orderAdminUrl,
    });

    await payload.jobs.queue({
      task: "sendEmail",
      queue: "emails",
      input: {
        to: tenant.email,
        subject: `New order #${order.id}`,
        html,
      },
    });

    payload.logger.info({
      msg: "Tenant notification email queued",
      orderId: order.id,
      tenantId: tenant.id,
      to: tenant.email,
    });
  }
}
