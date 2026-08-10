import type { GlobalConfig } from "payload";

import { adminOnly } from "@/access/adminOnly";
import { checkRole } from "@/access/utilities";
import { link } from "@/fields/link";

export const Footer: GlobalConfig = {
  slug: "footer",
  access: {
    read: () => true,
    update: adminOnly,
  },
  admin: {
    hidden: ({ user }) => !checkRole(["admin"], user),
  },
  fields: [
    {
      name: "logo",
      type: "upload",
      relationTo: "media",
      admin: {
        description: "Optional footer logo. Falls back to the site wordmark if empty.",
      },
    },
    {
      name: "columns",
      type: "array",
      maxRows: 4,
      fields: [
        {
          name: "title",
          type: "text",
          required: true,
        },
        {
          name: "links",
          type: "array",
          maxRows: 8,
          fields: [
            link({
              appearances: false,
            }),
          ],
        },
      ],
    },
  ],
};
