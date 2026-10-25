import type { Metadata } from "next";
import { redirect } from "next/navigation";

import VerifyEmailForm from "@/components/VerifyEmail";
import { noIndexRobots } from "@/utilities/seo";

export const metadata: Metadata = {
  description: "Verify the email address on your DTlea account.",
  robots: noIndexRobots,
  title: "Verify Email",
};

const VerifyEmailPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const token = (await searchParams).token;
  if (!token) {
    redirect(
      "/login?error=A verification token is required to verify your email.",
    );
  }

  return (
    <section className="container flex min-h-[calc(100dvh-80px)] items-center justify-center">
      <VerifyEmailForm />
    </section>
  );
};

export default VerifyEmailPage;
