"use client";

import React, { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  LockPasswordIcon,
  Mail,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation } from "@tanstack/react-query";

import { Message } from "@/components/Message";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Tenant } from "@/payload-types";
import { useTRPC } from "@/trpc/client";
import { loginSchema, type LoginFormData } from "./loginSchema";

export const LoginForm: React.FC = () => {
  const [togglePassword, setTogglePassword] = useState(false);
  const [error, setError] = useState<null | string>(null);

  const searchParams = useSearchParams();
  const allParams = searchParams.toString()
    ? `?${searchParams.toString()}`
    : "";
  const redirect = useRef(searchParams.get("redirect"));

  const router = useRouter();

  const trpc = useTRPC();

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    control,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutateAsync: login } = useMutation(
    trpc.auth.login.mutationOptions({
      onSuccess: (data) => {
        if (redirect?.current) router.push(redirect.current);
        else if (
          (data.data?.roles?.includes("vendor") &&
            data.data.tenants?.some(
              (tenant) => (tenant.tenant as Tenant)?.isTenantActive,
            )) ||
          data.data?.roles?.includes("admin")
        )
          router.push("/admin");
        else router.push("/account");
      },
      onError: () => {
        setError(
          "There was an error with the credentials provided. Please try again.",
        );
      },
    }),
  );

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    await login(data);
  };

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
          <FieldGroup className="gap-6">
            <Controller
              control={control}
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    required
                    className="text-xs uppercase tracking-[0.15em]"
                  >
                    Email Address
                  </FieldLabel>
                  <InputGroup
                    aria-invalid={fieldState.invalid}
                    className="h-12"
                  >
                    <InputGroupInput
                      {...field}
                      id="signup-email"
                      type="email"
                      placeholder="arjun@editorial.com"
                    />
                    <InputGroupAddon align={"inline-start"}>
                      <HugeiconsIcon icon={Mail} />
                    </InputGroupAddon>
                  </InputGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel
                    required
                    className="text-xs uppercase tracking-[0.15em]"
                  >
                    Create Password
                  </FieldLabel>
                  <InputGroup
                    aria-invalid={fieldState.invalid}
                    className="h-12"
                  >
                    <InputGroupInput
                      {...field}
                      id="signup-password"
                      type={togglePassword ? "text" : "password"}
                      placeholder="••••••••"
                    />
                    <InputGroupAddon align={"inline-start"}>
                      <HugeiconsIcon icon={LockPasswordIcon} />
                    </InputGroupAddon>
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        aria-label="Show Password"
                        title="Show Password"
                        size="icon-xs"
                        onClick={() => setTogglePassword((prev) => !prev)}
                      >
                        {togglePassword ? (
                          <HugeiconsIcon icon={EyeOff} />
                        ) : (
                          <HugeiconsIcon icon={Eye} />
                        )}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* Sign In Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 h-12 w-full text-xs font-semibold uppercase tracking-[0.2em]"
              size="lg"
            >
              {isSubmitting ? <Spinner /> : "Sign In"}
            </Button>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
};
