import { Suspense } from "react";
import type { Metadata } from "next";

import VendorMultiStepForm from "@/components/forms/CreateAccountForm/vendor-multi-step-form";
import { RenderParams } from "@/components/RenderParams";
import { mergeOpenGraph } from "@/utilities/mergeOpenGraph";

export default async function CreateVendorAccount() {
  // const user = await getUser();

  // if (user) {
  //   redirect(
  //     `/account?warning=${encodeURIComponent("You are already logged in.")}`,
  //   );
  // }

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
  description: "Create a vendor account or log in to your existing account.",
  openGraph: mergeOpenGraph({
    title: "Create Vendor Account",
    url: "/create-account/vendor",
  }),
  title: "Create Vendor Account",
};
