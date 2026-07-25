import React, { Suspense } from "react";
import { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

import { RenderBlocks } from "@/blocks/RenderBlocks";
import { CustomerReviews } from "@/components/product/CustomerReviews";
import { Gallery } from "@/components/product/Gallery";
import { ProductDetailsAccordion } from "@/components/product/ProductDetailsAccordion";
import { ProductInfo } from "@/components/product/ProductInfo";
import { RelatedProductsGrid } from "@/components/product/RelatedProductsGrid";
import { StickyBottomBar } from "@/components/product/StickyBottomBar";
import { VendorCard } from "@/components/product/VendorCard";
import type { Media, Product } from "@/payload-types";
import { serverCaller } from "@/trpc/server";

type Args = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params;
  const { isEnabled: draft } = await draftMode();
  const caller = await serverCaller();
  const { product } = await caller.product.getProductBySlug({
    slug,
    draft: draft || undefined,
  });

  if (!product) return notFound();

  const gallery =
    product.gallery?.filter((item) => typeof item.image === "object") || [];

  const metaImage =
    typeof product.meta?.image === "object" ? product.meta?.image : undefined;
  const canIndex = product._status === "published";

  const seoImage =
    metaImage || (gallery.length ? (gallery[0]?.image as Media) : undefined);

  return {
    description: product.meta?.description || "",
    openGraph: seoImage?.url
      ? {
          images: [
            {
              alt: seoImage?.alt,
              height: seoImage.height!,
              url: seoImage?.url,
              width: seoImage.width!,
            },
          ],
        }
      : null,
    robots: {
      follow: canIndex,
      googleBot: {
        follow: canIndex,
        index: canIndex,
      },
      index: canIndex,
    },
    title: product.meta?.title || product.title,
  };
}

export default async function ProductPage({ params }: Args) {
  const { slug } = await params;
  const { isEnabled: draft } = await draftMode();
  const caller = await serverCaller();
  const { product, reviews, sizeGuide } = await caller.product.getProductBySlug(
    {
      slug,
      draft: draft || undefined,
    },
  );

  if (!product) return notFound();

  const gallery =
    product.gallery
      ?.filter((item) => typeof item.image === "object")
      .map((item) => ({
        ...item,
        image: item.image as Media,
      })) || [];

  const metaImage =
    typeof product.meta?.image === "object" ? product.meta?.image : undefined;

  const hasStock = product.enableVariants
    ? product?.variants?.docs?.some((variant) => {
        if (typeof variant !== "object") return false;
        return variant.inventory && variant?.inventory > 0;
      })
    : product.inventory! > 0;

  const price = product.enableVariants
    ? (product.minEffectivePrice ?? product.priceInINR)
    : (product.effectivePrice ?? product.priceInINR);

  const productJsonLd = {
    name: product.title,
    "@context": "https://schema.org",
    "@type": "Product",
    description: product.description,
    image: metaImage?.url,
    offers: {
      "@type": "AggregateOffer",
      availability: hasStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      price: price,
      priceCurrency: "INR",
    },
  };

  const relatedProducts =
    product.relatedProducts?.filter(
      (relatedProduct) => typeof relatedProduct === "object",
    ) ?? [];

  const averageRating = product.ratings?.average || 0;
  const reviewCount = product.ratings?.count || 0;

  return (
    <React.Fragment>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
        type="application/ld+json"
      />
      <div className="container max-w-7xl pt-8 pb-16 px-4 md:px-8">
        {/* 2-column Hero section */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 w-full">
          {/* Left Column: Gallery */}
          <div className="w-full lg:w-[55%]">
            <Suspense
              fallback={
                <div className="relative aspect-9/16 max-h-[650px] w-full overflow-hidden bg-muted rounded-lg animate-pulse" />
              }
            >
              {Boolean(gallery?.length) && (
                <Gallery
                  gallery={gallery}
                  isBestseller={product.flags?.isBestseller}
                />
              )}
            </Suspense>
          </div>

          {/* Right Column: Product Info */}
          <div className="w-full lg:w-[45%]">
            <ProductInfo product={product} sizeGuide={sizeGuide} />
          </div>
        </div>

        {/* Product Details Accordion */}
        <ProductDetailsAccordion product={product} sizeGuide={sizeGuide} />

        {/* Vendor Card */}
        <VendorCard product={product} />

        {/* Customer Reviews */}
        <CustomerReviews
          reviews={reviews.docs}
          averageRating={averageRating}
          reviewCount={reviewCount}
        />

        {/* Related Products */}
        <RelatedProductsGrid relatedProducts={relatedProducts as Product[]} />
      </div>

      {product.layout?.length ? (
        <RenderBlocks blocks={product.layout} />
      ) : (
        <></>
      )}

      {/* Sticky Bottom Bar */}
      <StickyBottomBar product={product} />
    </React.Fragment>
  );
}
