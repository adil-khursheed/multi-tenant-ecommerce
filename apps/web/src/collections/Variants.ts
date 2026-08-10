import { CollectionOverride } from "@payloadcms/plugin-ecommerce/types";

import {
  productsCreateAccess,
  productsReadAccess,
  productsUpdateDeleteAccess,
} from "@/access/products";
import { inrFieldComponents } from "@/fields/inrAmount";

export const VariantsCollection: CollectionOverride = ({
  defaultCollection,
}) => ({
  ...defaultCollection,
  access: {
    ...defaultCollection.access,
    create: productsCreateAccess,
    read: productsReadAccess,
    update: productsUpdateDeleteAccess,
    delete: productsUpdateDeleteAccess,
  },
  fields: [
    ...(defaultCollection.fields || []),
    {
      name: "effectivePrice",
      type: "number",
      index: true,
      admin: {
        components: inrFieldComponents,
        readOnly: true,
      },
    },
  ],
  hooks: {
    ...defaultCollection.hooks,
    beforeChange: [
      ...(defaultCollection.hooks?.beforeChange || []),
      async ({ data, req, originalDoc }) => {
        const productId = data.product ?? originalDoc?.product;
        if (!productId) return data;

        const product = await req.payload.findByID({
          collection: "products",
          id: typeof productId === "object" ? productId.id : productId,
          select: { priceInINR: true, discountPercent: true },
          req,
        });

        let variantPrice = data.priceInINR;
        if (variantPrice === undefined || variantPrice === null) {
          variantPrice = originalDoc?.priceInINR;
        }
        if (variantPrice === undefined || variantPrice === null) {
          variantPrice = product?.priceInINR ?? 0;
        }

        const discount = product?.discountPercent ?? 0;
        data.effectivePrice = Math.max(0, variantPrice * (1 - discount / 100));

        return data;
      },
    ],
    afterChange: [
      ...(defaultCollection.hooks?.afterChange || []),
      async ({ doc, req, context }) => {
        if (!context.skipVariantAfterChange && doc.product) {
          const productId =
            typeof doc.product === "object" ? doc.product.id : doc.product;

          const variants = await req.payload.find({
            collection: "variants",
            where: { product: { equals: productId } },
            select: { effectivePrice: true },
            pagination: false,
            req,
          });

          const product = await req.payload.findByID({
            collection: "products",
            id: productId,
            select: {
              effectivePrice: true,
              minEffectivePrice: true,
              maxEffectivePrice: true,
            },
            req,
          });

          let minPrice = product?.effectivePrice || 0;
          let maxPrice = product?.effectivePrice || 0;

          for (const v of variants.docs) {
            if (typeof v.effectivePrice === "number") {
              if (v.effectivePrice < minPrice) minPrice = v.effectivePrice;
              if (v.effectivePrice > maxPrice) maxPrice = v.effectivePrice;
            }
          }

          if (
            minPrice !== product?.minEffectivePrice ||
            maxPrice !== product?.maxEffectivePrice
          ) {
            await req.payload.update({
              collection: "products",
              id: productId,
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
});
