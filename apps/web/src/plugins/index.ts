import { Plugin } from "payload";
import { ecommercePlugin } from "@payloadcms/plugin-ecommerce";
import { formBuilderPlugin } from "@payloadcms/plugin-form-builder";
import { multiTenantPlugin } from "@payloadcms/plugin-multi-tenant";
import { seoPlugin } from "@payloadcms/plugin-seo";
import { GenerateTitle, GenerateURL } from "@payloadcms/plugin-seo/types";
import {
  FixedToolbarFeature,
  HeadingFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";

import { codAdapter } from "@repo/payments/cod";
import { razorpayAdapter } from "@repo/payments/razorpay";
import { adminOnlyFieldAccess } from "@/access/adminOnlyFieldAccess";
import { adminOrPublishedStatus } from "@/access/adminOrPublishedStatus";
import { customerOnlyFieldAccess } from "@/access/customerOnlyFieldAccess";
import { isAdmin } from "@/access/isAdmin";
import { isDocumentOwner } from "@/access/isDocumentOwner";
import { checkRole } from "@/access/utilities";
import { ProductsCollection } from "@/collections/Products";
import { VariantOptionsCollection } from "@/collections/VariantOptions";
import { VariantsCollection } from "@/collections/Variants";
import { VariantTypesCollection } from "@/collections/VariantTypes";
import { env } from "@/env";
import type { Config } from "@/payload-types";
import { Page, Product } from "@/payload-types";
import { getServerSideURL } from "@/utilities/getURL";

const generateTitle: GenerateTitle<Product | Page> = ({ doc }) => {
  return doc?.title
    ? `${doc.title} | Payload Ecommerce Template`
    : "Payload Ecommerce Template";
};

const generateURL: GenerateURL<Product | Page> = ({ doc }) => {
  const url = getServerSideURL();

  return doc?.slug ? `${url}/${doc.slug}` : url;
};

export const plugins: Plugin[] = [
  seoPlugin({
    generateTitle,
    generateURL,
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formSubmissionOverrides: {
      access: {
        delete: isAdmin,
        read: isAdmin,
        update: isAdmin,
      },
      admin: {
        group: "Content",
      },
    },
    formOverrides: {
      access: {
        delete: isAdmin,
        read: isAdmin,
        update: isAdmin,
        create: isAdmin,
      },
      admin: {
        group: "Content",
      },
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ("name" in field && field.name === "confirmationMessage") {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({
                      enabledHeadingSizes: ["h1", "h2", "h3", "h4"],
                    }),
                  ];
                },
              }),
            };
          }
          return field;
        });
      },
    },
  }),
  ecommercePlugin({
    currencies: {
      defaultCurrency: "INR",
      supportedCurrencies: [
        {
          code: "INR",
          label: "Indian Rupee",
          symbol: "₹",
          decimals: 2,
        },
      ],
    },
    access: {
      adminOnlyFieldAccess,
      adminOrPublishedStatus,
      customerOnlyFieldAccess,
      isAdmin,
      isDocumentOwner,
    },
    customers: {
      slug: "users",
    },
    orders: {
      ordersCollectionOverride: ({ defaultCollection }) => ({
        ...defaultCollection,
        fields: [
          ...defaultCollection.fields,
          {
            name: "couponCode",
            type: "text",
            admin: {
              position: "sidebar",
              readOnly: true,
            },
          },
          {
            name: "discount",
            type: "number",
            min: 0,
            defaultValue: 0,
            admin: {
              position: "sidebar",
              readOnly: true,
            },
          },
          {
            name: "shippingCharge",
            type: "number",
            min: 0,
            defaultValue: 0,
            admin: {
              position: "sidebar",
              readOnly: true,
            },
          },
          {
            name: "accessToken",
            type: "text",
            unique: true,
            index: true,
            admin: {
              position: "sidebar",
              readOnly: true,
            },
            hooks: {
              beforeValidate: [
                ({ value, operation }) => {
                  if (operation === "create" || !value) {
                    return crypto.randomUUID();
                  }
                  return value;
                },
              ],
            },
          },
        ],
      }),
    },
    carts: {
      cartsCollectionOverride: ({ defaultCollection }) => ({
        ...defaultCollection,
        admin: {
          ...defaultCollection.admin,
          hidden: ({ user }) => !user.roles.includes("admin"),
        },
        fields: [
          ...defaultCollection.fields,
          {
            name: "couponCode",
            type: "text",
            admin: {
              readOnly: true,
              description: "Applied coupon code (auto-managed).",
            },
          },
          {
            name: "couponDiscountType",
            type: "select",
            options: [
              { label: "Percentage", value: "percentage" },
              { label: "Fixed", value: "fixed" },
            ],
            admin: {
              readOnly: true,
              hidden: true,
            },
          },
          {
            name: "couponDiscountValue",
            type: "number",
            min: 0,
            defaultValue: 0,
            admin: {
              readOnly: true,
              hidden: true,
            },
          },
          {
            name: "discount",
            type: "number",
            min: 0,
            defaultValue: 0,
            admin: {
              readOnly: true,
              description: "Auto-calculated discount amount.",
            },
          },
          {
            name: "total",
            type: "number",
            min: 0,
            defaultValue: 0,
            admin: {
              readOnly: true,
              description: "Auto-calculated: subtotal - discount.",
            },
          },
        ],
        hooks: {
          ...defaultCollection.hooks,
          beforeChange: [
            ...(defaultCollection.hooks?.beforeChange || []),
            ({ data }: { data: any }) => {
              if (!data) return data;

              const subtotal = data.subtotal || 0;
              const discountType = data.couponDiscountType;
              const discountValue = data.couponDiscountValue || 0;

              let discount = 0;

              if (discountType && discountValue > 0) {
                if (discountType === "percentage") {
                  discount = Math.round(
                    (subtotal * Math.min(discountValue, 100)) / 100,
                  );
                } else {
                  discount = Math.min(discountValue, subtotal);
                }
              }

              data.discount = discount;
              data.total = subtotal - discount;

              return data;
            },
          ],
        },
      }),
    },
    transactions: {
      transactionsCollectionOverride: ({ defaultCollection }) => ({
        ...defaultCollection,
        fields: [
          ...defaultCollection.fields,
          {
            name: "couponCode",
            type: "text",
            admin: {
              position: "sidebar",
              readOnly: true,
            },
          },
          {
            name: "discount",
            type: "number",
            min: 0,
            defaultValue: 0,
            admin: {
              position: "sidebar",
              readOnly: true,
            },
          },
          {
            name: "shippingCharge",
            type: "number",
            min: 0,
            defaultValue: 0,
            admin: {
              position: "sidebar",
              readOnly: true,
            },
          },
        ],
      }),
    },
    payments: {
      paymentMethods: [
        razorpayAdapter({
          keyId: env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          keySecret: env.RAZORPAY_KEY_SECRET,
          webhookSecret: env.RAZORPAY_WEBHOOK_SECRET,
        }),
        codAdapter(),
      ],
    },
    products: {
      productsCollectionOverride: ProductsCollection,
      variants: {
        variantsCollectionOverride: VariantsCollection,
        variantOptionsCollectionOverride: VariantOptionsCollection,
        variantTypesCollectionOverride: VariantTypesCollection,
      },
    },
  }),
  vercelBlobStorage({
    enabled: true,
    collections: {
      media: true,
    },
    token: env.BLOB_READ_WRITE_TOKEN,
  }),
  multiTenantPlugin<Config>({
    collections: {
      products: {},
      orders: {},
      variants: {},
      variantTypes: {},
      variantOptions: {},
    },
    tenantsArrayField: {
      includeDefaultField: false,
    },
    userHasAccessToAllTenants: (user) => checkRole(["admin"], user),
  }),
];
