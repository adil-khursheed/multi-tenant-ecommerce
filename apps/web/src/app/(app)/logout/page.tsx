import React from "react";
import type { Metadata } from "next";

import { mergeOpenGraph } from "@/utilities/mergeOpenGraph";
import { noIndexRobots } from "@/utilities/seo";
import { LogoutPage } from "./LogoutPage";

export default async function Logout() {
  return (
    <div className="container max-w-lg my-16">
      <LogoutPage />
    </div>
  );
}

export const metadata: Metadata = {
  description: "You have been logged out.",
  openGraph: mergeOpenGraph({
    title: "Logout",
    url: "/logout",
  }),
  robots: noIndexRobots,
  title: "Logout",
};
