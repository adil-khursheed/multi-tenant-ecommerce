import { CollectionOverride } from "@payloadcms/plugin-ecommerce/types";

import {
  productsCreateAccess,
  productsUpdateDeleteAccess,
} from "@/access/products";

export const VariantOptionsCollection: CollectionOverride = ({
  defaultCollection,
}) => ({
  ...defaultCollection,
  access: {
    ...defaultCollection.access,
    read: () => true, // Publicly readable for storefront browsing
    create: productsCreateAccess,
    update: productsUpdateDeleteAccess,
    delete: productsUpdateDeleteAccess,
  },
});
