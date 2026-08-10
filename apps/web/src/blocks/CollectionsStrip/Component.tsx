import React from "react";

import { getPayload } from "payload";

import configPromise from "@payload-config";

import { RichText } from "@/components/RichText";
import type {
  Collection,
  CollectionsStripBlock as CollectionsStripBlockProps,
  Media,
} from "@/payload-types";
import { CollectionsStripClient, StripItem } from "./Component.client";

export const CollectionsStripBlock: React.FC<
  CollectionsStripBlockProps
> = async (props) => {
  const { heading, collections } = props;

  const items = await resolveCollections(collections);

  if (items.length === 0) return null;

  return (
    <div className="w-full py-8">
      {heading && (
        <div className="container mb-8">
          <RichText data={heading} enableGutter={false} />
        </div>
      )}
      <div className="container">
        <CollectionsStripClient items={items} />
      </div>
    </div>
  );
};

// ─── Data resolution ─────────────────────────────────────────────────────────

async function resolveCollections(
  selected: CollectionsStripBlockProps["collections"],
): Promise<StripItem[]> {
  const payload = await getPayload({ config: configPromise });

  let collections: Collection[] = [];

  if (selected && selected.length > 0) {
    // Manual selection — resolve by ID so coverImage is populated, and
    // preserve the admin's chosen order.
    const ids = selected.map((collection) =>
      typeof collection === "object" && collection !== null
        ? collection.id
        : collection,
    );

    const result = await payload.find({
      collection: "collections",
      depth: 1,
      limit: ids.length,
      where: { id: { in: ids } },
    });

    const byId = new Map(result.docs.map((doc) => [doc.id, doc]));
    collections = ids
      .map((id) => byId.get(id))
      .filter((collection): collection is Collection => Boolean(collection));
  } else {
    // Fallback — all active, date-valid collections sorted by `order`.
    const now = new Date().toISOString();

    const result = await payload.find({
      collection: "collections",
      depth: 1,
      limit: 100,
      where: {
        and: [
          { active: { equals: true } },
          {
            or: [
              { startDate: { exists: false } },
              { startDate: { less_than_equal: now } },
            ],
          },
          {
            or: [
              { endDate: { exists: false } },
              { endDate: { greater_than_equal: now } },
            ],
          },
        ],
      },
      sort: "order",
    });

    collections = result.docs;
  }

  return collections
    .filter((collection) => collection.active)
    .map((collection) => ({
      slug: collection.slug ?? "",
      name: collection.name,
      coverImage: (typeof collection.coverImage === "object"
        ? collection.coverImage
        : null) as Media | null,
    }));
}
