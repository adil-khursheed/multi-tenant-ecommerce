import { z } from "zod";

import { baseProcedure } from "../trpc";

type RawMedia =
  | { url: string; caption?: unknown; id?: string | number }
  | string;

type RawLink = {
  link: {
    type?: string | null;
    newTab?: boolean | null;
    reference?: {
      relationTo: string;
      value: { slug?: string; [k: string]: unknown } | string;
    } | null;
    url?: string | null;
    label: string;
    appearance?: string | null;
  };
};

type RawHero = {
  type?: string;
  richText?: unknown;
  media?: RawMedia;
  links?: RawLink[];
  featuredProduct?:
    | {
        title?: string;
        slug?: string;
        priceInINR?: number;
        effectivePrice?: number;
        discountPercent?: number;
        gallery?: {
          image: { url: string } | string;
        }[];
      }
    | string;
  slides?: {
    id?: string | null;
    media: RawMedia;
    heading?: string | null;
    subheading?: string | null;
    links?: RawLink[];
  }[];
};

function resolveMediaUrl(media: RawMedia | undefined): string | null {
  if (!media) return null;
  if (typeof media === "object" && media.url) {
    return `${process.env.EXPO_PUBLIC_API_URL}${media.url}`;
  }
  if (typeof media === "string") {
    return `${process.env.EXPO_PUBLIC_API_URL}${media}`;
  }
  return null;
}

function resolveLink(rawLink: RawLink | undefined): {
  href: string;
  label: string;
  appearance: string;
} | null {
  const link = rawLink?.link;
  if (!link) return null;

  let href = "";
  if (link.type === "custom" && link.url) {
    href = link.url;
  } else if (
    link.type === "reference" &&
    link.reference?.value &&
    typeof link.reference.value === "object" &&
    link.reference.value.slug
  ) {
    const prefix =
      link.reference.relationTo === "pages"
        ? ""
        : `/${link.reference.relationTo}`;
    href = `${prefix}/${link.reference.value.slug}`;
  }

  if (!href) return null;

  return {
    href,
    label: link.label,
    appearance: link.appearance ?? "default",
  };
}

export const pagesRouter = {
  getHero: baseProcedure
    .input(
      z.object({
        slug: z.string().default("home"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { payload } = ctx;

      const result = await payload.find({
        collection: "pages",
        limit: 1,
        overrideAccess: true,
        pagination: false,
        depth: 1,
        where: {
          and: [
            { slug: { equals: input.slug } },
            { _status: { equals: "published" } },
          ],
        },
      });

      const page = result.docs?.[0];
      if (!page) return null;

      const hero = page.hero as RawHero;
      if (!hero?.type || hero.type === "none") return null;

      const resolvedLinks = hero.links?.map(resolveLink).filter(Boolean) as
        | { href: string; label: string; appearance: string }[]
        | undefined;

      switch (hero.type) {
        case "heroSlider": {
          if (!Array.isArray(hero.slides)) return null;
          const slides = hero.slides.map((slide) => {
            const link = resolveLink(slide.links?.[0]);
            return {
              id: slide.id,
              mediaUrl: slide.media,
              heading: slide.heading ?? null,
              subheading: slide.subheading ?? null,
              linkHref: link?.href ?? null,
              linkLabel: link?.label ?? null,
            };
          });
          return { type: "heroSlider" as const, slides };
        }

        case "highImpact": {
          const product =
            hero.featuredProduct &&
            typeof hero.featuredProduct === "object" &&
            hero.featuredProduct !== null
              ? hero.featuredProduct
              : null;

          let productImageUrl: string | null = null;
          if (product?.gallery?.[0]?.image) {
            const img = product.gallery[0].image;
            productImageUrl =
              typeof img === "object" && img.url
                ? `${process.env.EXPO_PUBLIC_API_URL}${img.url}`
                : typeof img === "string"
                  ? `${process.env.EXPO_PUBLIC_API_URL}${img}`
                  : null;
          }

          return {
            type: "highImpact" as const,
            richText: hero.richText ?? null,
            mediaUrl: resolveMediaUrl(hero.media),
            links: resolvedLinks ?? [],
            featuredProduct: product
              ? {
                  title: product.title ?? null,
                  slug: product.slug ?? null,
                  priceInINR: product.priceInINR ?? null,
                  effectivePrice: product.effectivePrice ?? null,
                  discountPercent: product.discountPercent ?? null,
                  imageUrl: productImageUrl,
                }
              : null,
          };
        }

        case "mediumImpact": {
          const caption =
            hero.media && typeof hero.media === "object" && hero.media.caption
              ? hero.media.caption
              : null;

          return {
            type: "mediumImpact" as const,
            richText: hero.richText ?? null,
            mediaUrl: resolveMediaUrl(hero.media),
            links: resolvedLinks ?? [],
            mediaCaption: caption,
          };
        }

        case "lowImpact": {
          return {
            type: "lowImpact" as const,
            richText: hero.richText ?? null,
          };
        }

        default:
          return null;
      }
    }),
};
