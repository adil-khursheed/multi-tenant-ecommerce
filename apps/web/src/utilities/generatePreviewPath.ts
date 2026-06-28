import { CollectionSlug, PayloadRequest } from "payload";

import { env } from "@/env";

const collectionPrefixMap: Partial<Record<CollectionSlug, string>> = {
  products: "/products",
  pages: "",
};

type Props = {
  collection: keyof typeof collectionPrefixMap;
  slug: string;
  req: PayloadRequest;
};

export const generatePreviewPath = ({ collection, slug }: Props) => {
  // Allow empty strings, e.g. for the homepage
  if (slug === undefined || slug === null) {
    return null;
  }

  const encodedParams = new URLSearchParams({
    slug,
    collection,
    path: `${collectionPrefixMap[collection]}/${slug}`,
    previewSecret: env.PREVIEW_SECRET || "",
  });

  const url = `/next/preview?${encodedParams.toString()}`;

  return url;
};
