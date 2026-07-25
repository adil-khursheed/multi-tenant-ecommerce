import React from "react";
import type { Metadata } from "next";
import { headers as getHeaders } from "next/headers.js";

import { getPayload } from "payload";

import configPromise from "@payload-config";

import { FindOrderForm } from "@/components/forms/FindOrderForm";
import { mergeOpenGraph } from "@/utilities/mergeOpenGraph";

export default async function FindOrderPage() {
  const headers = await getHeaders();
  const payload = await getPayload({ config: configPromise });
  const { user } = await payload.auth({ headers });

  return (
    <div className="container py-16">
      <FindOrderForm initialEmail={user?.email} />
    </div>
  );
}

export const metadata: Metadata = {
  description: "Find your order using your email and order ID.",
  openGraph: mergeOpenGraph({
    title: "Find order",
    url: "/find-order",
  }),
  title: "Find order",
};
