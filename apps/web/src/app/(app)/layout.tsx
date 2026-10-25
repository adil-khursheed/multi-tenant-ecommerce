import type { ReactNode } from "react";
import { Cormorant_Garamond, DM_Sans, Geist_Mono } from "next/font/google";

import { AdminBar } from "@/components/AdminBar";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { LivePreviewListener } from "@/components/LivePreviewListener";
import { Providers } from "@/providers";
import { getServerSideURL } from "@/utilities/getURL";
import {
  getTwitterMetadata,
  HOME_OG_IMAGE,
  HOME_TWITTER_IMAGE,
  OG_IMAGE_SIZE,
  SITE_DESCRIPTION,
} from "@/utilities/seo";

import "./globals.css";

import type { Metadata } from "next";

import { env } from "@/env";
import { InitTheme } from "@/providers/Theme/InitTheme";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const { SITE_NAME } = env;
const baseUrl = getServerSideURL();
const siteTitle = `${SITE_NAME} — Curated multi-vendor marketplace`;

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: baseUrl }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "shopping",
  description: SITE_DESCRIPTION,
  title: {
    default: siteTitle,
    template: `%s | ${SITE_NAME}`,
  },
  robots: {
    follow: true,
    index: true,
    googleBot: {
      follow: true,
      index: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: SITE_NAME,
    title: siteTitle,
    description: SITE_DESCRIPTION,
    url: "/",
    images: [
      {
        url: HOME_OG_IMAGE,
        ...OG_IMAGE_SIZE,
        alt: siteTitle,
      },
    ],
  },
  twitter: getTwitterMetadata({
    title: siteTitle,
    description: SITE_DESCRIPTION,
    images: [HOME_TWITTER_IMAGE],
  }),
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
  },
  referrer: "origin-when-cross-origin",
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <InitTheme />
      </head>
      <body
        className={`${dmSans.variable} ${cormorantGaramond.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <AdminBar />
          <LivePreviewListener />

          <Header />
          <main>{children}</main>

          <Footer />
        </Providers>
      </body>
    </html>
  );
}
