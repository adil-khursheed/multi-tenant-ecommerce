import type { ReactNode } from "react";
import { Cormorant_Garamond, DM_Sans, Geist_Mono } from "next/font/google";

import { AdminBar } from "@/components/AdminBar";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { LivePreviewListener } from "@/components/LivePreviewListener";
import { Providers } from "@/providers";
import { ensureStartsWith } from "@/utilities/ensureStartsWith";

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

const { SITE_NAME, TWITTER_CREATOR, TWITTER_SITE } = env;
const baseUrl = env.VERCEL_URL
  ? `https://${env.VERCEL_URL}`
  : env.NEXT_PUBLIC_SERVER_URL;
const twitterCreator = TWITTER_CREATOR
  ? ensureStartsWith(TWITTER_CREATOR, "@")
  : undefined;
const twitterSite = TWITTER_SITE
  ? ensureStartsWith(TWITTER_SITE, "https://")
  : undefined;

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  robots: {
    follow: true,
    index: true,
  },
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  ...(twitterCreator &&
    twitterSite && {
      twitter: {
        card: "summary_large_image",
        creator: twitterCreator,
        site: twitterSite,
      },
    }),
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
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
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
