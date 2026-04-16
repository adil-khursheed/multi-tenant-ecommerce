import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CreateAccountForm } from "@/components/forms/CreateAccountForm";
import { RenderParams } from "@/components/RenderParams";
import { getUser } from "@/utilities/getUser";
import { mergeOpenGraph } from "@/utilities/mergeOpenGraph";

export default async function CreateAccount() {
  const user = await getUser();

  if (user) {
    redirect(
      `/account?warning=${encodeURIComponent("You are already logged in.")}`,
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-80px)] items-center justify-center bg-background">
      <div className="w-full max-w-2xl">
        <Suspense fallback={null}>
          <RenderParams />
        </Suspense>
        <CreateAccountForm />
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  description: "Create an account or log in to your existing account.",
  openGraph: mergeOpenGraph({
    title: "Create Account",
    url: "/create-account",
  }),
  title: "Create Account",
};
