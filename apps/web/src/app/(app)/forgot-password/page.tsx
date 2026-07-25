import React from "react";
import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/components/forms/ForgotPasswordForm";
import { mergeOpenGraph } from "@/utilities/mergeOpenGraph";

export default async function ForgotPasswordPage() {
  return (
    <div className="container py-16">
      <ForgotPasswordForm />
    </div>
  );
}

export const metadata: Metadata = {
  description: "Enter your email address to recover your password.",
  openGraph: mergeOpenGraph({
    title: "Forgot Password",
    url: "/forgot-password",
  }),
  title: "Forgot Password",
};
