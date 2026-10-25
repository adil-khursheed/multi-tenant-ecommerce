import { getPayload } from "payload";

import configPromise from "@payload-config";
import sharp from "sharp";

import type { OgProduct } from "@/components/og/ProductOgImage";
import { env } from "@/env";
import type { Media, Product, Tenant } from "@/payload-types";
import { toAbsoluteUrl } from "../toAbsoluteUrl";

const formatInr = (value?: number | null) => {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;

  return `INR ${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(value)}`;
};

const getMedia = (value: unknown): Media | undefined =>
  typeof value === "object" && value !== null ? (value as Media) : undefined;

const toDataUrl = async (url?: string | null) => {
  const absoluteUrl = toAbsoluteUrl(url);

  if (!absoluteUrl) return undefined;

  try {
    const response = await fetch(absoluteUrl, { cache: "no-store" });

    if (!response.ok) return undefined;

    const source = Buffer.from(await response.arrayBuffer());
    const png = await sharp(source)
      .resize(800, 940, { fit: "cover", position: "attention" })
      .png()
      .toBuffer();

    return `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    return undefined;
  }
};

export const getProductOgData = async (
  slug: string,
): Promise<OgProduct | null> => {
  const payload = await getPayload({ config: configPromise });
  const result = await payload.find({
    collection: "products",
    depth: 2,
    draft: false,
    limit: 1,
    overrideAccess: false,
    pagination: false,
    select: {
      title: true,
      slug: true,
      enableVariants: true,
      priceInINR: true,
      effectivePrice: true,
      minEffectivePrice: true,
      meta: true,
      gallery: true,
      tenant: true,
    },
    where: {
      and: [
        {
          slug: {
            equals: slug,
          },
        },
        {
          _status: {
            equals: "published",
          },
        },
      ],
    },
  });

  const product = result.docs?.[0] as Product | undefined;

  if (!product) return null;

  const tenant =
    typeof product.tenant === "object" ? (product.tenant as Tenant) : undefined;
  const metaImage = getMedia(product.meta?.image);
  const galleryImage = product.gallery
    ?.map((item) => getMedia(item.image))
    .find(Boolean);

  const image = await toDataUrl(metaImage?.url ?? galleryImage?.url);
  const price = product.enableVariants
    ? (product.minEffectivePrice ?? product.priceInINR)
    : (product.effectivePrice ?? product.priceInINR);

  return {
    title: product.title || "Shop the collection",
    storeName: tenant?.storeName || env.SITE_NAME,
    price: formatInr(price),
    image,
  };
};
