import { slugField, type CollectionConfig } from "payload";

import { adminOnly } from "@/access/adminOnly";

export const Collections: CollectionConfig = {
  slug: "collections",
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: () => true,
    update: adminOnly,
  },
  admin: {
    useAsTitle: "name",
    group: "Taxonomy",
    defaultColumns: [
      "name",
      "slug",
      "season",
      "active",
      "startDate",
      "endDate",
    ],
    description:
      "Curated product groupings (Festive, Wedding, Autumn/Winter, etc.). Appear under the Collections nav item.",
    hidden: ({ user }) => !user.roles.includes("admin"),
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    slugField({
      position: undefined,
    }),
    {
      name: "season",
      type: "select",
      index: true,
      options: [
        { label: "Autumn / Winter", value: "autumn-winter" },
        { label: "Spring / Summer", value: "spring-summer" },
        { label: "Festive", value: "festive" },
        { label: "Year-Round", value: "year-round" },
      ],
      admin: { position: "sidebar" },
    },

    {
      name: "startDate",
      type: "date",
      index: true,
      admin: {
        description:
          "Collection becomes visible on this date. Leave blank to show immediately.",
        position: "sidebar",
        date: { pickerAppearance: "dayAndTime" },
      },
    },
    {
      name: "endDate",
      type: "date",
      index: true,
      admin: {
        description:
          "Collection is hidden after this date. Leave blank for no expiry.",
        position: "sidebar",
        date: { pickerAppearance: "dayAndTime" },
      },
    },

    // ─── Presentation ────────────────────────────────────────────────────────
    {
      name: "coverImage",
      type: "upload",
      relationTo: "media",
      admin: { description: "Hero / card image for the collection." },
    },
    {
      name: "moodboard",
      type: "array",
      admin: {
        description:
          "Optional mood-board images shown in the collection header.",
      },
      fields: [
        { name: "image", type: "upload", relationTo: "media", required: true },
        { name: "altText", type: "text" },
      ],
    },

    // ─── Visibility & Pinning ────────────────────────────────────────────────
    {
      name: "active",
      type: "checkbox",
      defaultValue: true,
      index: true,
      admin: { position: "sidebar" },
    },
    {
      name: "isFeatured",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description:
          "Mark this collection as featured for curated sections and campaigns.",
        position: "sidebar",
      },
    },
    {
      name: "order",
      type: "number",
      defaultValue: 0,
      admin: { position: "sidebar" },
    },
  ],
};
