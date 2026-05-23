import type { CollectionConfig } from "payload";
import { slugField } from "payload";

import { adminOnly } from "@/access/adminOnly";

export const Categories: CollectionConfig = {
  slug: "categories",
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: () => true,
    update: adminOnly,
  },
  admin: {
    useAsTitle: "name",
    group: "Taxonomy",
    defaultColumns: ["name", "slug", "parent", "productCount", "active"],
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
      name: "parent",
      type: "relationship",
      relationTo: "categories",
      hasMany: false,
      index: true,
      admin: {
        description: "Leave empty to make this a top-level nav item.",
        position: "sidebar",
      },
    },
    {
      name: "order",
      type: "number",
      defaultValue: 0,
      admin: {
        description: "Controls display order within siblings. Lower = first.",
        position: "sidebar",
      },
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      admin: { description: "Category card image shown on listing pages." },
    },
    {
      name: "bannerImage",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Full-width banner shown at top of the category PLP.",
      },
    },

    {
      name: "active",
      type: "checkbox",
      defaultValue: true,
      index: true,
      admin: {
        description:
          "Uncheck to hide this category from navigation without deleting it.",
        position: "sidebar",
      },
    },
    {
      name: "isFeatured",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description: "Pin to homepage / featured sections.",
        position: "sidebar",
      },
    },
    {
      name: "productCount",
      type: "number",
      admin: {
        readOnly: true,
        description: "Populated by a scheduled job. Do not edit manually.",
        position: "sidebar",
      },
    },
  ],
};
