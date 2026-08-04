import type { Metadata } from "next";

const defaultOpenGraph: Metadata["openGraph"] = {
  type: "website",
  description: "Dtlea is a multi vendor marketplace for women's fashion needs.",
  images: [
    {
      url: "https://payloadcms.com/images/og-image.jpg",
    },
  ],
  siteName: "Dtlea",
  title: "Dtlea | Dreams of Diva",
};

export const mergeOpenGraph = (
  og?: Partial<Metadata["openGraph"]>,
): Metadata["openGraph"] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  };
};
