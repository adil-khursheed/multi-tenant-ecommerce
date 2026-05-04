import { Plugin } from "payload";
import { ecommercePlugin } from "@payloadcms/plugin-ecommerce";
import { stripeAdapter } from "@payloadcms/plugin-ecommerce/payments/stripe";
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

import { adminOnlyFieldAccess } from "@/access/adminOnlyFieldAccess";
import { adminOrPublishedStatus } from "@/access/adminOrPublishedStatus";
import { customerOnlyFieldAccess } from "@/access/customerOnlyFieldAccess";
import { isAdmin } from "@/access/isAdmin";
import { isDocumentOwner } from "@/access/isDocumentOwner";
import { checkRole } from "@/access/utilities";
import { ProductsCollection } from "@/collections/Products";
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
    payments: {
      paymentMethods: [
        stripeAdapter({
          secretKey: env.STRIPE_SECRET_KEY,
          publishableKey: env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
          webhookSecret: env.STRIPE_WEBHOOKS_SIGNING_SECRET,
        }),
      ],
    },
    products: {
      productsCollectionOverride: ProductsCollection,
    },
  }),
  vercelBlobStorage({
    enabled: true,
    collections: {
      media: true,
    },
    token: process.env.BLOB_READ_WRITE_TOKEN,
  }),
  multiTenantPlugin<Config>({
    collections: {
      products: {},
    },
    tenantsArrayField: {
      includeDefaultField: false,
    },
    userHasAccessToAllTenants: (user) => checkRole(["admin"], user),
  }),
];
