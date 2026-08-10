import type { CollectionConfig } from "payload";

import { adminOnly } from "@/access/adminOnly";
import { adminOrTenant } from "@/access/adminOrTenant";
import { inrFieldComponents } from "@/fields/inrAmount";

export const Fulfillments: CollectionConfig = {
  slug: "fulfillments",
  admin: {
    useAsTitle: "id",
    group: "Orders",
    defaultColumns: ["tenant", "order", "subtotal", "status", "createdAt"],
    description:
      "Per-tenant slice of an order. One record per tenant per order — each tenant sees only their own products.",
  },
  access: {
    // Tenant users only ever see their own tenant's fulfillments (plugin + this).
    read: adminOrTenant,
    // Fulfillments are created exclusively via the Orders hook — never via the API.
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  fields: [
    // ── References ────────────────────────────────────────────────────────
    {
      type: "row",
      fields: [
        {
          name: "order",
          type: "relationship",
          relationTo: "orders",
          required: true,
          index: true,
          admin: { readOnly: true },
        },
      ],
    },

    // ── Items (this tenant's slice only) ─────────────────────────────────
    {
      name: "items",
      type: "array",
      admin: { initCollapsed: true },
      fields: [
        {
          name: "product",
          type: "relationship",
          relationTo: "products",
          admin: { readOnly: true },
        },
        {
          name: "variant",
          type: "relationship",
          relationTo: "variants",
          admin: { readOnly: true },
        },
        {
          name: "quantity",
          type: "number",
          min: 1,
          required: true,
          admin: { readOnly: true },
        },
        {
          name: "tenant",
          type: "relationship",
          relationTo: "tenants",
          admin: { readOnly: true },
        },
        {
          name: "lineTotal",
          label: "Line Total (₹)",
          type: "number",
          min: 0,
          admin: { components: inrFieldComponents, readOnly: true },
        },
      ],
    },

    // ── Amounts (line totals only — platform fees excluded) ──────────────
    {
      type: "row",
      fields: [
        {
          name: "subtotal",
          label: "Subtotal (₹)",
          type: "number",
          min: 0,
          required: true,
          admin: { components: inrFieldComponents, readOnly: true },
        },
        {
          name: "status",
          type: "select",
          required: true,
          defaultValue: "confirmed",
          index: true,
          options: [
            {
              label: "Confirmed",
              value: "confirmed",
            },
            {
              label: "Processing",
              value: "processing",
            },
            {
              label: "Shipped",
              value: "shipped",
            },
            {
              label: "Delivered",
              value: "delivered",
            },
            {
              label: "Cancelled",
              value: "cancelled",
            },
            {
              label: "Refunded",
              value: "refunded",
            },
          ],
        },
      ],
    },

    // ── Commission snapshot (rate captured at time of sale) ──────────────
    {
      type: "row",
      fields: [
        {
          name: "commissionRate",
          label: "Commission Rate (%)",
          type: "number",
          required: true,
          admin: { readOnly: true },
        },
        {
          name: "commissionAmount",
          label: "Platform Commission (₹)",
          type: "number",
          required: true,
          admin: { components: inrFieldComponents, readOnly: true },
        },
      ],
    },

    // ── Vendor payout ─────────────────────────────────────────────────────
    {
      name: "vendorPayout",
      label: "Vendor Payout (₹)",
      type: "number",
      required: true,
      admin: { components: inrFieldComponents, readOnly: true },
    },
  ],

  timestamps: true,
};
