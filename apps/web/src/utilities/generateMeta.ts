import type { Metadata } from "next";

import { env } from "@/env";
import type { Page, Product } from "../payload-types";
import { mergeOpenGraph } from "./mergeOpenGraph";
import {
  getTwitterMetadata,
  HOME_OG_IMAGE,
  HOME_TWITTER_IMAGE,
  noIndexRobots,
  OG_IMAGE_SIZE,
  SITE_DESCRIPTION,
} from "./seo";
import { toAbsoluteUrl } from "./toAbsoluteUrl";

export const generateMeta = async (args: {
  doc: Page | Product | null;
  slug?: string;
}): Promise<Metadata> => {
  const { doc, slug } = args || {};

  const isHome = !slug || slug === "home";
  const canIndex = Boolean(doc) && doc?._status !== "draft";
  const title = isHome
    ? `${env.SITE_NAME} — Curated multi-vendor marketplace`
    : doc?.meta?.title || doc?.title || env.SITE_NAME;
  const description = isHome
    ? SITE_DESCRIPTION
    : doc?.meta?.description || SITE_DESCRIPTION;
  const canonical = isHome ? "/" : `/${slug}`;

  const image = doc?.meta?.image;
  const metaImage =
    typeof image === "object" && image?.url
      ? {
          url: toAbsoluteUrl(image.url)!,
          alt: image.alt || title,
          ...(image.width ? { width: image.width } : {}),
          ...(image.height ? { height: image.height } : {}),
        }
      : undefined;

  const openGraphImage =
    !isHome && metaImage
      ? metaImage
      : {
          url: HOME_OG_IMAGE,
          ...OG_IMAGE_SIZE,
          alt: `${env.SITE_NAME} — curated multi-vendor marketplace`,
        };

  return {
    description,
    title: isHome ? { absolute: title } : title,
    alternates: {
      canonical,
    },
    openGraph: mergeOpenGraph({
      description,
      images: [openGraphImage],
      title,
      url: canonical,
    }),
    robots: canIndex ? undefined : noIndexRobots,
    twitter: getTwitterMetadata({
      title,
      description,
      images: [(!isHome && metaImage?.url) || HOME_TWITTER_IMAGE],
    }),
  };
};
