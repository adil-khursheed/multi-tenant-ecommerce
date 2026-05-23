import { slugField, type CollectionConfig } from "payload";

import { adminOnly } from "@/access/adminOnly";

/**
 * Materials — fabric / textile taxonomy
 *
 * Powers the "By Materials" nav item (nav item 6) and the
 * Fabric/Material filter on all PLPs.
 *
 * Seed data (27 items from client spec):
 *   Pure Cotton · Cambric Cotton · Cotton Dobby · Muslin · Satin
 *   Lawn Cotton · Egyptian Cotton · Flannel · Denim · Rayon/Viscose
 *   Wool · Hakoba · Crepe · Slab Cotton · Organic · Linen · Silk
 *   Georgette · Organza · Chinon · Shimmer · Tissue · Jimmy Choo
 *   Tie-Dye · Bandhani · Modal
 */
export const Materials: CollectionConfig = {
  slug: "materials",

  admin: {
    group: "Taxonomy",
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "isPremium", "isNatural", "active"],
    description:
      'Fabric/textile types. Drives the "By Materials" nav item and the fabric filter on PLPs.',
    hidden: ({ user }) => !user.roles.includes("admin"),
  },

  access: {
    read: () => true,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },

  fields: [
    // ─── Core ────────────────────────────────────────────────────────────────
    {
      name: "name",
      type: "text",
      required: true,
    },
    slugField({
      position: undefined,
    }),
    {
      name: "description",
      type: "textarea",
      admin: {
        description:
          "Optional short description shown on /by-material/[slug] landing pages.",
      },
    },

    // ─── Attributes ──────────────────────────────────────────────────────────
    {
      name: "isPremium",
      type: "checkbox",
      defaultValue: false,
      index: true,
      admin: {
        description:
          "Mark premium fabrics (Silk, Georgette, Tissue, etc.) for badging on PDPs.",
        position: "sidebar",
      },
    },
    {
      name: "isNatural",
      type: "checkbox",
      defaultValue: false,
      index: true,
      admin: {
        description:
          "Natural / organic fabrics (Cotton, Linen, Wool, Organic, etc.).",
        position: "sidebar",
      },
    },
    {
      name: "careInstructions",
      type: "textarea",
      admin: {
        description:
          "Default care instructions for this fabric. Can be overridden per product.",
      },
    },
    {
      name: "icon",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Small icon/swatch image used in filter chips.",
      },
    },

    // ─── Visibility ──────────────────────────────────────────────────────────
    {
      name: "active",
      type: "checkbox",
      defaultValue: true,
      index: true,
      admin: { position: "sidebar" },
    },
    {
      name: "order",
      type: "number",
      defaultValue: 0,
      admin: {
        description: "Display order in filter lists. Lower = first.",
        position: "sidebar",
      },
    },
  ],
};
