import { slugField, type CollectionConfig } from "payload";

import { adminOnly } from "@/access/adminOnly";

/**
 * SizeGuides — structured size chart data for products
 *
 * Supports product-level and category-level assignment with fallback:
 *   product.sizeGuide → category.sizeGuide → (no guide)
 *
 * Measurements are stored in cm. The frontend auto-converts to inches.
 */
export const SizeGuides: CollectionConfig = {
  slug: "sizeGuides",

  admin: {
    group: "Taxonomy",
    useAsTitle: "name",
    defaultColumns: ["name", "unit", "rows"],
    description:
      "Reusable size chart templates. Assign to categories as defaults, or to individual products to override.",
    hidden: ({ user }) => !user.roles.includes("admin"),
  },

  access: {
    read: () => true,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
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
      name: "unit",
      type: "select",
      defaultValue: "cm",
      required: true,
      options: [
        { label: "Centimeters (cm)", value: "cm" },
        { label: "Inches (in)", value: "inches" },
      ],
      admin: {
        description:
          "Unit used when entering measurements. The frontend displays both cm and inches.",
        position: "sidebar",
      },
    },
    {
      name: "fitNote",
      type: "textarea",
      admin: {
        description:
          'Optional note shown below the size chart, e.g. "Runs slim, consider sizing up."',
      },
    },
    {
      name: "rows",
      type: "array",
      minRows: 1,
      labels: {
        singular: "Size Row",
        plural: "Size Rows",
      },
      fields: [
        {
          name: "sizeLabel",
          type: "text",
          required: true,
          admin: {
            description: 'The size label shown to customers, e.g. "S", "M", "L", "28", "30".',
          },
        },
        {
          name: "measurements",
          type: "array",
          minRows: 1,
          labels: {
            singular: "Measurement",
            plural: "Measurements",
          },
          fields: [
            {
              name: "key",
              type: "text",
              required: true,
              admin: {
                description:
                  'Machine key for this measurement, e.g. "chest", "waist", "hip", "length", "sleeve", "inseam", "shoulder".',
              },
            },
            {
              name: "label",
              type: "text",
              required: true,
              admin: {
                description: 'Display label, e.g. "Chest", "Waist", "Hip".',
              },
            },
            {
              name: "value",
              type: "number",
              required: true,
              min: 0,
              admin: {
                description: "Measurement value in the unit selected above.",
              },
            },
          ],
        },
        {
          name: "equivalentSizes",
          type: "group",
          label: "International Equivalents",
          admin: {
            description: "Optional size equivalents in other sizing systems.",
          },
          fields: [
            { name: "us", type: "text" },
            { name: "uk", type: "text" },
            { name: "eu", type: "text" },
          ],
        },
      ],
    },
  ],
};
