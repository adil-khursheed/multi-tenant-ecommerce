import type { Block } from "payload";

export const FourItemGrid: Block = {
  slug: "fourItemGrid",
  fields: [
    {
      name: "categories",
      type: "relationship",
      admin: {
        isSortable: true,
      },
      hasMany: true,
      label: "Categories to show",
      maxRows: 4,
      minRows: 4,
      relationTo: "categories",
    },
  ],
  interfaceName: "FourItemGridBlock",
  labels: {
    plural: "Four Item Grids",
    singular: "Four Item Grid",
  },
};
