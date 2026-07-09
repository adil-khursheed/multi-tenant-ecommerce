import React from "react";

import { serverCaller } from "@/trpc/server";
import { RichText } from "@/components/RichText";
import type { FiveItemGridBlock as FiveItemGridBlockProps, Product } from "@/payload-types";
import { FiveItemGridClient } from "./Component.client";

export const FiveItemGridBlock: React.FC<FiveItemGridBlockProps> = async (props) => {
  const { heading, populateBy, productFilter, categories, selectedDocs } = props;

  let products: Product[] = [];

  if (populateBy === "collection") {
    // We map Payload's category relationships to just string IDs for tRPC input
    const categoryIds =
      categories
        ?.map((c) => (typeof c === "object" && c !== null ? c.id : c))
        .filter(Boolean) as string[] | undefined;

    // Use tRPC via serverCaller (bypasses HTTP)
    products = (await serverCaller().blocks.getFiveItemGrid({
      filter: productFilter as any,
      categoryIds,
      limit: 5,
    })) as Product[];
  } else if (populateBy === "selection" && selectedDocs) {
    // When manually selecting docs, they are already populated by Payload
    products = selectedDocs
      .map((doc) => (typeof doc === "object" && doc !== null ? doc : null))
      .filter(Boolean) as Product[];
  }

  if (products.length === 0) return null;

  return (
    <div className="w-full py-8">
      {heading && (
        <div className="container mb-8">
          <RichText data={heading} enableGutter={false} />
        </div>
      )}
      <div className="container">
        <FiveItemGridClient products={products} />
      </div>
    </div>
  );
};
