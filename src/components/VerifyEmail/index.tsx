"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";

import { useTRPC } from "@/trpc/client";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";

const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

type VerifyEmailSchema = z.infer<typeof verifyEmailSchema>;

const VerifyEmailForm = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const form = useForm<VerifyEmailSchema>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      token: token || "",
    },
  });

  const trpc = useTRPC();

  const router = useRouter();

  const { mutateAsync: verifyEmail, isPending: isVerifyingEmail } = useMutation(
    trpc.auth.verifyEmail.mutationOptions({
      onSuccess: () => {
        form.reset();
        toast.success("Email verified successfully", {
          description: "You can now login with your email and password.",
        });
        router.replace("/login");
      },
      onError: (error) => {
        form.setError("token", {
          message: error.message,
        });
        toast.error("Failed to verify email", {
          description: error.message,
        });
      },
    }),
  );

  const handleVerifyEmail = (data: VerifyEmailSchema) => {
    verifyEmail(data);
  };

  useEffect(() => {
    if (token && !isVerifyingEmail) {
      form.handleSubmit(handleVerifyEmail)();
    }
  }, []);

  if (isVerifyingEmail) {
    return (
      <div className="flex flex-col items-center gap-4">
        <Spinner className="size-10 text-primary" />
        <p className="text-center text-sm font-medium text-muted-foreground md:text-base">
          Please wait while we verify your email...
        </p>
      </div>
    );
  }

  if (form.formState.errors.token) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-center text-sm font-medium text-destructive md:text-base">
          {form.formState.errors.token.message}
        </p>
        <form onSubmit={form.handleSubmit(handleVerifyEmail)}>
          <Button type="submit" disabled={isVerifyingEmail} size={"lg"}>
            {isVerifyingEmail ? <Spinner /> : "Try Again"}
          </Button>
        </form>
      </div>
    );
  }

  return null;
};

export default VerifyEmailForm;
