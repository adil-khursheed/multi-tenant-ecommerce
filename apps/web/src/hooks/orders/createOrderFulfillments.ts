import type { CollectionAfterChangeHook } from "payload";

import type { Fulfillment } from "@/payload-types";

type FulfillmentItem = {
  product?: unknown;
  variant?: unknown;
  quantity: number;
  tenant?: unknown;
  lineTotal?: number;
};

// Splits an order into per-tenant fulfillment records (and one commission
// record per tenant) so each tenant only sees their own products.
export const createOrderFulfillments: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
}) => {
  if (operation !== "create") return;

  const items = (doc.items || []) as FulfillmentItem[];
  if (!items.length) return;

  // Idempotency: only create fulfillments once per order.
  const existing = await req.payload.find({
    collection: "fulfillments",
    where: { order: { equals: doc.id } },
    limit: 1,
    depth: 0,
    req,
  });
  if (existing.totalDocs > 0) return;

  const byTenant = new Map<string, FulfillmentItem[]>();
  for (const item of items) {
    const tenantId =
      typeof item.tenant === "object" && item.tenant !== null
        ? (item.tenant as { id: string }).id
        : (item.tenant as string | undefined);
    if (!tenantId) continue;
    const list = byTenant.get(tenantId) ?? [];
    list.push(item);
    byTenant.set(tenantId, list);
  }
  if (byTenant.size === 0) return;

  const tenantIds = [...byTenant.keys()];
  const tenantsResult = await req.payload.find({
    collection: "tenants",
    where: { id: { in: tenantIds } },
    limit: tenantIds.length,
    depth: 0,
    req,
  });
  const tenantsById = new Map<string, { commissionRate?: number | null }>();
  for (const tenant of tenantsResult.docs) {
    tenantsById.set(tenant.id, tenant);
  }

  for (const [tenantId, tenantItems] of byTenant) {
    const tenant = tenantsById.get(tenantId);
    const commissionRate = tenant?.commissionRate ?? 0;
    const subtotal = tenantItems.reduce(
      (sum, item) => sum + (item.lineTotal ?? 0),
      0,
    );
    const commissionAmount = Math.round((subtotal * commissionRate) / 100);
    const vendorPayout = subtotal - commissionAmount;

    const fulfillmentItems = tenantItems.map((item) => ({
      product:
        typeof item.product === "object" && item.product !== null
          ? (item.product as { id: string }).id
          : item.product,
      ...(item.variant
        ? {
            variant:
              typeof item.variant === "object" && item.variant !== null
                ? (item.variant as { id: string }).id
                : item.variant,
          }
        : {}),
      quantity: item.quantity,
      tenant: tenantId,
      lineTotal: item.lineTotal ?? 0,
    }));

    await req.payload.create({
      collection: "fulfillments",
      data: {
        order: doc.id,
        items: fulfillmentItems as Fulfillment["items"],
        subtotal,
        commissionRate,
        commissionAmount,
        vendorPayout,
        status: "confirmed",
        tenant: tenantId,
      },
      req,
    });

    await req.payload.create({
      collection: "commissions",
      data: {
        tenant: tenantId,
        order: doc.id,
        orderAmount: subtotal,
        commissionRate,
        commissionAmount,
        vendorPayout,
        status: "pending",
      },
      req,
    });

    req.payload.logger.info({
      msg: "Order fulfillment created",
      orderId: doc.id,
      tenantId,
      subtotal,
      commissionAmount,
    });
  }
};
