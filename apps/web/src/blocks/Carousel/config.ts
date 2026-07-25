import type { Block } from "payload";
import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";

export const Carousel: Block = {
  slug: "carousel",
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
        description: "Optional title shown above the carousel.",
      },
    },
    {
      name: "contentType",
      type: "select",
      defaultValue: "products",
      label: "Content Type",
      options: [
        {
          label: "Products",
          value: "products",
        },
        {
          label: "Categories",
          value: "categories",
        },
        {
          label: "Collections",
          value: "collections",
        },
      ],
    },
    {
      name: "populateBy",
      type: "select",
      defaultValue: "collection",
      admin: {
        condition: (_, siblingData) => siblingData.contentType === "products",
      },
      options: [
        {
          label: "Collection",
          value: "collection",
        },
        {
          label: "Individual Selection",
          value: "selection",
        },
      ],
    },
    {
      name: "productFilter",
      type: "select",
      defaultValue: "none",
      label: "Product Filter",
      admin: {
        condition: (_, siblingData) =>
          siblingData.contentType === "products" &&
          siblingData.populateBy === "collection",
        description:
          "Auto-filter products by flag. Stacks with category filter.",
      },
      options: [
        { label: "None", value: "none" },
        { label: "New Arrivals", value: "newArrivals" },
        { label: "Featured", value: "featured" },
        { label: "Bestsellers", value: "bestsellers" },
        { label: "Flash Sale", value: "flashSale" },
      ],
    },
    {
      name: "relationTo",
      type: "select",
      admin: {
        condition: (_, siblingData) =>
          siblingData.contentType === "products" &&
          siblingData.populateBy === "collection",
      },
      defaultValue: "products",
      label: "Collections To Show",
      options: [
        {
          label: "Products",
          value: "products",
        },
      ],
    },
    {
      name: "categories",
      type: "relationship",
      admin: {
        condition: (_, siblingData) =>
          siblingData.contentType === "products" &&
          siblingData.populateBy === "collection",
      },
      hasMany: true,
      label: "Categories To Show",
      relationTo: "categories",
    },
    {
      name: "limit",
      type: "number",
      admin: {
        condition: (_, siblingData) =>
          siblingData.populateBy === "collection" ||
          siblingData.contentType !== "products",
        step: 1,
      },
      defaultValue: 10,
      label: "Limit",
    },
    {
      name: "selectedDocs",
      type: "relationship",
      admin: {
        condition: (_, siblingData) =>
          siblingData.contentType === "products" &&
          siblingData.populateBy === "selection",
      },
      hasMany: true,
      label: "Selection",
      relationTo: ["products"],
    },
    {
      name: "populatedDocs",
      type: "relationship",
      admin: {
        condition: (_, siblingData) =>
          siblingData.contentType === "products" &&
          siblingData.populateBy === "collection",
        description: "This field is auto-populated after-read",
        disabled: true,
      },
      hasMany: true,
      label: "Populated Docs",
      relationTo: ["products"],
    },
    {
      name: "populatedDocsTotal",
      type: "number",
      admin: {
        condition: (_, siblingData) =>
          siblingData.contentType === "products" &&
          siblingData.populateBy === "collection",
        description: "This field is auto-populated after-read",
        disabled: true,
        step: 1,
      },
      label: "Populated Docs Total",
    },
  ],
  interfaceName: "CarouselBlock",
  labels: {
    plural: "Carousels",
    singular: "Carousel",
  },
};
