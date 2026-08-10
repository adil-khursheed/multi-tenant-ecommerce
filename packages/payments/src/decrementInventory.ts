// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyPayload = any;

type InventoryItem = {
  product?: unknown;
  variant?: unknown;
  quantity: number;
};

/**
 * Decrements product/variant inventory for a set of order items.
 * Mirrors the ecommerce plugin's confirm-order behavior (direct db mutation,
 * bypasses hooks/access intentionally).
 */
export async function decrementInventory(
  payload: AnyPayload,
  items: InventoryItem[],
): Promise<void> {
  for (const item of items) {
    const quantity = item.quantity || 1;

    if (item.variant) {
      const id =
        typeof item.variant === "object" && item.variant !== null
          ? (item.variant as { id: string }).id
          : (item.variant as string);
      if (!id) continue;
      await payload.db.updateOne({
        id,
        collection: "variants",
        data: { inventory: { $inc: quantity * -1 } },
      });
    } else if (item.product) {
      const id =
        typeof item.product === "object" && item.product !== null
          ? (item.product as { id: string }).id
          : (item.product as string);
      if (!id) continue;
      await payload.db.updateOne({
        id,
        collection: "products",
        data: { inventory: { $inc: quantity * -1 } },
      });
    }
  }
}
