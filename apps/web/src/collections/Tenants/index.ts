import { type CollectionConfig } from "payload";
import {
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";

import { adminOnly } from "@/access/adminOnly";
import { adminOnlyFieldAccess } from "@/access/adminOnlyFieldAccess";
import { adminOrTenantByField } from "@/access/adminOrTenant";
import { env } from "@/env";
import { businessTypes, GST_REGEX, PAN_REGEX } from "@repo/types";
import { decryptField, encryptField, isEncrypted } from "@/lib/crypto";

export const Tenants: CollectionConfig = {
  slug: "tenants",
  admin: {
    useAsTitle: "storeName",
    group: "Users",
    defaultColumns: [
      "storeName",
      "email",
      "isTenantActive",
      "razorpayActivationStatus",
    ],
    description: "Seller accounts on the DTlea platform",
  },
  access: {
    read: adminOrTenantByField("id"),
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        const justActivated =
          operation === "update" &&
          previousDoc.isTenantActive === false &&
          doc.isTenantActive === true &&
          !doc.razorpayAccountId;

        if (!justActivated) return;

        req.payload.logger.info({
          message: "Tenant activated - queuing vendor activation workflow",
          tenantId: doc.id,
          storeName: doc.storeName,
        });

        await req.payload.jobs.queue({
          workflow: "vendorActivation",
          input: {
            tenantId: doc.id,
            storeName: doc.storeName,
            ownerEmail: doc.email,
            ownerName: doc.ownerName,
          },
          queue: "vendor-onboarding",
        });
      },
    ],
  },
  fields: [
    {
      name: "ownerName",
      type: "text",
      label: "Owner Name",
      required: true,
    },
    {
      name: "email",
      type: "email",
      label: "Business Email",
      required: true,
      unique: true,
    },
    {
      name: "phone",
      type: "text",
      label: "Phone Number",
      required: true,
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
        position: "sidebar",
        description: `This is the subdomain of the store (e.g. [slug].${env.NEXT_PUBLIC_SERVER_URL.split("//")[1]})`,
      },
      // hooks: {
      //   beforeValidate: [
      //     ({ value, data }) => {
      //       // If the user manually provided a custom slug, format and use it
      //       if (value) {
      //         return formatSlug(value);
      //       }

      //       // If the slug is empty, generate it from the storeName
      //       if (data?.storeName) {
      //         return formatSlug(data.storeName);
      //       }
      //       return value;
      //     },
      //   ],
      // },
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
    {
      type: "tabs",
      tabs: [
        {
          label: "Business Details",
          fields: [
            {
              name: "businessName",
              type: "text",
              required: true,
              label: "Business Name",
            },
            {
              name: "businessType",
              type: "select",
              options: businessTypes,
              required: true,
              label: "Business Type",
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
                    const normalizedValue = value.trim().toUpperCase();
                    if (!PAN_REGEX.test(normalizedValue)) {
                      throw new Error("Invalid PAN");
                    }
                    return normalizedValue;
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
                    const normalizedValue = value.trim().toUpperCase();
                    if (!GST_REGEX.test(normalizedValue)) {
                      throw new Error("Invalid GST");
                    }
                    return normalizedValue;
                  },
                ],
              },
            },
            {
              type: "group",
              name: "address",
              label: "Business Address",
              fields: [
                {
                  name: "street1",
                  label: "Street Address",
                  type: "text",
                  required: true,
                },
                {
                  name: "street2",
                  label: "Street Address (Line 2)",
                  type: "text",
                },
                {
                  name: "city",
                  label: "City",
                  type: "text",
                  required: true,
                },
                {
                  name: "state",
                  label: "State",
                  type: "text",
                  required: true,
                },
                {
                  name: "postalCode",
                  label: "Postal Code",
                  type: "text",
                  required: true,
                },
                {
                  name: "country",
                  label: "Country",
                  type: "text",
                  required: true,
                },
              ],
            },
            {
              name: "bankDetails",
              label: "Bank Details",
              type: "group",
              access: {
                // read: tenantOnlyFieldAccess,
                update: () => false,
              },
              fields: [
                {
                  name: "accountNumber",
                  label: "Account Number",
                  type: "text",
                  required: true,
                  admin: {
                    description:
                      "Stored encrypted. Used to set up Razorpay settlements.",
                  },
                  hooks: {
                    beforeChange: [
                      ({ value }) => {
                        if (!value) return value;
                        if (isEncrypted(value)) return value; // prevent double-encryption
                        return encryptField(value);
                      },
                    ],
                    afterRead: [
                      ({ value, req: { user } }) => {
                        if (!value) return value;
                        try {
                          if (user && !user.roles?.includes("vendor")) {
                            return "••••••••••";
                          }
                          return decryptField(value);
                        } catch {
                          return "••••••••••";
                        }
                      },
                    ],
                  },
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
          ],
        },
        {
          label: "Legal Policies",
          fields: [
            {
              name: "privacyPolicy",
              label: "Privacy Policy",
              type: "richText",
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({
                      enabledHeadingSizes: ["h1", "h2", "h3", "h4"],
                    }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ];
                },
              }),
            },
            {
              name: "termsAndConditions",
              label: "Terms & Conditions",
              type: "richText",
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({
                      enabledHeadingSizes: ["h1", "h2", "h3", "h4"],
                    }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ];
                },
              }),
            },
            {
              name: "refundAndCancellationPolicy",
              label: "Refund & Cancellation Policy",
              type: "richText",
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({
                      enabledHeadingSizes: ["h1", "h2", "h3", "h4"],
                    }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ];
                },
              }),
            },
            {
              name: "shippingPolicy",
              label: "Shipping Policy",
              type: "richText",
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({
                      enabledHeadingSizes: ["h1", "h2", "h3", "h4"],
                    }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ];
                },
              }),
            },
            {
              name: "returnAndExchangePolicy",
              label: "Return & Exchange Policy",
              type: "richText",
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({
                      enabledHeadingSizes: ["h1", "h2", "h3", "h4"],
                    }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ];
                },
              }),
            },
          ],
        },

        // ── Section: Razorpay (read-only — set programmatically) ──────────────
        {
          label: "Razorpay Status",
          fields: [
            {
              type: "row",
              fields: [
                {
                  name: "razorpayAccountId",
                  label: "Razorpay Account ID",
                  type: "text",
                  admin: {
                    readOnly: true,
                    description: "Set automatically after onboarding.",
                  },
                },
                {
                  name: "razorpayActivationStatus",
                  label: "Activation Status",
                  type: "select",
                  options: [
                    { label: "Pending", value: "pending" },
                    { label: "Under Review", value: "under_review" },
                    { label: "Activated", value: "activated" },
                    {
                      label: "Needs Clarification",
                      value: "needs_clarification",
                    },
                    {
                      label: "Missing Bank Details",
                      value: "missing_bank_details",
                    },
                    { label: "Onboarding Failed", value: "onboarding_failed" },
                  ],
                  admin: { readOnly: true },
                },
              ],
            },
            {
              type: "row",
              fields: [
                {
                  name: "razorpayStakeholderId",
                  label: "Stakeholder ID",
                  type: "text",
                  admin: { readOnly: true },
                },
                {
                  name: "razorpayProductId",
                  label: "Product ID",
                  type: "text",
                  admin: { readOnly: true },
                },
              ],
            },
          ],
        },
      ],
    },

    // ── Section: Commission ───────────────────────────────────────────────
    {
      name: "commissionRate",
      label: "Commission Rate (%)",
      type: "number",
      defaultValue: 15,
      required: true,
      min: 0,
      max: 100,
      admin: {
        position: "sidebar",
        description:
          "Platform commission percentage deducted per sale. Default is 15%.",
      },
    },

    // KYC / Verification
    {
      name: "verificationStatus",
      type: "select",
      options: [
        { value: "pending", label: "Pending" },
        { value: "under_review", label: "Under Review" },
        { value: "approved", label: "Approved" },
        { value: "rejected", label: "Rejected" },
      ],
      defaultValue: "pending",
      access: {
        update: adminOnlyFieldAccess,
      },
      admin: {
        position: "sidebar",
        description: "Verification status of the tenant.",
      },
    },

    // ── Section: Activation ───────────────────────────────────────────────
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
        description:
          "Toggle to true only after manually verifying the vendor. This triggers Razorpay onboarding automatically.",
      },
    },
  ],
};
