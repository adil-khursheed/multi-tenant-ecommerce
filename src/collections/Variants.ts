import { CollectionOverride } from "@payloadcms/plugin-ecommerce/types";

import {
  productsCreateAccess,
  productsReadAccess,
  productsUpdateDeleteAccess,
} from "@/access/products";

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
});
