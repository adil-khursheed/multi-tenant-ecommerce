"use client";

import React from "react";
import { useRouter } from "next/navigation";

import { RefreshRouteOnSave as PayloadLivePreview } from "@payloadcms/live-preview-react";

import { env } from "@/env";

export const LivePreviewListener: React.FC = () => {
  const router = useRouter();
  return (
    <PayloadLivePreview
      refresh={router.refresh}
      serverURL={env.NEXT_PUBLIC_SERVER_URL || ""}
    />
  );
};
