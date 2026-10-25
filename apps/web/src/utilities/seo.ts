import type { Metadata } from "next";

import { env } from "@/env";

export const SITE_DESCRIPTION =
  "DTlea is a curated multi-vendor marketplace. Shop independent sellers with verified stores, one shared cart, and secure checkout.";

export const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
};

export const HOME_OG_IMAGE = "/og/home";
export const HOME_TWITTER_IMAGE = "/og/home/twitter";

export const noIndexRobots: NonNullable<Metadata["robots"]> = {
  index: false,
  follow: false,
  nocache: true,
  googleBot: {
    index: false,
    follow: false,
    noimageindex: true,
    "max-image-preview": "none",
    "max-snippet": 0,
    "max-video-preview": 0,
  },
};

export const toTwitterHandle = (value?: string | null) => {
  if (!value) return undefined;

  const trimmed = value.trim();

  if (trimmed.startsWith("@")) return trimmed;
  if (/^[A-Za-z0-9_]{1,15}$/.test(trimmed)) return `@${trimmed}`;

  return undefined;
};

type TwitterMetadataArgs = {
  title?: string;
  description?: string;
  images?: string[];
};

export const getTwitterMetadata = ({
  title,
  description,
  images,
}: TwitterMetadataArgs = {}): NonNullable<Metadata["twitter"]> => {
  const creator = toTwitterHandle(env.TWITTER_CREATOR);
  const site = toTwitterHandle(env.TWITTER_SITE) ?? creator;

  return {
    card: "summary_large_image",
    ...(creator && { creator }),
    ...(site && { site }),
    ...(title && { title }),
    ...(description && { description }),
    ...(images?.length && { images }),
  };
};
