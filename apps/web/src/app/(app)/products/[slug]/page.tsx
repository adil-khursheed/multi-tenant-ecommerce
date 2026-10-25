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
import { env } from "@/env";
import type { Media, Product } from "@/payload-types";
import { serverCaller } from "@/trpc/server";
import { getServerSideURL } from "@/utilities/getURL";
import { mergeOpenGraph } from "@/utilities/mergeOpenGraph";
import {
  getTwitterMetadata,
  noIndexRobots,
  OG_IMAGE_SIZE,
} from "@/utilities/seo";
import { serializeJsonLd } from "@/utilities/serializeJsonLd";
import { toAbsoluteUrl } from "@/utilities/toAbsoluteUrl";

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

  if (!product) {
    return {
      title: "Product not found",
      robots: noIndexRobots,
    };
  }

  const title = product.meta?.title || product.title || "Product";
  const description =
    product.meta?.description ||
    product.shortDescription ||
    `Shop ${title} on ${env.SITE_NAME}.`;
  const canonical = `/products/${slug}`;
  const canIndex = product._status === "published" && !draft;
  const ogImage = `/og/products/${slug}`;
  const twitterImage = `/og/products/${slug}/twitter`;

  return {
    alternates: {
      canonical,
    },
    description,
    openGraph: mergeOpenGraph({
      description,
      images: [
        {
          alt: title,
          url: ogImage,
          ...OG_IMAGE_SIZE,
        },
      ],
      title,
      url: canonical,
    }),
    robots: canIndex ? undefined : noIndexRobots,
    title,
    twitter: getTwitterMetadata({
      description,
      images: [twitterImage],
      title,
    }),
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

  const productUrl = `${getServerSideURL()}/products/${slug}`;
  const tenant =
    typeof product.tenant === "object" ? product.tenant : undefined;
  const averageRating = product.ratings?.average || 0;
  const reviewCount = product.ratings?.count || 0;
  const description =
    product.meta?.description || product.shortDescription || undefined;
  const offerPrice =
    typeof price === "number" && Number.isFinite(price) ? price : undefined;
  const imageUrls = [metaImage?.url, ...gallery.map((item) => item.image.url)]
    .map((url) => toAbsoluteUrl(url))
    .filter((url): url is string => Boolean(url));

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    ...(description ? { description } : {}),
    ...(imageUrls.length ? { image: [...new Set(imageUrls)] } : {}),
    ...(product.sku ? { sku: product.sku } : {}),
    ...(tenant?.storeName
      ? {
          brand: {
            "@type": "Brand",
            name: tenant.storeName,
          },
        }
      : {}),
    ...(offerPrice !== undefined
      ? {
          offers: {
            "@type": "Offer",
            availability: hasStock
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            itemCondition: "https://schema.org/NewCondition",
            price: offerPrice,
            priceCurrency: "INR",
            url: productUrl,
            ...(tenant?.storeName
              ? {
                  seller: {
                    "@type": "Organization",
                    name: tenant.storeName,
                  },
                }
              : {}),
          },
        }
      : {}),
    ...(averageRating > 0 && reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: averageRating,
            reviewCount,
          },
        }
      : {}),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: getServerSideURL(),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Shop",
        item: `${getServerSideURL()}/shop`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.title,
        item: productUrl,
      },
    ],
  };

  const relatedProducts =
    product.relatedProducts?.filter(
      (relatedProduct) => typeof relatedProduct === "object",
    ) ?? [];

  return (
    <React.Fragment>
      <script
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(productJsonLd),
        }}
        type="application/ld+json"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(breadcrumbJsonLd),
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
                <div className="relative aspect-9/16 max-h-162.5 w-full overflow-hidden bg-muted rounded-lg animate-pulse" />
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
