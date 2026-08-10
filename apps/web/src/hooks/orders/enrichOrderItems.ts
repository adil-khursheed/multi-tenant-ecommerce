import type { CollectionBeforeChangeHook } from "payload";

// Resolves the owning tenant and per-line total for every item in an order
// and writes them onto `data.items` before validation/save.
export const enrichOrderItems: CollectionBeforeChangeHook = async ({
  data,
  req,
}) => {
  if (!data) return data;
  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    return data;
  }

  const enriched = [];
  for (const item of data.items) {
    const productId =
      typeof item.product === "object" && item.product !== null
        ? (item.product as { id: string }).id
        : (item.product as string | undefined);
    const variantId = item.variant
      ? typeof item.variant === "object" && item.variant !== null
        ? (item.variant as { id: string }).id
        : (item.variant as string | undefined)
      : undefined;
    const quantity = item.quantity || 1;

    let price = 0;
    let tenantId: string | null = null;

    if (variantId) {
      const variant = await req.payload.findByID({
        collection: "variants",
        id: variantId,
        depth: 0,
        select: { effectivePrice: true, priceInINR: true, product: true },
      });
      if (variant) {
        price = variant.effectivePrice ?? variant.priceInINR ?? 0;
        const variantProduct =
          typeof variant.product === "object" && variant.product !== null
            ? (variant.product as { id: string }).id
            : (variant.product as string | undefined);
        if (variantProduct) {
          const product = await req.payload.findByID({
            collection: "products",
            id: variantProduct,
            depth: 0,
            select: { tenant: true },
          });
          tenantId = resolveTenantId(product?.tenant);
        }
      }
    } else if (productId) {
      const product = await req.payload.findByID({
        collection: "products",
        id: productId,
        depth: 0,
        select: { effectivePrice: true, priceInINR: true, tenant: true },
      });
      if (product) {
        price = product.effectivePrice ?? product.priceInINR ?? 0;
        tenantId = resolveTenantId(product.tenant);
      }
    }

    enriched.push({
      ...item,
      tenant: tenantId ?? item.tenant ?? null,
      lineTotal: Math.round(price * quantity),
    });
  }

  data.items = enriched;
  return data;
};

function resolveTenantId(tenant: unknown): string | null {
  if (!tenant) return null;
  if (typeof tenant === "object") {
    return (tenant as { id: string }).id ?? null;
  }
  return (tenant as string) ?? null;
}
