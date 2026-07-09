import React from "react";

import { getPayload } from "payload";

import configPromise from "@payload-config";

import { RichText } from "@/components/RichText";
import type {
  Category,
  Media,
  TabsBlock as TabsBlockProps,
} from "@/payload-types";
import { CategoryTab, CustomTab, TabsClient } from "./Component.client";

export const TabsBlock: React.FC<TabsBlockProps> = async (props) => {
  const { heading, contentType = "categories", parentCategories, tabs } = props;

  let categoryTabs: CategoryTab[] = [];
  let customTabs: CustomTab[] = [];

  if (contentType === "categories") {
    const payload = await getPayload({ config: configPromise });

    let parents: Category[] = [];
    if (parentCategories && parentCategories.length > 0) {
      parents = parentCategories
        .map((p) => (typeof p === "object" && p !== null ? p : null))
        .filter(Boolean) as Category[];
    } else {
      const parentResult = await payload.find({
        collection: "categories",
        where: {
          and: [{ parent: { exists: false } }, { active: { equals: true } }],
        },
        sort: "order",
        depth: 0,
        limit: 100,
      });
      parents = parentResult.docs;
    }

    for (const parent of parents) {
      if (!parent) continue;

      const childrenResult = await payload.find({
        collection: "categories",
        where: {
          and: [
            { parent: { equals: parent.id } },
            { active: { equals: true } },
          ],
        },
        sort: "order",
        depth: 1,
        limit: 100,
      });

      if (childrenResult.docs.length > 0) {
        categoryTabs.push({
          parentName: parent.name,
          parentSlug: parent.slug,
          children: childrenResult.docs.map((child: any) => ({
            id: child.id,
            name: child.name,
            slug: child.slug,
            image: (typeof child.image === "object"
              ? child.image
              : null) as Media | null,
          })),
        });
      }
    }
  } else if (contentType === "custom") {
    if (tabs && tabs.length > 0) {
      customTabs = tabs.map((t) => ({
        tab: t.tab || "",
        content: t.content,
      }));
    }
  }

  if (contentType === "categories" && categoryTabs.length === 0) return null;
  if (contentType === "custom" && customTabs.length === 0) return null;

  return (
    <div className="w-full py-2">
      {heading && (
        <div className="container mb-20">
          <RichText data={heading} enableGutter={false} />
        </div>
      )}
      <div className="container">
        <TabsClient
          contentType={contentType as "categories" | "custom"}
          categoryTabs={categoryTabs}
          customTabs={customTabs}
        />
      </div>
    </div>
  );
};
