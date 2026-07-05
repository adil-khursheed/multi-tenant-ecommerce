import path from "path";
import { fileURLToPath } from "url";

import type { CollectionConfig } from "payload";
import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";

import {
  mediaCreateAccess,
  mediaReadAccess,
  mediaUpdateDeleteAccess,
} from "@/access/media";
import { getUserTenantIds } from "@/access/products";
import { checkRole } from "@/access/utilities";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export const Media: CollectionConfig = {
  admin: {
    group: "Content",
  },
  slug: "media",
  access: {
    create: mediaCreateAccess,
    delete: mediaUpdateDeleteAccess,
    read: mediaReadAccess,
    update: mediaUpdateDeleteAccess,
  },
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        // Auto-set tenant for vendors on create
        if (
          operation === "create" &&
          req.user &&
          !checkRole(["admin"], req.user)
        ) {
          const tenantIds = getUserTenantIds(req.user);
          if (tenantIds.length > 0 && !data.tenant) {
            data.tenant = tenantIds[0];
          }
        }
        return data;
      },
    ],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
    {
      name: "caption",
      type: "richText",
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ];
        },
      }),
    },
    {
      name: "tenant",
      type: "relationship",
      relationTo: "tenants",
      index: true,
      admin: {
        position: "sidebar",
        description:
          "The tenant (vendor) who owns this media. Left empty for platform-wide assets.",
      },
    },
  ],
  upload: {
    staticDir: path.resolve(dirname, "../../public/media"),
  },
};
