import { getPayload, Payload } from "payload";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import config from "@/payload.config";

// Regression test for the cart bug: a logged-in customer's cart showed no
// line items because the multi-tenant plugin denied product reads to users
// without tenant assignments. Customers must be able to read published
// products (any tenant) while vendors stay tenant-scoped.

let payload: Payload;

const unique = Date.now().toString(36);
let counter = 0;

function nextUnique() {
  return `${unique}-${counter++}`;
}

const created = {
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
      name: `Access Test Category ${nextUnique()}`,
      slug: `access-test-category-${nextUnique()}`,
    },
  });
  created.categories.push(doc.id);
  return doc;
}

async function createProduct(
  tenantId: string,
  categoryId: string,
  title: string,
  options?: { status?: "published" },
) {
  const doc = await payload.create({
    collection: "products",
    data: {
      title,
      slug: `${title.toLowerCase()}-${nextUnique()}`,
      tenant: tenantId,
      categories: [categoryId],
      priceInINR: 100,
      inventory: 5,
      _status: options?.status ?? "draft",
    },
  });
  created.products.push(doc.id);
  return doc;
}

async function createUser(overrides: Partial<Record<string, unknown>> = {}) {
  const doc = await payload.create({
    collection: "users",
    data: {
      email: `user-${nextUnique()}@example.com`,
      password: "password123",
      name: "Access Test User",
      phone: "9876543210",
      ...overrides,
    },
  });
  created.users.push(doc.id);
  return doc;
}

describe("product read access (access enforced)", () => {
  let tenantA: Awaited<ReturnType<typeof createTenant>>;
  let tenantB: Awaited<ReturnType<typeof createTenant>>;
  let category: Awaited<ReturnType<typeof createCategory>>;
  let publishedA: Awaited<ReturnType<typeof createProduct>>;
  let publishedB: Awaited<ReturnType<typeof createProduct>>;
  let draftA: Awaited<ReturnType<typeof createProduct>>;
  let customer: Awaited<ReturnType<typeof createUser>>;
  let vendorA: Awaited<ReturnType<typeof createUser>>;

  beforeAll(async () => {
    tenantA = await createTenant("Access Tenant A");
    tenantB = await createTenant("Access Tenant B");
    category = await createCategory();
    publishedA = await createProduct(tenantA.id, category.id, "Access Pub A", {
      status: "published",
    });
    publishedB = await createProduct(tenantB.id, category.id, "Access Pub B", {
      status: "published",
    });
    draftA = await createProduct(tenantA.id, category.id, "Access Draft A");
    customer = await createUser();
    vendorA = await createUser({
      roles: ["vendor"],
      tenants: [{ tenant: tenantA.id }],
    });
  });

  it("lets a customer read published products from any tenant", async () => {
    const res = await payload.find({
      collection: "products",
      user: customer,
      overrideAccess: false,
      depth: 0,
      pagination: false,
      where: {
        and: [
          { _status: { equals: "published" } },
          { title: { in: [publishedA.title, publishedB.title] } },
        ],
      },
    });
    const ids = res.docs.map((d) => d.id);
    expect(ids).toContain(publishedA.id);
    expect(ids).toContain(publishedB.id);
  });

  it("still hides drafts from customers", async () => {
    const res = await payload.find({
      collection: "products",
      user: customer,
      overrideAccess: false,
      depth: 0,
      pagination: false,
      where: {
        and: [
          { _status: { equals: "published" } },
          { title: { equals: draftA.title } },
        ],
      },
    });
    expect(res.totalDocs).toBe(0);
  });

  it("keeps vendors tenant-scoped", async () => {
    const res = await payload.find({
      collection: "products",
      user: vendorA,
      overrideAccess: false,
      depth: 0,
      pagination: false,
      where: {
        and: [
          { _status: { equals: "published" } },
          { title: { in: [publishedA.title, publishedB.title] } },
        ],
      },
    });
    const ids = res.docs.map((d) => d.id);
    expect(ids).toContain(publishedA.id);
    expect(ids).not.toContain(publishedB.id);
  });
});

afterAll(async () => {
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
