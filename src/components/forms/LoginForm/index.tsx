"use client";

import React, { useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";

import { Message } from "@/components/Message";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/providers/Auth";
import { loginSchema, type LoginFormData } from "./loginSchema";

export const LoginForm: React.FC = () => {
  const searchParams = useSearchParams();
  const allParams = searchParams.toString()
    ? `?${searchParams.toString()}`
    : "";
  const redirect = useRef(searchParams.get("redirect"));
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = React.useState<null | string>(null);

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = useCallback(
    async (data: LoginFormData) => {
      try {
        setError(null);
        await login(data);
        if (redirect?.current) router.push(redirect.current);
        else router.push("/account");
      } catch (_) {
        setError(
          "There was an error with the credentials provided. Please try again.",
        );
      }
    },
    [login, router],
  );

  return (
    <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 xl:px-24">
      <div className="mx-auto w-full max-w-md">
        {/* Header */}
        <div className="mb-10">
          <p className="mb-3 font-sans text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Welcome back
          </p>
          <h1 className="font-serif text-3xl font-light tracking-tight text-foreground sm:text-4xl">
            Sign in to your wardrobe.
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href={`/create-account${allParams}`}
              className="font-medium text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline"
            >
              Create one &rarr;
            </Link>
          </p>
        </div>

        <Separator className="mb-8" />

        {/* Error Message */}
        {error && <Message className="mb-6" error={error} />}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-6">
            <Field>
              <FieldLabel className="font-sans text-xs font-medium uppercase tracking-[0.15em]">
                Email Address
              </FieldLabel>
              <Input
                id="login-email"
                type="email"
                placeholder="name@example.com"
                className="h-12 border-border/60 bg-transparent font-sans text-sm transition-colors focus:border-primary"
                {...register("email")}
              />
              {errors.email && <FieldError>{errors.email.message}</FieldError>}
            </Field>

            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel className="font-sans text-xs font-medium uppercase tracking-[0.15em]">
                  Password
                </FieldLabel>
                <Link
                  href={`/forgot-password${allParams}`}
                  className="font-sans text-[0.65rem] font-medium uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:text-primary"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="login-password"
                type="password"
                placeholder="••••••••"
                className="h-12 border-border/60 bg-transparent font-sans text-sm transition-colors focus:border-primary"
                {...register("password")}
              />
              {errors.password && (
                <FieldError>{errors.password.message}</FieldError>
              )}
            </Field>

            {/* Sign In Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 h-12 w-full text-xs font-semibold uppercase tracking-[0.2em]"
              size="lg"
            >
              {isSubmitting ? <Spinner /> : "Sign In"}
            </Button>
          </div>

          {/* OR Separator */}
          <div className="my-8">
            <FieldSeparator>or</FieldSeparator>
          </div>

          {/* Social / Alternative Login */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              // disabled
              className="h-12 flex-1 text-xs uppercase tracking-[0.15em]"
              title="Coming soon"
            >
              Google
            </Button>
            <Button
              type="button"
              variant="outline"
              // disabled
              className="h-12 flex-1 text-xs uppercase tracking-[0.15em]"
              title="Coming soon"
            >
              OTP
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
