import path from "path";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";

import { withPayload } from "@payloadcms/next/withPayload";

import "./src/env";

import { env } from "@/env";
import { redirects } from "./redirects";

const __filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(__filename);

const NEXT_PUBLIC_SERVER_URL = env.NEXT_PUBLIC_SERVER_URL;

const nextConfig: NextConfig = {
  images: {
    localPatterns: [
      {
        pathname: "/api/media/file/**",
      },
      {
        pathname: "/images/**",
      },
    ],
    qualities: [90, 100],
    remotePatterns: [
      ...[NEXT_PUBLIC_SERVER_URL /* 'https://example.com' */].map((item) => {
        const url = new URL(item);

        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(":", "") as "http" | "https",
        };
      }),
    ],
  },
  reactStrictMode: true,
  redirects,
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      ".cjs": [".cts", ".cjs"],
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
    };

    return webpackConfig;
  },
  turbopack: {
    root: path.resolve(dirname),
  },
};

export default withPayload(nextConfig);
