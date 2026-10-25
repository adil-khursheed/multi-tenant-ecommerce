import type { MetadataRoute } from "next";

import { getServerSideURL } from "@/utilities/getURL";

const baseUrl = getServerSideURL().replace(/\/$/, "");

const privateRoutes = [
  "/account",
  "/orders",
  "/wishlist",
  "/checkout",
  "/login",
  "/logout",
  "/create-account",
  "/forgot-password",
  "/find-order",
  "/verify-email",
  "/seller",
  "/admin",
  "/api/",
  "/next/",
];

export default function robots(): MetadataRoute.Robots {
  return {
    host: baseUrl,
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: privateRoutes,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
