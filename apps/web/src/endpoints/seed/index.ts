/**
 * seed.ts — run once to populate all taxonomy from the client spec
 *
 * Usage:
 *   npx tsx src/seed.ts
 *
 * Requires MONGODB_URI and PAYLOAD_SECRET in your .env
 */

import payload from "payload";

import config from "@/payload.config";

// ─── Seed data ───────────────────────────────────────────────────────────────

const CATEGORIES: Array<{ name: string; parent?: string; order: number }> = [
  // Top-level
  { name: "Co-ord Set", order: 0 },
  { name: "Kurtas & Tops", order: 1 },
  { name: "Bottoms", order: 2 },

  // Kurtas & Tops children
  { name: "Kurtas", parent: "Kurtas & Tops", order: 0 },
  { name: "Tops", parent: "Kurtas & Tops", order: 1 },
  { name: "Shrugs & Jacket", parent: "Kurtas & Tops", order: 2 },
  { name: "Dupattas", parent: "Kurtas & Tops", order: 3 },
  { name: "Nighty / Gown", parent: "Kurtas & Tops", order: 4 },

  // Bottoms children
  { name: "Churidar", parent: "Bottoms", order: 0 },
  { name: "Leggings", parent: "Bottoms", order: 1 },
  { name: "Pants", parent: "Bottoms", order: 2 },
  { name: "Plazzos", parent: "Bottoms", order: 3 },
  { name: "Salwar", parent: "Bottoms", order: 4 },
  { name: "Skirts", parent: "Bottoms", order: 5 },
  { name: "Sharara", parent: "Bottoms", order: 6 },
];

const COLLECTIONS: Array<{ name: string; season: string }> = [
  { name: "Classic Solid", season: "year-round" },
  { name: "Autumn / Winter", season: "autumn-winter" },
  { name: "Festive Wear", season: "festive" },
  { name: "Spring / Summer", season: "spring-summer" },
  { name: "Wedding Collection", season: "year-round" },
  { name: "Winter Wear", season: "autumn-winter" },
  { name: "Outdoor / Work", season: "year-round" },
];

const MATERIALS: Array<{
  name: string;
  isPremium?: boolean;
  isNatural?: boolean;
}> = [
  { name: "Pure Cotton", isNatural: true },
  { name: "Cambric Cotton", isNatural: true },
  { name: "Cotton Dobby", isNatural: true },
  { name: "Muslin", isNatural: true },
  { name: "Satin", isPremium: true },
  { name: "Lawn Cotton", isNatural: true },
  { name: "Egyptian Cotton", isNatural: true, isPremium: true },
  { name: "Flannel", isNatural: true },
  { name: "Denim" },
  { name: "Rayon / Viscose" },
  { name: "Wool", isNatural: true },
  { name: "Hakoba", isNatural: true },
  { name: "Crepe" },
  { name: "Slab Cotton", isNatural: true },
  { name: "Organic", isNatural: true },
  { name: "Linen", isNatural: true },
  { name: "Silk", isPremium: true, isNatural: true },
  { name: "Georgette", isPremium: true },
  { name: "Organza", isPremium: true },
  { name: "Chinon", isPremium: true },
  { name: "Shimmer", isPremium: true },
  { name: "Tissue", isPremium: true },
  { name: "Jimmy Choo", isPremium: true },
  { name: "Tie-Dye" },
  { name: "Bandhani" },
  { name: "Modal" },
];

const DESIGNS: Array<{ name: string; designFamily: string }> = [
  { name: "High Low", designFamily: "silhouette" },
  { name: "Long Straight", designFamily: "kurta-cut" },
  { name: "Anarkali", designFamily: "kurta-cut" },
  { name: "Alia Cut", designFamily: "kurta-cut" },
  { name: "Flared", designFamily: "silhouette" },
  { name: "A-Line", designFamily: "silhouette" },
  { name: "Slit", designFamily: "kurta-cut" },
  { name: "Shirt Style", designFamily: "kurta-cut" },
  { name: "Overlay", designFamily: "silhouette" },
  { name: "Halter Neck", designFamily: "neckline" },
  { name: "Wrap", designFamily: "silhouette" },
  { name: "Gown", designFamily: "dress-gown" },
  { name: "Pakistani", designFamily: "ethnic-fusion" },
  { name: "Princes Cut", designFamily: "kurta-cut" },
  { name: "Lace Kurti", designFamily: "embroidery-craft" },
  { name: "Asymmetrical", designFamily: "silhouette" },
  { name: "Jacket Style", designFamily: "kurta-cut" },
  { name: "Cape Style", designFamily: "silhouette" },
  { name: "Indo-Western", designFamily: "ethnic-fusion" },
  { name: "Floor-Length", designFamily: "dress-gown" },
  { name: "Denim", designFamily: "ethnic-fusion" },
  { name: "Boutique Style", designFamily: "kurta-cut" },
  { name: "Chikan Kari", designFamily: "embroidery-craft" },
];

// ─── Helper ──────────────────────────────────────────────────────────────────
function toSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ─── Seed functions ──────────────────────────────────────────────────────────
async function seedCategories() {
  payload.logger.info("Seeding categories…");

  // First pass: top-level
  const slugToId: Record<string, string> = {};

  for (const cat of CATEGORIES.filter((c) => !c.parent)) {
    const slug = toSlug(cat.name);
    const existing = await payload.find({
      collection: "categories",
      where: { slug: { equals: slug } },
    });
    if (existing.totalDocs > 0) {
      slugToId[slug] = existing.docs[0]?.id as string;
      continue;
    }
    const doc = await payload.create({
      collection: "categories",
      data: { name: cat.name, slug, order: cat.order, active: true },
    });
    slugToId[slug] = doc.id as string;
    payload.logger.info(`  ✓ ${cat.name}`);
  }

  // Second pass: children
  for (const cat of CATEGORIES.filter((c) => c.parent)) {
    const slug = toSlug(cat.name);
    const parentSlug = toSlug(cat.parent!);
    const parentId = slugToId[parentSlug];
    if (!parentId) {
      payload.logger.warn(`  ✗ Parent not found for ${cat.name}`);
      continue;
    }

    const existing = await payload.find({
      collection: "categories",
      where: { slug: { equals: slug } },
    });
    if (existing.totalDocs > 0) {
      payload.logger.info(`  — skipped (exists): ${cat.name}`);
      continue;
    }

    await payload.create({
      collection: "categories",
      data: {
        name: cat.name,
        slug,
        parent: parentId,
        order: cat.order,
        active: true,
      },
    });
    payload.logger.info(`  ✓ ${cat.name} (under ${cat.parent})`);
  }
}

async function seedCollections() {
  payload.logger.info("Seeding collections…");
  for (const col of COLLECTIONS) {
    const slug = toSlug(col.name);
    const existing = await payload.find({
      collection: "collections",
      where: { slug: { equals: slug } },
    });
    if (existing.totalDocs > 0) {
      payload.logger.info(`  — skipped: ${col.name}`);
      continue;
    }
    await payload.create({
      collection: "collections",
      data: { name: col.name, slug, season: col.season as any, active: true },
    });
    payload.logger.info(`  ✓ ${col.name}`);
  }
}

async function seedMaterials() {
  payload.logger.info("Seeding materials…");
  for (const [i, mat] of MATERIALS.entries()) {
    const slug = toSlug(mat.name);
    const existing = await payload.find({
      collection: "materials",
      where: { slug: { equals: slug } },
    });
    if (existing.totalDocs > 0) {
      payload.logger.info(`  — skipped: ${mat.name}`);
      continue;
    }
    await payload.create({
      collection: "materials",
      data: {
        name: mat.name,
        slug,
        isPremium: mat.isPremium ?? false,
        isNatural: mat.isNatural ?? false,
        active: true,
        order: i,
      },
    });
    payload.logger.info(`  ✓ ${mat.name}`);
  }
}

async function seedDesigns() {
  payload.logger.info("Seeding designs…");
  for (const [i, design] of DESIGNS.entries()) {
    const slug = toSlug(design.name);
    const existing = await payload.find({
      collection: "designs",
      where: { slug: { equals: slug } },
    });
    if (existing.totalDocs > 0) {
      payload.logger.info(`  — skipped: ${design.name}`);
      continue;
    }
    await payload.create({
      collection: "designs",
      data: {
        name: design.name,
        slug,
        designFamily: design.designFamily as any,
        active: true,
        order: i,
      },
    });
    payload.logger.info(`  ✓ ${design.name}`);
  }
}

// ─── Main ────────────────────────────────────────────────────────────────────
export async function seed() {
  await payload.init({ config });

  await seedCategories();
  await seedCollections();
  await seedMaterials();
  await seedDesigns();

  payload.logger.info("\n✅ Seed complete.");
  process.exit(0);
}
