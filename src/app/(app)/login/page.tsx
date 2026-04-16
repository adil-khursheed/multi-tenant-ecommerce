import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/forms/LoginForm";
import { RenderParams } from "@/components/RenderParams";
import { getUser } from "@/utilities/getUser";

export default async function Login() {
  const user = await getUser();

  if (user) {
    redirect(
      `/account?warning=${encodeURIComponent("You are already logged in.")}`,
    );
  }

  return (
    <div className="container flex min-h-[calc(100dvh-80px)]">
      {/* Left Hero Panel */}
      <div className="relative hidden flex-1 overflow-hidden lg:flex lg:flex-col lg:justify-end">
        <Image
          src="/images/login-hero.png"
          alt="Luxurious Indian heritage silk saree with intricate gold zari brocade"
          fill
          className="absolute inset-0 h-full w-full object-cover object-center"
          priority
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-linear-to-t from-[rgba(28,28,25,0.85)] via-[rgba(28,28,25,0.4)] via-70% to-transparent" />
        <div className="relative z-10 flex flex-col p-12 text-muted">
          <h2 className="mb-3 font-serif text-[2.5rem] font-light tracking-[0.25em]">
            VASTRA
          </h2>
          <p className="mb-6 font-serif text-xl font-light italic opacity-90">
            Where every weave has a name.
          </p>
          <p className="font-sans text-[0.65rem] font-medium uppercase tracking-[0.2em] opacity-70">
            200+ Artisan Vendors · Handcrafted in India
          </p>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex flex-1 items-center justify-center bg-background lg:w-1/2 lg:max-w-[640px] lg:flex-none">
        <Suspense fallback={null}>
          <RenderParams />
        </Suspense>
        <LoginForm />
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  description: "Login or create an account to get started.",
  openGraph: {
    title: "Login",
    url: "/login",
  },
  title: "Login",
};
