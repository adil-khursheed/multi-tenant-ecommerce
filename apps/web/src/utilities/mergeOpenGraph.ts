import type { Metadata } from "next";

import { env } from "@/env";
import { HOME_OG_IMAGE, OG_IMAGE_SIZE, SITE_DESCRIPTION } from "./seo";

const defaultOpenGraph: NonNullable<Metadata["openGraph"]> = {
  type: "website",
  locale: "en_IN",
  description: SITE_DESCRIPTION,
  images: [
    {
      url: HOME_OG_IMAGE,
      ...OG_IMAGE_SIZE,
      alt: `${env.SITE_NAME} — curated multi-vendor marketplace`,
    },
  ],
  siteName: env.SITE_NAME,
  title: `${env.SITE_NAME} — Curated multi-vendor marketplace`,
};

export const mergeOpenGraph = (
  og?: Partial<NonNullable<Metadata["openGraph"]>>,
): NonNullable<Metadata["openGraph"]> => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ?? defaultOpenGraph.images,
  };
};
