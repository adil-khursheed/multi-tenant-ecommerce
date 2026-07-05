import type { CollectionConfig } from "payload";

import { adminOnly } from "@/access/adminOnly";
import { reviewsCreateAccess, reviewsReadAccess } from "@/access/reviewsAccess";

export const Reviews: CollectionConfig = {
  slug: "reviews",
  access: {
    read: reviewsReadAccess,
    create: reviewsCreateAccess,
    update: adminOnly,
    delete: adminOnly,
  },
  admin: {
    group: "Ecommerce",
    useAsTitle: "title",
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "description",
      type: "textarea",
      required: true,
    },
    {
      name: "rating",
      type: "number",
      required: true,
      min: 1,
      max: 5,
    },
    {
      name: "product",
      type: "relationship",
      relationTo: "products",
      hasMany: false,
      required: true,
    },
    {
      name: "user",
      type: "relationship",
      relationTo: "users",
      hasMany: false,
      required: true,
    },
  ],
};
