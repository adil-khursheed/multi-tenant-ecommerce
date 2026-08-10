import type { Block } from "payload";
import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";

export const CollectionsStrip: Block = {
  slug: "collectionsStrip",
  interfaceName: "CollectionsStripBlock",
  labels: {
    plural: "Collections Strips",
    singular: "Collections Strip",
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
        description: "Optional title shown above the strip.",
      },
    },
    {
      name: "collections",
      type: "relationship",
      relationTo: "collections",
      hasMany: true,
      label: "Collections to Show",
      admin: {
        description:
          "Pick the occasion collections to display as cards. Leave empty to auto-show all active collections.",
      },
    },
  ],
};
