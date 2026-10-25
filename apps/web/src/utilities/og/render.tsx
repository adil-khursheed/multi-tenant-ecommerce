import type { ReactElement } from "react";
import { ImageResponse } from "next/og";

import { HomeOgImage } from "@/components/og/HomeOgImage";
import { ProductOgImage } from "@/components/og/ProductOgImage";
import { OG_IMAGE_SIZE } from "../seo";
import { loadOgFonts } from "./fonts";
import { getProductOgData } from "./product";

const cacheHeaders = {
  "Cache-Control":
    "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
};

const createImageResponse = async (element: ReactElement) =>
  new ImageResponse(element, {
    ...OG_IMAGE_SIZE,
    fonts: await loadOgFonts(),
    headers: cacheHeaders,
  });

export const renderHomeOg = async () => createImageResponse(<HomeOgImage />);

export const renderProductOg = async (slug: string) => {
  const product = await getProductOgData(slug);

  if (!product) {
    return new Response("Not found", { status: 404 });
  }

  return createImageResponse(<ProductOgImage product={product} />);
};
