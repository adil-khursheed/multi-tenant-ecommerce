import crypto from "crypto";

import { getPayload, Payload } from "payload";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { appRouter, createCallerFactory } from "@repo/api";
import { COD_FEE } from "@repo/payments";

import config from "@/payload.config";

// Runs the full tRPC flow offline: no real Razorpay network calls.
vi.mock("razorpay", () => {
  let orderCounter = 0;
  return {
    default: class MockRazorpay {
      orders = {
        create: async () => ({ id: `order_test_${++orderCounter}` }),
      };
      payments = {
        fetch: async () => ({ status: "captured" }),
      };
    },
  };
});

let payload: Payload;
const createCaller = createCallerFactory(appRouter);

beforeAll(async () => {
  const payloadConfig = await config;
  payload = await getPayload({ config: payloadConfig });
});

let unique = Date.now().toString(36);
let counter = 0;

const created = {
  users: [] as string[],
  tenants: [] as string[],
  products: [] as string[],
  carts: [] as string[],
  orders: [] as string[],
};

function nextUnique() {
  return `${unique}-${counter++}`;
}

async function createTenant(storeName: string, commissionRate: number) {
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
      commissionRate,
    },
  });
  created.tenants.push(doc.id);
  return doc;
}

async function createProduct(
  tenantId: string,
  price: number,
  inventory: number,
  skuPrefix: string,
) {
  const doc = await payload.create({
    collection: "products",
    data: {
      title: `Test Product ${skuPrefix} ${nextUnique()}`,
      tenant: tenantId,
      priceInINR: price,
      inventory,
      sku: `${skuPrefix}-${nextUnique()}`,
    },
  });
  created.products.push(doc.id);
  return doc;
}

async function createUser() {
  const doc = await payload.create({
    collection: "users",
    data: {
      email: `customer-${nextUnique()}@example.com`,
      password: "password123",
      name: "Test Customer",
      phone: "9876543210",
    },
  });
  created.users.push(doc.id);
  return doc;
}

async function createCart(customerId: string, items: { product: string; quantity: number }[]) {
  const doc = await payload.create({
    collection: "carts",
    data: {
      customer: customerId,
      currency: "INR",
      items,
    },
  });
  created.carts.push(doc.id);
  return doc;
}

describe("COD checkout", () => {
  const billingAddress = {
    firstName: "Test",
    lastName: "User",
    addressLine1: "123 Test Street",
    city: "Mumbai",
    state: "MH",
    postalCode: "400001",
    country: "India",
    phone: "9876543210",
  };

  it("creates one fulfillment for a single-tenant order", async () => {
    const tenant = await createTenant("Solo Tenant", 12);
    const p1 = await createProduct(tenant.id, 300, 4, "SOLO1");
    const p2 = await createProduct(tenant.id, 120, 6, "SOLO2");
    const user = await createUser();
    await createCart(user.id, [
      { product: p1.id, quantity: 1 },
      { product: p2.id, quantity: 3 },
    ]);

    const caller = createCaller({ payload, session: { user } });
    const initiated = await caller.payments.initiate({ method: "cod" });
    expect(initiated.amount).toBe(300 + 120 * 3 + COD_FEE);

    const confirmed = await caller.payments.confirm({
      method: "cod",
      transactionID: initiated.transactionID,
    });
    created.orders.push(confirmed.orderID);

    const order = await payload.findByID({
      collection: "orders",
      id: confirmed.orderID,
      depth: 0,
    });
    expect(order.shippingAddress?.addressLine1).toBe(undefined);

    const fulfillments = await payload.find({
      collection: "fulfillments",
      where: { order: { equals: confirmed.orderID } },
      depth: 0,
      pagination: false,
    });
    expect(fulfillments.totalDocs).toBe(1);

    const fulfillment = fulfillments.docs[0]!;
    expect(fulfillment.tenant).toBe(tenant.id);
    expect(fulfillment.items?.length).toBe(2);
    expect(fulfillment.subtotal).toBe(300 + 120 * 3);
    expect(fulfillment.status).toBe("confirmed");

    const commissions = await payload.find({
      collection: "commissions",
      where: { order: { equals: confirmed.orderID } },
      depth: 0,
      pagination: false,
    });
    expect(commissions.totalDocs).toBe(1);
    expect(commissions.docs[0]).toMatchObject({
      tenant: tenant.id,
      status: "pending",
      orderAmount: 300 + 120 * 3,
      commissionRate: 12,
    });
  });

  it("splits a two-tenant order into one fulfillment per tenant", async () => {
    const tenantA = await createTenant("Tenant Alpha", 10);
    const tenantB = await createTenant("Tenant Beta", 15);
    const pA1 = await createProduct(tenantA.id, 100, 10, "ALPHA1");
    const pA2 = await createProduct(tenantA.id, 200, 5, "ALPHA2");
    const pB1 = await createProduct(tenantB.id, 150, 8, "BETA1");
    const user = await createUser();
    await createCart(user.id, [
      { product: pA1.id, quantity: 1 },
      { product: pA2.id, quantity: 2 },
      { product: pB1.id, quantity: 1 },
    ]);

    const caller = createCaller({ payload, session: { user } });
    const initiated = await caller.payments.initiate({
      method: "cod",
      billingAddress,
    });
    const expectedSubtotal = 100 + 200 * 2 + 150;
    expect(initiated.amount).toBe(expectedSubtotal + COD_FEE);

    const confirmed = await caller.payments.confirm({
      method: "cod",
      transactionID: initiated.transactionID,
    });
    created.orders.push(confirmed.orderID);

    const order = await payload.findByID({
      collection: "orders",
      id: confirmed.orderID,
      depth: 0,
    });

    // billingAddress flows through the transaction onto the order
    expect(order.shippingAddress?.addressLine1).toBe("123 Test Street");

    // per-item tenant + lineTotal snapshots persisted on the order
    const itemTenants = (order.items ?? []).map((item: any) =>
      typeof item.tenant === "object" ? item.tenant.id : item.tenant,
    );
    expect(itemTenants).toContain(tenantA.id);
    expect(itemTenants).toContain(tenantB.id);
    const lineTotals = (order.items ?? []).reduce(
      (sum: number, item: any) => sum + item.lineTotal,
      0,
    );
    expect(lineTotals).toBe(expectedSubtotal);

    const fulfillments = await payload.find({
      collection: "fulfillments",
      where: { order: { equals: confirmed.orderID } },
      depth: 0,
      pagination: false,
    });
    expect(fulfillments.totalDocs).toBe(2);

    const fulfillmentA = fulfillments.docs.find(
      (f) => f.tenant === tenantA.id,
    );
    const fulfillmentB = fulfillments.docs.find(
      (f) => f.tenant === tenantB.id,
    );
    expect(fulfillmentA).toBeDefined();
    expect(fulfillmentB).toBeDefined();

    // each fulfillment contains only that tenant's items
    for (const fulfillment of [fulfillmentA!, fulfillmentB!]) {
      for (const item of fulfillment.items ?? []) {
        const itemTenant = item.tenant
          ? typeof item.tenant === "object"
            ? item.tenant.id
            : item.tenant
          : undefined;
        expect(itemTenant).toBe(fulfillment.tenant);
      }
    }

    expect(fulfillmentA!.subtotal).toBe(100 + 200 * 2);
    expect(fulfillmentB!.subtotal).toBe(150);
    expect(fulfillmentA!.status).toBe("confirmed");
    expect(fulfillmentB!.status).toBe("confirmed");

    // COD fee (platform revenue) is excluded from every fulfillment subtotal
    const sumSubtotals = fulfillmentA!.subtotal + fulfillmentB!.subtotal;
    expect(sumSubtotals).toBe(expectedSubtotal);
    expect(order.amount).toBe(sumSubtotals + COD_FEE);

    const commissions = await payload.find({
      collection: "commissions",
      where: { order: { equals: confirmed.orderID } },
      depth: 0,
      pagination: false,
    });
    expect(commissions.totalDocs).toBe(2);
    expect(commissions.docs.find((c) => c.tenant === tenantA.id)).toMatchObject(
      {
        status: "pending",
        orderAmount: 100 + 200 * 2,
        commissionRate: 10,
        commissionAmount: 50,
        vendorPayout: 450,
      },
    );
    expect(commissions.docs.find((c) => c.tenant === tenantB.id)).toMatchObject(
      {
        status: "pending",
        orderAmount: 150,
        commissionRate: 15,
        commissionAmount: Math.round((150 * 15) / 100),
        vendorPayout: 150 - Math.round((150 * 15) / 100),
      },
    );

    // inventory is decremented per confirmed item
    const [pA1After, pA2After, pB1After] = await Promise.all([
      payload.findByID({ collection: "products", id: pA1.id, depth: 0 }),
      payload.findByID({ collection: "products", id: pA2.id, depth: 0 }),
      payload.findByID({ collection: "products", id: pB1.id, depth: 0 }),
    ]);
    expect(pA1After.inventory).toBe(9);
    expect(pA2After.inventory).toBe(3);
    expect(pB1After.inventory).toBe(7);
  });
});

describe("Razorpay checkout", () => {
  it("rejects an invalid signature and confirms with a valid one", async () => {
    const tenant = await createTenant("Razorpay Tenant", 10);
    const product = await createProduct(tenant.id, 500, 3, "RZ1");
    const user = await createUser();
    await createCart(user.id, [{ product: product.id, quantity: 1 }]);

    const caller = createCaller({ payload, session: { user } });
    const initiated = await caller.payments.initiate({
      method: "razorpay",
    });

    await expect(
      caller.payments.confirm({
        method: "razorpay",
        razorpayOrderID: initiated.razorpayOrderID,
        razorpayPaymentID: "pay_test_123",
        razorpaySignature: "bogus-signature",
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });

    const keySecret = process.env.RAZORPAY_KEY_SECRET!;
    const validSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${initiated.razorpayOrderID}|pay_test_123`)
      .digest("hex");

    const confirmed = await caller.payments.confirm({
      method: "razorpay",
      razorpayOrderID: initiated.razorpayOrderID,
      razorpayPaymentID: "pay_test_123",
      razorpaySignature: validSignature,
    });
    created.orders.push(confirmed.orderID);

    const order = await payload.findByID({
      collection: "orders",
      id: confirmed.orderID,
      depth: 0,
    });
    expect(order).toBeDefined();

    const fulfillments = await payload.find({
      collection: "fulfillments",
      where: { order: { equals: confirmed.orderID } },
      depth: 0,
      pagination: false,
    });
    expect(fulfillments.totalDocs).toBe(1);
  });
});

afterAll(async () => {
  if (created.orders.length) {
    const orderWhere = { id: { in: created.orders } } as any;
    await payload.delete({
      collection: "commissions",
      where: { order: { in: created.orders } } as any,
      depth: 0,
    });
    await payload.delete({
      collection: "fulfillments",
      where: { order: { in: created.orders } } as any,
      depth: 0,
    });
    await payload.delete({ collection: "orders", where: orderWhere, depth: 0 });
  }

  if (created.users.length) {
    await payload.delete({
      collection: "transactions",
      where: { order: { in: created.orders } } as any,
      depth: 0,
    });
    await payload.delete({
      collection: "carts",
      where: { customer: { in: created.users } } as any,
      depth: 0,
    });
    await payload.delete({
      collection: "users",
      where: { id: { in: created.users } } as any,
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

  if (created.tenants.length) {
    await payload.delete({
      collection: "tenants",
      where: { id: { in: created.tenants } } as any,
      depth: 0,
    });
  }
});
