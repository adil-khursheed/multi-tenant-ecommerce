import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AccountForm } from "@/components/forms/AccountForm";
import RecentOrders, {
  RecentOrdersSkeleton,
} from "@/components/Orders/RecentOrders";
import { HydrateClient, prefetch, trpc } from "@/trpc/server";
import { getUser } from "@/utilities/getUser";
import { mergeOpenGraph } from "@/utilities/mergeOpenGraph";

export default async function AccountPage() {
  const user = await getUser();

  if (!user) {
    redirect(
      `/login?warning=${encodeURIComponent("Please login to access your account settings.")}`,
    );
  }

  void prefetch(trpc.orders.list.queryOptions());

  return (
    <>
      <div className="border p-8 rounded-lg bg-primary-foreground">
        <h1 className="text-3xl font-medium mb-8">Account settings</h1>
        <AccountForm />
      </div>

      <HydrateClient>
        <ErrorBoundary fallback={<div>Something went wrong!</div>}>
          <Suspense fallback={<RecentOrdersSkeleton />}>
            <RecentOrders />
          </Suspense>
        </ErrorBoundary>
      </HydrateClient>
    </>
  );
}

export const metadata: Metadata = {
  description: "Create an account or log in to your existing account.",
  openGraph: mergeOpenGraph({
    title: "Account",
    url: "/account",
  }),
  title: "Account",
};
