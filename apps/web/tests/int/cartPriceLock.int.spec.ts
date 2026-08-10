import { getPayload, Payload } from "payload";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import config from "@/payload.config";

// Regression tests for "price locks at cart-save" (Approach A):
// - Cart items snapshot `unitPrice` (effective) + `basePrice` (undiscounted)
//   when the item is first added.
// - Later saves (e.g. coupon apply) must NOT re-price existing rows even if
//   the product discount changed in the meantime.
// - Only newly added rows snapshot the current price.

let payload: Payload;

const unique = `${Date.now().toString(36)}-${Math.random()
  .toString(36)
  .slice(2, 8)}`;
let counter = 0;

function nextUnique() {
  return `${unique}-${counter++}`;
}

const created = {
  carts: [] as string[],
  users: [] as string[],
  tenants: [] as string[],
  categories: [] as string[],
  products: [] as string[],
};

beforeAll(async () => {
  const payloadConfig = await config;
  payload = await getPayload({ config: payloadConfig });

  // Ensure `ensureFirstUserIsAdmin` does not promote our fixtures.
  const { totalDocs } = await payload.count({ collection: "users" });
  if (totalDocs === 0) {
    const seeder = await payload.create({
      collection: "users",
      data: {
        email: `seeder-${unique}@example.com`,
        password: "password123",
        name: "Seeder",
        phone: "9876543210",
      },
    });
    created.users.push(seeder.id);
  }
});

async function createTenant(storeName: string) {
  const suffix = nextUnique();
  const doc = await payload.create({
    collection: "tenants",
    data: {
      ownerName: `${storeName} Owner`,
      email: `${suffix}@example.com`,
      phone: "9876543210",
      storeName: `${storeName} ${suffix}`,
      storeSlug: `${storeName.toLowerCase()}-${suffix}`,
      businessName: `${storeName} Business`,
      businessType: "individual",
      panNumber: "ABCDE1234F",
      address: {
        street1: "1 Main Street",
        city: "Mumbai",
        state: "MH",
        postalCode: "400001",
        country: "IN",
      },
      bankDetails: {
        accountNumber: "1234567890",
        ifscCode: "HDFC0000001",
        bankName: "HDFC Bank",
        accountHolderName: `${storeName} Owner`,
        bankBranch: "Mumbai",
        bankAccountType: "savings",
      },
      commissionRate: 10,
    },
  });
  created.tenants.push(doc.id);
  return doc;
}

async function createCategory() {
  const doc = await payload.create({
    collection: "categories",
    data: {
      name: `Price Lock Category ${nextUnique()}`,
      slug: `price-lock-category-${nextUnique()}`,
    },
  });
  created.categories.push(doc.id);
  return doc;
}

async function createProduct(
  tenantId: string,
  categoryId: string,
  title: string,
  priceInINR: number,
) {
  const doc = await payload.create({
    collection: "products",
    data: {
      title,
      slug: `${title.toLowerCase()}-${nextUnique()}`,
      tenant: tenantId,
      categories: [categoryId],
      priceInINR,
      discountPercent: 0,
      inventory: 5,
      _status: "published",
    },
  });
  created.products.push(doc.id);
  return doc;
}

async function setDiscount(productId: string, discountPercent: number) {
  await payload.update({
    collection: "products",
    id: productId,
    data: { discountPercent },
  });
}

async function createCart(items: Array<{ product: string; quantity: number }>) {
  const cart = await payload.create({
    collection: "carts",
    data: { items },
  });
  created.carts.push(cart.id);
  return cart;
}

describe("cart price lock (Approach A)", () => {
  let productA: Awaited<ReturnType<typeof createProduct>>;
  let productB: Awaited<ReturnType<typeof createProduct>>;

  const BASE_A = 1000;

  beforeAll(async () => {
    const tenant = await createTenant("Price Lock Tenant");
    const category = await createCategory();
    productA = await createProduct(
      tenant.id,
      category.id,
      "Price Lock A",
      BASE_A,
    );
    productB = await createProduct(tenant.id, category.id, "Price Lock B", 200);
  });

  it("snapshots effective + base unit price when the item is added", async () => {
    await setDiscount(productA.id, 10); // effective = 900

    const cart = await createCart([{ product: productA.id, quantity: 2 }]);

    expect(cart.items).toHaveLength(1);
    const item = (cart.items as any[])[0];
    expect(item.unitPrice).toBe(900);
    expect(item.basePrice).toBe(BASE_A);
    expect(cart.subtotal).toBe(1800);
  });

  it("keeps the locked price on later saves (coupon apply) after the discount changes", async () => {
    await setDiscount(productA.id, 10); // effective = 900

    const cart = await createCart([{ product: productA.id, quantity: 2 }]);
    expect(cart.subtotal).toBe(1800);

    // Merchant bumps discount to 50% between add and checkout.
    await setDiscount(productA.id, 50); // effective = 500

    const updated = await payload.update({
      collection: "carts",
      id: cart.id,
      data: {
        items: cart.items as any,
        couponCode: "TEST10",
        couponDiscountType: "percentage",
        couponDiscountValue: 10,
      },
    });

    expect(updated.subtotal).toBe(1800); // NOT re-priced to 1000
    expect((updated.items as any[])[0].unitPrice).toBe(900);
    expect((updated.items as any[])[0].basePrice).toBe(BASE_A);
    expect(updated.discount).toBe(180);
    expect(updated.total).toBe(1620);
  });

  it("prices only newly added rows at the current price", async () => {
    await setDiscount(productA.id, 30); // effective = 700

    const cart = await createCart([{ product: productA.id, quantity: 1 }]);
    expect(cart.subtotal).toBe(700);

    const updated = await payload.update({
      collection: "carts",
      id: cart.id,
      data: {
        items: [
          ...(cart.items as any),
          { product: productB.id, quantity: 3 },
        ],
      },
    });

    const items = updated.items as any[];
    expect(items).toHaveLength(2);
    expect(items[0].unitPrice).toBe(700);
    expect(items[1].unitPrice).toBe(200);
    expect(items[1].basePrice).toBe(200);
    expect(updated.subtotal).toBe(700 + 600);
  });
});

afterAll(async () => {
  if (created.carts.length) {
    await payload.delete({
      collection: "carts",
      where: { id: { in: created.carts } } as any,
      depth: 0,
    });
  }

  if (created.products.length) {
    await payload.delete({
      collection: "products",
      where: { id: { in: created.products } } as any,
      depth: 0,
    });
  }

  if (created.users.length) {
    await payload.delete({
      collection: "users",
      where: { id: { in: created.users } } as any,
      depth: 0,
    });
  }

  if (created.categories.length) {
    await payload.delete({
      collection: "categories",
      where: { id: { in: created.categories } } as any,
      depth: 0,
    });
  }

  if (created.tenants.length) {
    await payload.delete({
      collection: "tenants",
      where: { id: { in: created.tenants } } as any,
      depth: 0,
    });
  }
});
