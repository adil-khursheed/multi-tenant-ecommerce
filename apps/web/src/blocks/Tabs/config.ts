import type { Block } from "payload";
import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";

export const Tabs: Block = {
  slug: "tabs",
  interfaceName: "TabsBlock",
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
        description: "Optional title shown above the tabs.",
      },
    },
    {
      name: "contentType",
      type: "select",
      defaultValue: "categories",
      options: [
        { label: "Categories", value: "categories" },
        { label: "Custom", value: "custom" },
      ],
    },
    {
      name: "parentCategories",
      type: "relationship",
      relationTo: "categories",
      hasMany: true,
      filterOptions: () => {
        return {
          parent: {
            exists: false,
          },
        };
      },
      admin: {
        condition: (_, siblingData) => siblingData.contentType === "categories",
        description:
          "Pick specific parent categories to show as tabs, or leave empty for all.",
      },
    },
    {
      name: "tabs",
      type: "array",
      admin: {
        condition: (_, siblingData) => siblingData.contentType === "custom",
      },
      fields: [
        {
          name: "tab",
          type: "text",
        },
        {
          name: "content",
          type: "richText",
        },
      ],
    },
  ],
};
