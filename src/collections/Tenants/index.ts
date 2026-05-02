import type { CollectionConfig } from "payload";

import { adminOnlyFieldAccess } from "@/access/adminOnlyFieldAccess";
import { env } from "@/env";
import { GST_REGEX, PAN_REGEX } from "@/lib/constants";

export const Tenants: CollectionConfig = {
  slug: "tenants",
  admin: {
    useAsTitle: "storeName",
  },
  fields: [
    {
      name: "owner",
      type: "relationship",
      relationTo: "users",
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: "businessName",
      type: "text",
      required: true,
      label: "Business Name",
    },
    {
      name: "businessType",
      type: "select",
      options: [
        { value: "individual", label: "Individual" },
        { value: "partnership", label: "Partnership" },
        { value: "proprietorship", label: "Proprietorship" },
        { value: "llp", label: "LLP" },
        { value: "private_limited", label: "Private Limited" },
        { value: "public_limited", label: "Public Limited" },
        { value: "ngo", label: "NGO" },
        { value: "trust", label: "Trust" },
        { value: "society", label: "Society" },
        { value: "educational_institutes", label: "Educational Institutes" },
        { value: "not_yet_registered", label: "Not Yet Registered" },
        { value: "other", label: "Other" },
      ],
      required: true,
      label: "Business Type",
    },
    {
      name: "storeName",
      type: "text",
      required: true,
      label: "Store Name",
      admin: {
        description: "This is the name of the store (e.g. John's Store)",
      },
    },
    {
      name: "storeSlug",
      label: "Store Slug",
      type: "text",
      index: true,
      required: true,
      unique: true,
      admin: {
        description: `This is the subdomain of the store (e.g. [slug].${env.NEXT_PUBLIC_SERVER_URL.split("//")[1]})`,
      },
      hooks: {
        beforeChange: [
          ({ value }) => {
            if (!value) return value;
            return value.toLowerCase().trim();
          },
        ],
      },
    },
    {
      name: "storeLogo",
      label: "Store Logo",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "storeBanner",
      label: "Store Banner",
      type: "upload",
      relationTo: "media",
    },

    // KYC / Verification
    {
      name: "verificationStatus",
      type: "select",
      options: ["pending", "under_review", "approved", "rejected"],
      defaultValue: "pending",
      access: {
        update: adminOnlyFieldAccess,
      },
    },
    {
      name: "panNumber",
      type: "text",
      required: true,
      minLength: 10,
      maxLength: 10,
      label: "Permanent Account Number (PAN)",
      hooks: {
        beforeChange: [
          ({ value }) => {
            if (!value) return value;
            if (!PAN_REGEX.test(value)) {
              throw new Error("Invalid PAN");
            }
            return value.toUpperCase().trim();
          },
        ],
      },
    },
    {
      name: "gstNumber",
      type: "text",
      label: "GST Number",
      minLength: 15,
      maxLength: 15,
      hooks: {
        beforeChange: [
          ({ value }) => {
            if (!value) return value;
            if (!GST_REGEX.test(value)) {
              throw new Error("Invalid GST");
            }
            return value.toUpperCase().trim();
          },
        ],
      },
    },
    {
      name: "bankDetails",
      label: "Bank Details",
      type: "group",
      fields: [
        {
          name: "accountNumber",
          label: "Account Number",
          type: "text",
          required: true,
        },
        {
          name: "ifscCode",
          label: "IFSC Code",
          type: "text",
          required: true,
        },
        {
          name: "bankName",
          label: "Bank Name",
          type: "text",
          required: true,
        },
        {
          name: "accountHolderName",
          label: "Account Holder Name",
          type: "text",
          required: true,
        },
        {
          name: "bankBranch",
          label: "Bank Branch",
          type: "text",
          required: true,
        },
        {
          name: "bankAccountType",
          label: "Bank Account Type",
          type: "select",
          options: ["savings", "current"],
          required: true,
        },
      ],
    },
    {
      name: "isTenantActive",
      type: "checkbox",
      defaultValue: false,
      access: {
        create: adminOnlyFieldAccess,
        read: adminOnlyFieldAccess,
        update: adminOnlyFieldAccess,
      },
      admin: {
        position: "sidebar",
      },
    },
  ],
};
