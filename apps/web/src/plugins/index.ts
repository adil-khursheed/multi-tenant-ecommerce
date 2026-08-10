import crypto from "crypto";

import { CollectionBeforeChangeHook, Field, Plugin } from "payload";
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
import { INR_CURRENCIES } from "@/currencies";
import { env } from "@/env";
import { inrFieldComponents } from "@/fields/inrAmount";
import { sendOrderConfirmationEmail } from "@/hooks/orders/sendOrderConfirmationEmail";
import { sendOrderStatusEmail } from "@/hooks/orders/sendOrderStatusEmail";
import { createOrderFulfillments } from "@/hooks/orders/createOrderFulfillments";
import { enrichOrderItems } from "@/hooks/orders/enrichOrderItems";
import { sendPaymentFailedEmail } from "@/hooks/transactions/sendPaymentFailedEmail";
import type { Config } from "@/payload-types";
import { Page, Product } from "@/payload-types";
import { getServerSideURL } from "@/utilities/getURL";

const generateTitle: GenerateTitle<Product | Page> = ({ doc }) => {
  return doc?.title
    ? `${doc.title} | DTlea | Dreams of Diva`
    : "DTlea | Dreams of Diva";
};

const generateURL: GenerateURL<Product | Page> = ({ doc }) => {
  const url = getServerSideURL();

  return doc?.slug ? `${url}/${doc.slug}` : url;
};

type CartItemWithLock = {
  id?: string | null;
  product?: unknown;
  variant?: unknown;
  quantity?: number;
  unitPrice?: number;
  basePrice?: number;
};

const resolveRelationshipId = (value: unknown): string | undefined => {
  if (!value) return undefined;
  if (typeof value === "object") {
    const id = (value as { id?: unknown }).id;
    return typeof id === "string" ? id : undefined;
  }
  return typeof value === "string" ? value : undefined;
};

const cartSubtotalBeforeChange: CollectionBeforeChangeHook = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (!data) return data;

  if (operation === "create" && !data.customer && !data.secret) {
    data.secret = crypto.randomBytes(20).toString("hex");
    if (!req.context) {
      req.context = {};
    }
    req.context.newCartSecret = data.secret;
  }

  if (data.items && Array.isArray(data.items)) {
    const items = data.items as CartItemWithLock[];
    const previousItems = ((originalDoc?.items ?? []) as CartItemWithLock[]).filter(
      (item) => item && typeof item === "object",
    );

    let subtotal = 0;
    for (const item of items) {
      const quantity = item.quantity || 1;
      const productId = resolveRelationshipId(item.product);
      const variantId = resolveRelationshipId(item.variant);

      const previous = previousItems.find(
        (prev) => prev.id && prev.id === item.id,
      );
      const previousVariantId = resolveRelationshipId(previous?.variant);
      const previousProductId = resolveRelationshipId(previous?.product);

      // Price lock: keep the snapshot for unchanged rows so later saves
      // (e.g. coupon apply) never re-price items already in the cart.
      const priceLocked =
        previous &&
        typeof previous.unitPrice === "number" &&
        previousVariantId === variantId &&
        previousProductId === productId;

      if (priceLocked && previous) {
        item.unitPrice = previous.unitPrice;
        item.basePrice = previous.basePrice;
      } else if (variantId) {
        const variant = await req.payload.findByID({
          collection: "variants",
          id: variantId,
          depth: 0,
          select: { effectivePrice: true, priceInINR: true },
        });
        item.unitPrice = variant?.effectivePrice ?? variant?.priceInINR ?? 0;
        item.basePrice = variant?.priceInINR ?? item.unitPrice;
      } else if (productId) {
        const product = await req.payload.findByID({
          collection: "products",
          id: productId,
          depth: 0,
          select: { effectivePrice: true, priceInINR: true },
        });
        item.unitPrice = product?.effectivePrice ?? product?.priceInINR ?? 0;
        item.basePrice = product?.priceInINR ?? item.unitPrice;
      } else {
        item.unitPrice = 0;
        item.basePrice = 0;
      }

      subtotal += (item.unitPrice ?? 0) * quantity;
    }
    data.subtotal = subtotal;
  } else {
    data.subtotal = 0;
  }

  return data;
};

const cartCouponBeforeChange: CollectionBeforeChangeHook = ({ data }) => {
  if (!data) return data;

  const subtotal = data.subtotal || 0;
  const discountType = data.couponDiscountType;
  const discountValue = data.couponDiscountValue || 0;

  let discount = 0;

  if (discountType && discountValue > 0) {
    if (discountType === "percentage") {
      discount = Math.round((subtotal * Math.min(discountValue, 100)) / 100);
    } else {
      discount = Math.min(discountValue, subtotal);
    }
  }

  data.discount = discount;
  data.total = subtotal - discount;

  return data;
};

// Adds per-item `tenant` + `lineTotal` subfields to the plugin's `items`
// array field on the orders collection (the field lives inside a tabs group).
function injectOrderItemFields(fields: Field[]): Field[] {
  return fields.map((field) => {
    if ("type" in field && field.type === "tabs") {
      return {
        ...field,
        tabs: (field.tabs ?? []).map((tab) => ({
          ...tab,
          fields: injectOrderItemFields(tab.fields ?? []),
        })),
      };
    }
    if ("type" in field && field.type === "group") {
      return {
        ...field,
        fields: injectOrderItemFields(field.fields ?? []),
      };
    }
    if (
      "type" in field &&
      "name" in field &&
      field.type === "array" &&
      field.name === "items"
    ) {
      return {
        ...field,
        fields: [
          ...(field.fields ?? []),
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
            defaultValue: 0,
            admin: {
              components: inrFieldComponents,
              readOnly: true,
            },
          },
        ],
      };
    }
    return field;
  });
}

// Adds per-item `unitPrice` + `basePrice` snapshot subfields to the plugin's
// `items` array field on the carts collection (top-level array field).
function injectCartItemFields(fields: Field[]): Field[] {
  return fields.map((field) => {
    if (
      "type" in field &&
      "name" in field &&
      field.type === "array" &&
      field.name === "items"
    ) {
      return {
        ...field,
        fields: [
          ...(field.fields ?? []),
          {
            name: "unitPrice",
            label: "Unit Price (locked)",
            type: "number",
            min: 0,
            admin: {
              components: inrFieldComponents,
              readOnly: true,
              description: "Effective unit price locked when the item was added.",
            },
          },
          {
            name: "basePrice",
            label: "Base Price (₹)",
            type: "number",
            min: 0,
            admin: {
              components: inrFieldComponents,
              readOnly: true,
              description: "Undiscounted base price locked when the item was added.",
            },
          },
        ],
      };
    }
    return field;
  });
}

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
    currencies: INR_CURRENCIES,
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
        admin: {
          ...defaultCollection.admin,
          // Orders are customer-facing; vendors manage their slice via Fulfillments.
          hidden: ({ user }) => !user?.roles?.includes("admin"),
        },
        fields: [
          ...injectOrderItemFields(defaultCollection.fields),
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
              components: inrFieldComponents,
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
              components: inrFieldComponents,
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
        hooks: {
          ...defaultCollection.hooks,
          beforeChange: [
            ...(defaultCollection.hooks?.beforeChange || []),
            enrichOrderItems,
          ],
          afterChange: [
            ...(defaultCollection.hooks?.afterChange || []),
            createOrderFulfillments,
            sendOrderConfirmationEmail,
            sendOrderStatusEmail,
          ],
        },
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
          ...injectCartItemFields(defaultCollection.fields),
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
              components: inrFieldComponents,
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
              components: inrFieldComponents,
              readOnly: true,
              description: "Auto-calculated: subtotal - discount.",
            },
          },
        ],
        hooks: {
          ...defaultCollection.hooks,
          beforeChange: [cartSubtotalBeforeChange, cartCouponBeforeChange],
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
              components: inrFieldComponents,
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
              components: inrFieldComponents,
              position: "sidebar",
              readOnly: true,
            },
          },
        ],
        hooks: {
          ...defaultCollection.hooks,
          afterChange: [
            ...(defaultCollection.hooks?.afterChange || []),
            sendPaymentFailedEmail,
          ],
        },
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
      fulfillments: {},
      products: {},
      variants: {},
      variantTypes: {},
      variantOptions: {},
    },
    tenantsArrayField: {
      includeDefaultField: false,
    },
    userHasAccessToAllTenants: (user) =>
      checkRole(["admin"], user) || checkRole(["customer"], user),
  }),
];
