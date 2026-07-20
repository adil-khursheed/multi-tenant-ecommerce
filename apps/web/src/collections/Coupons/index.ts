import type { CollectionConfig } from "payload";

export const Coupons: CollectionConfig = {
  slug: "coupons",
  admin: {
    useAsTitle: "code",
    defaultColumns: [
      "code",
      "discountType",
      "discountValue",
      "isActive",
      "usageCount",
      "expiresAt",
    ],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user?.roles?.includes("admin")),
    update: ({ req: { user } }) => Boolean(user?.roles?.includes("admin")),
    delete: ({ req: { user } }) => Boolean(user?.roles?.includes("admin")),
  },
  fields: [
    {
      name: "code",
      type: "text",
      required: true,
      unique: true,
      index: true,
      admin: {
        description:
          "Unique coupon code. Stored in uppercase. Customers enter this at checkout.",
      },
      hooks: {
        beforeValidate: [
          ({ value }) => (typeof value === "string" ? value.toUpperCase() : value),
        ],
      },
    },
    {
      name: "description",
      type: "textarea",
      admin: {
        description: "Internal note for admins. Not shown to customers.",
      },
    },
    {
      name: "discountType",
      type: "select",
      required: true,
      options: [
        { label: "Percentage (%)", value: "percentage" },
        { label: "Fixed Amount (₹)", value: "fixed" },
      ],
    },
    {
      name: "discountValue",
      type: "number",
      required: true,
      min: 0,
      admin: {
        description:
          "For percentage: 0–100. For fixed: the rupee amount to deduct.",
        step: 1,
      },
    },
    {
      name: "minOrderAmount",
      type: "number",
      min: 0,
      defaultValue: 0,
      admin: {
        description:
          "Minimum cart subtotal (₹) required to use this coupon. 0 = no minimum.",
      },
    },
    {
      name: "maxUses",
      type: "number",
      min: 1,
      admin: {
        description:
          "Maximum total redemptions allowed. Leave empty for unlimited.",
      },
    },
    {
      name: "usageCount",
      type: "number",
      min: 0,
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: "Auto-incremented each time the coupon is used.",
      },
    },
    {
      name: "isActive",
      type: "checkbox",
      defaultValue: true,
    },
    {
      name: "expiresAt",
      type: "date",
      admin: {
        description:
          "Optional expiration date. Coupon cannot be used after this date.",
        date: {
          pickerAppearance: "dayAndTime",
        },
      },
    },
  ],
};
