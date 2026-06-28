import { slugField, type CollectionConfig } from "payload";

import { adminOnly } from "@/access/adminOnly";

/**
 * Designs — silhouette / cut taxonomy
 *
 * Powers the "By Design" nav item (nav item 7) and the design filter on PLPs.
 *
 * Seed data (24 items from client spec):
 *   High Low · Long Straight · Anarkali · Alia Cut · Flared · A-Line
 *   Slit · Shirt Style · Overlay · Halter Neck · Wrap · Gown
 *   Pakistani · Princes Cut · Lace Kurti · Asymmetrical · Jacket Style
 *   Cape Style · Indo-Western · Floor-Length · Denim · Boutique Style
 *   Chikan Kari
 */
export const Designs: CollectionConfig = {
  slug: "designs",

  admin: {
    group: "Taxonomy",
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "designFamily", "active"],
    description:
      'Silhouette / cut styles. Drives the "By Design" nav item and design filter on PLPs.',
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
          "Short description shown on /by-design/[slug] landing pages.",
      },
    },

    // ─── Classification ──────────────────────────────────────────────────────
    {
      name: "designFamily",
      type: "select",
      index: true,
      admin: {
        description: "Broad grouping used for filter UI hierarchy.",
        position: "sidebar",
      },
      options: [
        { label: "Kurta Cut", value: "kurta-cut" },
        { label: "Dress / Gown", value: "dress-gown" },
        { label: "Neckline", value: "neckline" },
        { label: "Ethnic Fusion", value: "ethnic-fusion" },
        { label: "Silhouette", value: "silhouette" },
        { label: "Embroidery / Craft", value: "embroidery-craft" },
      ],
    },

    // ─── Presentation ────────────────────────────────────────────────────────
    {
      name: "illustration",
      type: "upload",
      relationTo: "media",
      admin: {
        description:
          "Line-art illustration or reference image for this silhouette.",
      },
    },
    {
      name: "icon",
      type: "upload",
      relationTo: "media",
      admin: { description: "Small icon used in filter chips and nav." },
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
        description: "Display order in filter panels. Lower = first.",
        position: "sidebar",
      },
    },
  ],
};
