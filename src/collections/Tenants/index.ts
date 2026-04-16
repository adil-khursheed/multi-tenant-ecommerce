import type { CollectionConfig } from "payload";

import { env } from "@/env";

export const Tenants: CollectionConfig = {
  slug: "tenants",
  admin: {
    useAsTitle: "name",
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      label: "Store Name",
      admin: {
        description: "This is the name of the store (e.g. John's Store)",
      },
    },
    {
      name: "slug",
      type: "text",
      index: true,
      required: true,
      unique: true,
      admin: {
        description: `This is the subdomain of the store (e.g. [slug].${env.NEXT_PUBLIC_SERVER_URL.split("//")[1]})`,
      },
    },
    {
      name: "logo",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "banner",
      type: "upload",
      relationTo: "media",
    },

    // KYC / Verification
    {
      name: "verificationStatus",
      type: "select",
      options: ["pending", "under_review", "approved", "rejected"],
      defaultValue: "pending",
    },
    {
      name: "bankDetails",
      type: "group",
      fields: [
        {
          name: "accountNumber",
          type: "text",
          required: true,
          admin: {
            readOnly: true,
          },
        },
        {
          name: "ifscCode",
          type: "text",
          required: true,
          admin: {
            readOnly: true,
          },
        },
        {
          name: "bankName",
          type: "text",
          required: true,
          admin: {
            readOnly: true,
          },
        },
        {
          name: "accountHolderName",
          type: "text",
          required: true,
          admin: {
            readOnly: true,
          },
        },
      ],
    },
    {
      name: "bankDetailsSubmitted",
      type: "checkbox",
      defaultValue: false,
      admin: {
        readOnly: true,
        description:
          "You cannot create products until you submit your bank details.",
      },
    },
  ],
};
