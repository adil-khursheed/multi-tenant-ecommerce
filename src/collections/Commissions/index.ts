import type { CollectionConfig } from "payload";

import { adminOnly } from "@/access/adminOnly";
import { adminOrTenant } from "@/access/adminOrTenant";

export const Commissions: CollectionConfig = {
  slug: "commissions",
  admin: {
    useAsTitle: "id",
    group: "Finance",
    defaultColumns: [
      "tenant",
      "orderAmount",
      "commissionAmount",
      "status",
      "createdAt",
    ],
    description: "Immutable financial ledger. One record per order.",
  },
  access: {
    read: adminOrTenant,
    // Commissions are created exclusively via the Orders hook — never via the API
    create: adminOnly,
    // Immutable ledger — only status and paidOutAt can be updated (controlled below)
    update: adminOnly,
    delete: () => false, // never delete financial records
  },
  fields: [
    // ── References ────────────────────────────────────────────────────────
    {
      type: "row",
      fields: [
        {
          name: "tenant",
          type: "relationship",
          relationTo: "tenants",
          required: true,
          index: true,
          admin: { readOnly: true },
        },
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

    // ── Amounts (all in INR paise to avoid floating-point issues) ─────────
    {
      type: "row",
      fields: [
        {
          name: "orderAmount",
          label: "Order Amount (₹)",
          type: "number",
          required: true,
          admin: {
            readOnly: true,
            description: "Gross sale amount at time of order.",
          },
        },
        {
          name: "commissionRate",
          label: "Commission Rate (%)",
          type: "number",
          required: true,
          admin: {
            readOnly: true,
            description:
              "Rate snapshotted at time of sale — not affected by future rate changes.",
          },
        },
      ],
    },
    {
      type: "row",
      fields: [
        {
          name: "commissionAmount",
          label: "Platform Commission (₹)",
          type: "number",
          required: true,
          admin: { readOnly: true },
        },
        {
          name: "vendorPayout",
          label: "Vendor Payout (₹)",
          type: "number",
          required: true,
          admin: { readOnly: true },
        },
      ],
    },

    // ── Razorpay Transfer Tracking ────────────────────────────────────────
    {
      type: "row",
      fields: [
        {
          name: "razorpayTransferId",
          label: "Razorpay Transfer ID",
          type: "text",
          index: true,
          admin: {
            readOnly: true,
            description: "Set after Route transfer is initiated.",
          },
        },
        {
          name: "razorpayPaymentId",
          label: "Razorpay Payment ID",
          type: "text",
          index: true,
          admin: { readOnly: true },
        },
      ],
    },

    // ── Status ────────────────────────────────────────────────────────────
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "pending",
      index: true,
      options: [
        {
          label: "Pending",
          value: "pending",
          // Order confirmed but within return/dispute window
        },
        {
          label: "Cleared",
          value: "cleared",
          // Return window closed — safe to initiate transfer
        },
        {
          label: "Transfer Initiated",
          value: "transfer_initiated",
          // Razorpay Route transfer has been triggered
        },
        {
          label: "Paid Out",
          value: "paid_out",
          // Vendor's bank account has been settled
        },
        {
          label: "Refunded",
          value: "refunded",
          // Customer refund processed — transfer reversed if applicable
        },
        {
          label: "Disputed",
          value: "disputed",
          // Chargeback or dispute raised
        },
      ],
    },

    // ── Dates ─────────────────────────────────────────────────────────────
    {
      type: "row",
      fields: [
        {
          name: "clearedAt",
          label: "Cleared At",
          type: "date",
          admin: {
            readOnly: true,
            description: "When the return window closed.",
          },
        },
        {
          name: "paidOutAt",
          label: "Paid Out At",
          type: "date",
          admin: {
            readOnly: true,
            description: "When the vendor payout was settled.",
          },
        },
      ],
    },

    // ── Notes (for disputes or manual adjustments) ────────────────────────
    {
      name: "notes",
      type: "textarea",
      admin: {
        condition: (data) =>
          data.status === "disputed" || data.status === "refunded",
        description: "Required for disputes and refunds — explain the reason.",
      },
    },
  ],

  timestamps: true,
};
