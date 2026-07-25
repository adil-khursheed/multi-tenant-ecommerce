import type { Block } from "payload";
import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";

export const FiveItemGrid: Block = {
  slug: "fiveItemGrid",
  interfaceName: "FiveItemGridBlock",
  labels: {
    plural: "Five Item Grids",
    singular: "Five Item Grid",
  },
  fields: [
    {
      name: "heading",
      type: "richText",
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ["h1", "h2", "h3", "h4"] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ];
        },
      }),
      label: "Section Heading",
      admin: {
        description: "Optional title shown above the grid.",
      },
    },
    {
      name: "populateBy",
      type: "select",
      defaultValue: "collection",
      options: [
        { label: "Auto (by filter)", value: "collection" },
        { label: "Individual Selection", value: "selection" },
      ],
    },
    {
      name: "productFilter",
      type: "select",
      defaultValue: "featured",
      admin: { condition: (_, s) => s.populateBy === "collection" },
      options: [
        { label: "None", value: "none" },
        { label: "Featured", value: "featured" },
        { label: "New Arrivals", value: "newArrivals" },
        { label: "Bestsellers", value: "bestsellers" },
        { label: "Flash Sale", value: "flashSale" },
      ],
    },
    {
      name: "categories",
      type: "relationship",
      relationTo: "categories",
      hasMany: true,
      admin: { condition: (_, s) => s.populateBy === "collection" },
    },
    {
      name: "selectedDocs",
      type: "relationship",
      relationTo: "products",
      hasMany: true,
      minRows: 5,
      maxRows: 5,
      admin: { condition: (_, s) => s.populateBy === "selection" },
    },
  ],
};
