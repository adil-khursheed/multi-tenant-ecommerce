import type { ResolvedLink } from "./links";
import { resolveLink } from "./links";
import type { MediaReference } from "./media";
import { resolveMediaUrl } from "./media";

type RawHero = {
  type?: string;
  richText?: unknown;
  media?: MediaReference;
  links?: unknown[];
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
    media: MediaReference;
    heading?: string | null;
    subheading?: string | null;
    links?: unknown[];
  }[];
};

export type HeroData =
  | {
      type: "heroSlider";
      slides: {
        id?: string | null;
        mediaUrl: string | null;
        heading: string | null;
        subheading: string | null;
        linkHref: string | null;
        linkLabel: string | null;
      }[];
    }
  | {
      type: "highImpact";
      richText: unknown;
      mediaUrl: string | null;
      links: ResolvedLink[];
      featuredProduct: {
        title: string | null;
        slug: string | null;
        priceInINR: number | null;
        effectivePrice: number | null;
        discountPercent: number | null;
        imageUrl: string | null;
      } | null;
    }
  | {
      type: "mediumImpact";
      richText: unknown;
      mediaUrl: string | null;
      links: ResolvedLink[];
      mediaCaption: unknown;
    }
  | {
      type: "lowImpact";
      richText: unknown;
    }
  | null;

export function resolveHero(raw: RawHero | null | undefined): HeroData {
  if (!raw?.type || raw.type === "none") return null;

  switch (raw.type) {
    case "heroSlider": {
      if (!Array.isArray(raw.slides)) return null;
      const slides = raw.slides.map((slide) => {
        const link = resolveLink(slide.links?.[0] as never);
        return {
          id: slide.id,
          mediaUrl: resolveMediaUrl(slide.media),
          heading: slide.heading ?? null,
          subheading: slide.subheading ?? null,
          linkHref: link?.href ?? null,
          linkLabel: link?.label ?? null,
        };
      });
      return { type: "heroSlider", slides };
    }

    case "highImpact": {
      const product =
        raw.featuredProduct &&
        typeof raw.featuredProduct === "object" &&
        raw.featuredProduct !== null
          ? raw.featuredProduct
          : null;

      let productImageUrl: string | null = null;
      if (product?.gallery?.[0]?.image) {
        productImageUrl = resolveMediaUrl(product.gallery[0].image);
      }

      return {
        type: "highImpact",
        richText: raw.richText ?? null,
        mediaUrl: resolveMediaUrl(raw.media),
        links: (raw.links ?? [])
          .map((l) => resolveLink(l as never))
          .filter((l): l is ResolvedLink => l !== null),
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
        raw.media && typeof raw.media === "object" && raw.media.caption
          ? raw.media.caption
          : null;

      return {
        type: "mediumImpact",
        richText: raw.richText ?? null,
        mediaUrl: resolveMediaUrl(raw.media),
        links: (raw.links ?? [])
          .map((l) => resolveLink(l as never))
          .filter((l): l is ResolvedLink => l !== null),
        mediaCaption: caption,
      };
    }

    case "lowImpact": {
      return {
        type: "lowImpact",
        richText: raw.richText ?? null,
      };
    }

    default:
      return null;
  }
}
