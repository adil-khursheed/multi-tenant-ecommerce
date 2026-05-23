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
      name: "navItems",
      type: "array",
      fields: [
        link({
          appearances: false,
        }),
      ],
      maxRows: 6,
    },
  ],
};
