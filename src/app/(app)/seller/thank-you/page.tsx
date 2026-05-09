import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  ArrowRight01Icon,
  EyeIcon,
  HelpCircleIcon,
  MailReceive01Icon,
  Megaphone01Icon,
  QuoteUpIcon,
  SearchIcon,
  SecurityCheckIcon,
  Store01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { buttonVariants } from "@/components/ui/button";
import { env } from "@/env";
import { cn } from "@/utilities/cn";
import { getPopulatedTenants } from "@/utilities/getPopulatedTenants";
import { getUser } from "@/utilities/getUser";

export const metadata: Metadata = {
  title: "Application Received | Seller Onboarding",
  description: "Your application is being reviewed by our editorial team.",
};

export default async function ThankYouPage() {
  const user = await getUser();

  if (!user || (user.roles && !user.roles.includes("vendor"))) redirect("/");

  const { hasActiveTenant, pendingTenant } = await getPopulatedTenants(user);

  if (hasActiveTenant) redirect("/admin");
  if (!pendingTenant) redirect("/create-account/seller");

  const { COMPANY_NAME } = env;

  return (
    <section className="relative min-h-screen overflow-hidden bg-background font-sans selection:bg-primary/10 selection:text-primary">
      {/* Micro-pattern Background Overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `radial-gradient(var(--primary) 0.5px, transparent 0.5px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative mx-auto max-w-3xl px-4 md:px-6 py-16 md:py-24">
        {/* 1. Hero Section */}
        <section className="flex flex-col items-center text-center">
          <div className="relative mb-10 size-32 overflow-hidden rounded-full border-4 border-card shadow-2xl md:size-44">
            <Image
              src="/images/seller-onboarded-hero.webp"
              alt="Artisan at work"
              fill
              className="object-cover"
              priority
            />
          </div>

          <h1 className="mb-6 font-serif text-4xl leading-[1.1] text-foreground md:text-5xl lg:text-6xl">
            Your craft is in good hands.
          </h1>

          <p className="mb-10 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Thank you,{" "}
            <span className="text-primary font-medium">
              {pendingTenant.storeName}
            </span>
            . Your application has been received and our editorial team is
            excited to explore your portfolio.
          </p>

          <div className="inline-flex items-center gap-2.5 rounded-full bg-secondary/20 px-5 py-2.5 text-sm font-semibold text-secondary-foreground border border-secondary/30 shadow-sm">
            <HugeiconsIcon icon={MailReceive01Icon} size={18} strokeWidth={2} />
            <span>Confirmation sent to {pendingTenant.email}</span>
          </div>
        </section>

        {/* 2. Status Timeline */}
        <section className="relative my-20 md:my-32">
          {/* Vertical Line */}
          <div className="absolute left-4 top-0 h-full w-px bg-border md:left-1/2 md:-translate-x-1/2" />

          <div className="space-y-16 md:space-y-24">
            {/* Step 1: Completed */}
            <div className="relative flex items-start gap-8 md:justify-center md:gap-0">
              <div className="z-10 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_20px_rgba(var(--primary),0.3)] md:absolute md:left-1/2 md:-translate-x-1/2">
                <HugeiconsIcon icon={Tick02Icon} size={18} strokeWidth={3} />
              </div>
              <div className="md:w-1/2 md:pr-16 md:text-right">
                <h3 className="text-xl font-bold text-foreground">
                  Application Submitted
                </h3>
                <p className="mt-1 text-base text-muted-foreground">
                  Details & portfolio received
                </p>
              </div>
              <div className="hidden md:block md:w-1/2 md:pl-16" />
            </div>

            {/* Step 2: Active (Under Review) */}
            <div className="relative flex items-start gap-8 md:justify-center md:gap-0">
              <div className="z-10 flex size-9 shrink-0 items-center justify-center rounded-full bg-card shadow-xl md:absolute md:left-1/2 md:-translate-x-1/2">
                {/* Spinning Dashed Border */}
                <div className="absolute -inset-1 animate-[spin_6s_linear_infinite] rounded-full border-2 border-dashed border-primary/40" />
                <HugeiconsIcon
                  icon={SearchIcon}
                  size={18}
                  strokeWidth={2}
                  className="text-primary"
                />
              </div>
              <div className="hidden md:block md:w-1/2 md:pr-16" />
              <div className="md:w-1/2 md:pl-16">
                <h3 className="text-xl font-bold text-foreground">
                  Under Review
                </h3>
                <p className="mt-1 text-base text-muted-foreground">
                  Our curators are evaluating your story
                </p>
              </div>
            </div>

            {/* Step 3: Future (Shop Approved) */}
            <div className="relative flex items-start gap-8 md:justify-center md:gap-0 opacity-40 grayscale-[0.5]">
              <div className="z-10 flex size-9 shrink-0 items-center justify-center rounded-full bg-muted shadow-inner md:absolute md:left-1/2 md:-translate-x-1/2">
                <HugeiconsIcon
                  icon={Store01Icon}
                  size={18}
                  strokeWidth={2}
                  className="text-muted-foreground"
                />
              </div>
              <div className="md:w-1/2 md:pr-16 md:text-right">
                <h3 className="text-xl font-bold text-foreground">
                  Shop Approved
                </h3>
                <p className="mt-1 text-base text-muted-foreground">
                  Launch your brand on {COMPANY_NAME}
                </p>
              </div>
              <div className="hidden md:block md:w-1/2 md:pl-16" />
            </div>
          </div>
        </section>

        {/* 3. What Happens Next Panel */}
        <section className="mb-16 overflow-hidden border border-muted bg-muted p-8 md:p-12">
          <h2 className="mb-10 font-serif text-3xl text-foreground">
            What happens next?
          </h2>
          <div className="grid gap-10 md:gap-12">
            <div className="flex gap-6">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-card text-secondary-foreground shadow-sm ring-1 ring-secondary/10">
                <HugeiconsIcon icon={EyeIcon} size={24} strokeWidth={2} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-foreground">
                  Profile Review
                </h4>
                <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                  Our curation team evaluates your submitted portfolio and brand
                  story to ensure alignment with our heirloom aesthetic. Expect
                  an update within 3-5 business days.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-card text-secondary-foreground shadow-sm ring-1 ring-secondary/10">
                <HugeiconsIcon
                  icon={SecurityCheckIcon}
                  size={24}
                  strokeWidth={2}
                />
              </div>
              <div>
                <h4 className="text-lg font-bold text-foreground">
                  Trust & Verification
                </h4>
                <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                  Once aesthetically approved, we will request standard business
                  verification documents to set up your secure payment gateway.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-card text-secondary-foreground shadow-sm ring-1 ring-secondary/10">
                <HugeiconsIcon
                  icon={Megaphone01Icon}
                  size={24}
                  strokeWidth={2}
                />
              </div>
              <div>
                <h4 className="text-lg font-bold text-foreground">
                  Shop Go Live
                </h4>
                <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                  You will gain access to your Artisan Dashboard to begin
                  listing your products. Our editorial team will help polish
                  your first listings.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Personal Quote Section */}
        <section className="mb-20">
          <div className="relative overflow-hidden bg-card p-10 shadow-xl md:p-16">
            <div className="absolute left-0 top-0 h-1.5 w-full bg-linear-to-r from-primary/80 via-primary to-primary/40" />
            <HugeiconsIcon
              icon={QuoteUpIcon}
              size={48}
              strokeWidth={1}
              className="mb-8 text-primary/20"
            />
            <blockquote className="mb-10 font-serif text-2xl italic leading-relaxed text-foreground md:text-3xl">
              &quot;Every artisan has a story that deserves to be told with
              dignity and beauty. We are honored that you chose us to be part of
              your journey.&quot;
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="h-px w-12 bg-primary/20" />
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">
                The Editorial Team
              </p>
            </div>
          </div>
        </section>

        {/* 5. Actions & Social Proof */}
        <section className="flex flex-col items-center gap-16 text-center">
          <div className="flex w-full flex-col gap-5 md:flex-row md:justify-center">
            <Link
              href="/"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 text-lg px-6",
              )}
            >
              Explore as Shopper
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={20}
                strokeWidth={2}
                className="transition-transform group-hover:translate-x-1.5"
              />
            </Link>
          </div>

          {/* <div className="flex w-full flex-wrap items-center justify-center gap-x-10 gap-y-6 border-t border-border pt-12 md:gap-x-16">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                2.5k+
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Active Artisans
              </span>
            </div>
            <div className="hidden h-10 w-px bg-border md:block" />
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                18+
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Craft Regions
              </span>
            </div>
            <div className="hidden h-10 w-px bg-border md:block" />
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                10k+
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Global Patrons
              </span>
            </div>
          </div> */}

          <Link
            href={`mailto:${env.NEXT_PUBLIC_SUPPORT_EMAIL}`}
            className="group flex items-center gap-2.5 text-base font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <HugeiconsIcon
              icon={HelpCircleIcon}
              size={20}
              strokeWidth={2}
              className="transition-transform group-hover:rotate-12"
            />
            Need help? Contact our support
          </Link>
        </section>
      </div>
    </section>
  );
}
