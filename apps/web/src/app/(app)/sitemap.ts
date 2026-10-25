import type { MetadataRoute } from "next";

import { getPayload } from "payload";

import configPromise from "@payload-config";

import type { Media } from "@/payload-types";
import { getServerSideURL } from "@/utilities/getURL";
import { toAbsoluteUrl } from "@/utilities/toAbsoluteUrl";

export const revalidate = 3600;

const baseUrl = () => getServerSideURL().replace(/\/$/, "");

const imageUrls = (value: unknown) => {
  const media =
    typeof value === "object" && value !== null && "url" in value
      ? (value as Media)
      : undefined;
  const url = toAbsoluteUrl(media?.url);

  return url ? [url] : [];
};

const staticRoutes: MetadataRoute.Sitemap = [
  {
    url: baseUrl(),
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 1,
  },
  {
    url: `${baseUrl()}/shop`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.9,
  },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const payload = await getPayload({ config: configPromise });

    const [pages, products] = await Promise.all([
      payload.find({
        collection: "pages",
        draft: false,
        overrideAccess: false,
        pagination: false,
        where: {
          _status: {
            equals: "published",
          },
        },
        select: {
          slug: true,
          updatedAt: true,
          meta: true,
        },
      }),
      payload.find({
        collection: "products",
        depth: 1,
        draft: false,
        overrideAccess: false,
        pagination: false,
        where: {
          _status: {
            equals: "published",
          },
        },
        select: {
          slug: true,
          updatedAt: true,
          gallery: true,
          meta: true,
        },
      }),
    ]);

    const pageRoutes: MetadataRoute.Sitemap = pages.docs.flatMap((page) => {
      if (!page.slug || page.slug === "home") return [];

      const metaImage = imageUrls(page.meta?.image);

      return [
        {
          url: `${baseUrl()}/${page.slug}`,
          lastModified: page.updatedAt,
          changeFrequency: "monthly",
          priority: 0.6,
          ...(metaImage.length ? { images: metaImage } : {}),
        },
      ];
    });

    const productRoutes: MetadataRoute.Sitemap = products.docs.flatMap(
      (product) => {
        if (!product.slug) return [];

        const images = [
          ...imageUrls(product.meta?.image),
          ...(product.gallery ?? []).flatMap((item) => imageUrls(item.image)),
        ].slice(0, 5);

        return [
          {
            url: `${baseUrl()}/products/${product.slug}`,
            lastModified: product.updatedAt,
            changeFrequency: "weekly",
            priority: 0.8,
            ...(images.length ? { images } : {}),
          },
        ];
      },
    );

    return [...staticRoutes, ...pageRoutes, ...productRoutes];
  } catch {
    return staticRoutes;
  }
}
