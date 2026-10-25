import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

import { getPayload } from "payload";

import configPromise from "@payload-config";

import { RenderBlocks } from "@/blocks/RenderBlocks";
import { homeStaticData } from "@/endpoints/seed/home-static";
import { env } from "@/env";
import { RenderHero } from "@/heros/RenderHero";
import type { Page } from "@/payload-types";
import { generateMeta } from "@/utilities/generateMeta";
import { getServerSideURL } from "@/utilities/getURL";
import { serializeJsonLd } from "@/utilities/serializeJsonLd";
import TrustBar from "./components/trust-bar";

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise });
  const pages = await payload.find({
    collection: "pages",
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  });

  const params = pages.docs
    ?.filter((doc) => {
      return doc.slug !== "home";
    })
    .map(({ slug }) => {
      return { slug };
    });

  return params;
}

type Args = {
  params: Promise<{
    slug?: string;
  }>;
};

export default async function Page({ params }: Args) {
  const { slug = "home" } = await params;

  let page = await queryPageBySlug({
    slug,
  });

  // Remove this code once your website is seeded
  if (!page && slug === "home") {
    page = homeStaticData() as Page;
  }

  if (!page) {
    return notFound();
  }

  const { hero, layout } = page;
  const isHome = slug === "home";

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: env.SITE_NAME,
    url: getServerSideURL(),
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${getServerSideURL()}/shop?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <article>
      {isHome ? (
        <script
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(websiteJsonLd),
          }}
          type="application/ld+json"
        />
      ) : null}

      <RenderHero {...hero} />

      {isHome ? <TrustBar /> : null}

      <RenderBlocks blocks={layout} />
    </article>
  );
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug = "home" } = await params;

  const page = await queryPageBySlug({
    slug,
  });

  return generateMeta({ doc: page, slug });
}

const queryPageBySlug = async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode();

  const payload = await getPayload({ config: configPromise });

  const result = await payload.find({
    collection: "pages",
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      and: [
        {
          slug: {
            equals: slug,
          },
        },
        ...(draft ? [] : [{ _status: { equals: "published" } }]),
      ],
    },
  });

  return result.docs?.[0] || null;
};
