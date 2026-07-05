import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import VendorMultiStepForm from "@/components/forms/CreateAccountForm/vendor-multi-step-form";
import { RenderParams } from "@/components/RenderParams";
import { getPopulatedTenants } from "@/utilities/getPopulatedTenants";
import { getUser } from "@/utilities/getUser";
import { mergeOpenGraph } from "@/utilities/mergeOpenGraph";

export default async function CreateVendorAccount() {
  const user = await getUser();

  if (!user) redirect("/login");

  const { hasActiveTenant, pendingTenant } = await getPopulatedTenants(user);

  if (hasActiveTenant) redirect("/admin");
  if (pendingTenant) redirect("/seller/thank-you");

  return (
    <div className="min-h-[calc(100dvh-80px)] bg-background">
      <Suspense fallback={null}>
        <RenderParams />
      </Suspense>

      <VendorMultiStepForm />
    </div>
  );
}

export const metadata: Metadata = {
  description: "Create a Seller account or log in to your existing account.",
  openGraph: mergeOpenGraph({
    title: "Create Seller Account",
    url: "/create-account/seller",
  }),
  title: "Create Seller Account",
};
