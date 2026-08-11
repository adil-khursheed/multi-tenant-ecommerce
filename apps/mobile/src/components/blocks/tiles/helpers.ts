import type { MediaSource } from "@/utils/media";

export type TileProduct = {
  slug: string;
  title?: string | null;
  price: number | null;
  image: MediaSource;
};

type RawProduct = {
  slug?: string | null;
  title?: string | null;
  priceInINR?: number | null;
  enableVariants?: boolean | null;
  variants?: {
    docs?: {
      priceInINR?: number | null;
      effectivePrice?: number | null;
    }[];
  } | null;
  gallery?: { image: MediaSource; id?: string | null }[] | null;
};

/** Extract the fields ProductTile needs, mirroring the web GridTileImage (variant-aware price). */
export function toTileProduct(product: RawProduct | null | undefined): TileProduct | null {
  if (!product || typeof product !== "object") return null;

  const hasVariants = product.enableVariants && product.variants?.docs?.length;
  const price =
    hasVariants && product.variants?.docs?.[0]
      ? product.variants.docs[0].effectivePrice ?? product.variants.docs[0].priceInINR ?? null
      : product.priceInINR ?? null;

  return {
    slug: product.slug ?? "",
    title: product.title ?? null,
    price,
    image: product.gallery?.[0]?.image ?? null,
  };
}
