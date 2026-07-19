import {
  DefaultDocumentIDType,
  slugField,
  ValidationError,
  Where,
} from "payload";
import { CollectionOverride } from "@payloadcms/plugin-ecommerce/types";
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from "@payloadcms/plugin-seo/fields";
import {
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";

import {
  productsCreateAccess,
  productsReadAccess,
  productsUpdateDeleteAccess,
} from "@/access/products";
import { CallToAction } from "@/blocks/CallToAction/config";
import { Content } from "@/blocks/Content/config";
import { MediaBlock } from "@/blocks/MediaBlock/config";
import { generatePreviewPath } from "@/utilities/generatePreviewPath";

export const ProductsCollection: CollectionOverride = ({
  defaultCollection,
}) => ({
  ...defaultCollection,
  admin: {
    ...defaultCollection?.admin,
    defaultColumns: ["title", "enableVariants", "_status", "variants.variants"],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: "products",
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: "products",
        req,
      }),
    useAsTitle: "title",
  },
  access: {
    ...defaultCollection.access,
    read: productsReadAccess,
    create: productsCreateAccess,
    update: productsUpdateDeleteAccess,
    delete: productsUpdateDeleteAccess,
  },
  hooks: {
    ...defaultCollection.hooks,
    afterRead: [
      ...(defaultCollection.hooks?.afterRead || []),
      async ({ doc, req }) => {
        if (doc.tenant && typeof doc.tenant === "string") {
          try {
            const tenantDoc = await req.payload.findByID({
              collection: "tenants",
              id: doc.tenant,
              req,
            });
            if (tenantDoc) {
              doc.tenant = tenantDoc;
            }
          } catch (e) {
            // Ignore if tenant cannot be fetched
          }
        }
        return doc;
      },
    ],
    beforeValidate: [
      ...(defaultCollection.hooks?.beforeValidate || []),
      ({ data, operation }) => {
        if (operation === "create" && data?._status === "published") {
          const errors: { path: string; message: string }[] = [];
          if (!data.title) {
            errors.push({
              path: "title",
              message: "Title is required when publishing.",
            });
          }
          if (!data.slug) {
            errors.push({
              path: "slug",
              message: "Slug is required when publishing.",
            });
          }
          if (
            !data.categories ||
            (Array.isArray(data.categories) && data.categories.length === 0)
          ) {
            errors.push({
              path: "categories",
              message: "At least one category is required when publishing.",
            });
          }
          if (errors.length > 0) {
            throw new ValidationError({ errors });
          }
        }
        return data;
      },
    ],
    beforeChange: [
      ...(defaultCollection.hooks?.beforeChange || []),
      ({ data, originalDoc }) => {
        const basePrice = data.priceInINR ?? originalDoc?.priceInINR ?? 0;
        const discount =
          data.discountPercent ?? originalDoc?.discountPercent ?? 0;
        data.effectivePrice = Math.max(0, basePrice * (1 - discount / 100));
        return data;
      },
    ],
    afterChange: [
      ...(defaultCollection.hooks?.afterChange || []),
      async ({ doc, req, context }) => {
        if (!context.skipProductAfterChange) {
          const variants = await req.payload.find({
            collection: "variants",
            where: { product: { equals: doc.id } },
            select: { priceInINR: true, effectivePrice: true },
            pagination: false,
            req,
          });

          const discount = doc.discountPercent || 0;
          let minPrice = doc.effectivePrice || 0;
          let maxPrice = doc.effectivePrice || 0;

          for (const variant of variants.docs) {
            const vPrice = variant.priceInINR ?? doc.priceInINR ?? 0;

            const vEffPrice = Math.max(0, vPrice * (1 - discount / 100));

            if (vEffPrice !== variant.effectivePrice) {
              await req.payload.update({
                collection: "variants",
                id: variant.id,
                data: { effectivePrice: vEffPrice },
                req,
                context: { skipVariantAfterChange: true },
              });
            }

            if (vEffPrice < minPrice) minPrice = vEffPrice;
            if (vEffPrice > maxPrice) maxPrice = vEffPrice;
          }

          if (
            minPrice !== doc.minEffectivePrice ||
            maxPrice !== doc.maxEffectivePrice
          ) {
            await req.payload.update({
              collection: "products",
              id: doc.id,
              data: {
                minEffectivePrice: minPrice,
                maxEffectivePrice: maxPrice,
              },
              req,
              context: { skipProductAfterChange: true },
            });
          }
        }
      },
    ],
  },
  defaultPopulate: {
    ...defaultCollection?.defaultPopulate,
    title: true,
    slug: true,
    variantOptions: true,
    variants: true,
    enableVariants: true,
    gallery: true,
    priceInINR: true,
    inventory: true,
    meta: true,
    tenant: true,
    relatedProducts: true,
  },
  fields: [
    { name: "title", type: "text", required: false },
    {
      type: "tabs",
      tabs: [
        {
          fields: [
            {
              name: "shortDescription",
              type: "textarea",
              maxLength: 150,
              admin: {
                description: "Short description about the product",
              },
            },
            {
              name: "description",
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
              required: false,
            },
            {
              name: "gallery",
              type: "array",
              minRows: 1,
              fields: [
                {
                  name: "image",
                  type: "upload",
                  relationTo: "media",
                  required: true,
                },
                {
                  name: "variantOption",
                  type: "relationship",
                  relationTo: "variantOptions",
                  admin: {
                    condition: (data) => {
                      return (
                        data?.enableVariants === true &&
                        data?.variantTypes?.length > 0
                      );
                    },
                  },
                  filterOptions: ({ data }) => {
                    if (data?.enableVariants && data?.variantTypes?.length) {
                      const variantTypeIDs = data.variantTypes.map(
                        (item: any) => {
                          if (typeof item === "object" && item?.id) {
                            return item.id;
                          }
                          return item;
                        },
                      ) as DefaultDocumentIDType[];

                      if (variantTypeIDs.length === 0)
                        return {
                          variantType: {
                            in: [],
                          },
                        };

                      const query: Where = {
                        variantType: {
                          in: variantTypeIDs,
                        },
                      };

                      return query;
                    }

                    return {
                      variantType: {
                        in: [],
                      },
                    };
                  },
                },
              ],
            },

            {
              name: "layout",
              type: "blocks",
              blocks: [CallToAction, Content, MediaBlock],
            },
          ],
          label: "Content",
        },
        {
          fields: [
            ...defaultCollection.fields.filter(
              (f: any) => f.name !== "variantTypes",
            ),
            {
              name: "variantTypes",
              type: "relationship",
              hasMany: true,
              relationTo: "variantTypes",
              admin: {
                condition: ({ enableVariants }: any) => Boolean(enableVariants),
              },
              filterOptions: async ({ data }: any) => {
                const tenant = data?.tenant;
                const tenantId =
                  typeof tenant === "object" ? tenant?.id : tenant;
                if (tenantId) {
                  return { tenant: { equals: tenantId } };
                }
                return true;
              },
            },
            {
              name: "sku",
              type: "text",
              unique: true,
              index: true,
              hooks: {
                beforeValidate: [
                  // Auto-generate if blank on create
                  ({ value, operation }) => {
                    if (operation === "create" && !value) {
                      return `SKU-${Date.now()}`;
                    }
                    return value;
                  },
                ],
              },
            },
            {
              name: "relatedProducts",
              type: "relationship",
              filterOptions: ({ id }) => {
                if (id) {
                  return {
                    id: {
                      not_in: [id],
                    },
                  };
                }

                // ID comes back as undefined during seeding so we need to handle that case
                return {
                  id: {
                    exists: true,
                  },
                };
              },
              hasMany: true,
              relationTo: "products",
            },
          ],
          label: "Product Details",
        },
        {
          label: "Attributes",
          description:
            "Drives the sleeve, season, occasion, and care filters on the storefront.",
          fields: [
            // Sleeve filter
            {
              name: "sleeve",
              type: "select",
              index: true,
              admin: {
                description:
                  "Maps to the sleeve filter: Margie / Half / 3/4 / Full.",
              },
              options: [
                { label: "Margie (Sleeveless)", value: "margie" },
                { label: "Half Sleeve", value: "half-sleeve" },
                { label: "3/4 Sleeve", value: "three-quarter-sleeve" },
                { label: "Full Sleeve", value: "full-sleeve" },
              ],
            },

            // Season filter
            {
              name: "season",
              type: "select",
              index: true,
              options: [
                { label: "Summer", value: "summer" },
                { label: "Winter", value: "winter" },
                { label: "Festive", value: "festive" },
                { label: "All Season", value: "all-season" },
              ],
            },

            // Occasion (multi-select, used for editorial filtering)
            {
              name: "occasion",
              type: "select",
              hasMany: true,
              index: true,
              admin: {
                description: "Select all occasions this product suits.",
              },
              options: [
                { label: "Casual", value: "casual" },
                { label: "Festive", value: "festive" },
                { label: "Wedding", value: "wedding" },
                { label: "Office / Work", value: "office" },
                { label: "Party", value: "party" },
                { label: "Outdoor", value: "outdoor" },
              ],
            },

            // Care & origin
            {
              type: "row",
              fields: [
                {
                  name: "careInstructions",
                  type: "textarea",
                  admin: {
                    description:
                      "Washing and care instructions. Overrides the default for the selected fabric.",
                  },
                },
                {
                  name: "countryOfOrigin",
                  type: "text",
                  defaultValue: "India",
                  admin: {
                    description: "Required for shipping label compliance.",
                  },
                },
              ],
            },
          ],
        },
        {
          name: "meta",
          label: "SEO",
          fields: [
            OverviewField({
              titlePath: "meta.title",
              descriptionPath: "meta.description",
              imagePath: "meta.image",
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: "media",
            }),

            MetaDescriptionField({}),
            PreviewField({
              // if the `generateUrl` function is configured
              hasGenerateFn: true,

              // field paths to match the target field for data
              titlePath: "meta.title",
              descriptionPath: "meta.description",
            }),
          ],
        },
      ],
    },
    slugField({
      required: false,
    }),
    {
      name: "categories",
      type: "relationship",
      admin: {
        position: "sidebar",
        sortOptions: "title",
        description:
          "Product type categories (Kurtas, Tops, Bottoms, Co-ord Set…).",
      },
      hasMany: true,
      index: true,
      relationTo: "categories",
    },
    {
      name: "collections",
      type: "relationship",
      relationTo: "collections",
      hasMany: true,
      index: true,
      admin: {
        position: "sidebar",
        sortOptions: "title",
        description:
          "Occasion / seasonal collections (Festive, Wedding, etc.).",
      },
    },
    // NEW: materials and designs
    {
      name: "materials",
      type: "relationship",
      relationTo: "materials",
      hasMany: true,
      index: true,
      admin: {
        position: "sidebar",
        sortOptions: "name",
        description:
          "Fabric composition (Pure Cotton, Silk, Georgette…). Drives the By Materials nav and filter.",
      },
    },
    {
      name: "designs",
      type: "relationship",
      relationTo: "designs",
      hasMany: true,
      index: true,
      admin: {
        position: "sidebar",
        sortOptions: "name",
        description:
          "Silhouette / cut (Anarkali, A-Line, Flared…). Drives the By Design nav and filter.",
      },
    },

    // ─── Sidebar: discount & pricing overlay ──────────────────────────────────
    {
      name: "discountPercent",
      type: "number",
      min: 0,
      max: 90,
      defaultValue: 0,
      index: true,
      admin: {
        position: "sidebar",
        description:
          "Discount % applied on top of the base price (priceInINR). 0 = no discount.",
        step: 5,
      },
    },
    {
      name: "effectivePrice",
      type: "number",
      index: true,
      admin: {
        position: "sidebar",
        readOnly: true,
        description:
          "Auto-calculated: priceInINR × (1 − discountPercent ÷ 100). Used for price-range filter queries. Do not edit manually.",
      },
    },
    {
      name: "minEffectivePrice",
      type: "number",
      index: true,
      admin: {
        position: "sidebar",
        readOnly: true,
        description:
          "Auto-calculated: lowest effective price among the base product and all its variants.",
      },
    },
    {
      name: "maxEffectivePrice",
      type: "number",
      index: true,
      admin: {
        position: "sidebar",
        readOnly: true,
        description:
          "Auto-calculated: highest effective price among the base product and all its variants.",
      },
    },
    {
      name: "isFlashSale",
      type: "checkbox",
      defaultValue: false,
      index: true,
      admin: {
        position: "sidebar",
        description: "Tag as Flash Sale. Always pair with a discountPercent.",
      },
    },

    // ─── Sidebar: flags ───────────────────────────────────────────────────────
    {
      name: "flags",
      type: "group",
      label: "Flags",
      admin: {
        position: "sidebar",
        description: "Controls placement in special homepage / nav sections.",
      },
      fields: [
        {
          name: "isNewArrival",
          type: "checkbox",
          defaultValue: true,
          index: true,
          admin: { description: "Shown in the New Arrivals nav section." },
        },
        {
          name: "isFeatured",
          type: "checkbox",
          defaultValue: false,
          index: true,
          admin: { description: "Pin to homepage featured strip." },
        },
        {
          name: "isBestseller",
          type: "checkbox",
          defaultValue: false,
          index: true,
        },
        {
          name: "isExclusive",
          type: "checkbox",
          defaultValue: false,
          admin: { description: "Marks as a platform-exclusive listing." },
        },
      ],
    },

    // ─── Sidebar: ratings (populated by background job) ───────────────────────
    {
      name: "ratings",
      type: "group",
      label: "Ratings",
      admin: {
        position: "sidebar",
        description:
          "Denormalised from reviews. Updated automatically — do not edit.",
      },
      fields: [
        {
          name: "average",
          type: "number",
          min: 0,
          max: 5,
          admin: { readOnly: true },
        },
        {
          name: "count",
          type: "number",
          min: 0,
          admin: { readOnly: true },
        },
      ],
    },
  ],
});
