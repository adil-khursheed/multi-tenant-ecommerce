"use client";

import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Leaf01Icon,
  ShoppingBasket01Icon,
  StarIcon,
  UserLock01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, IconSvgElement } from "@hugeicons/react";
import { useMutation } from "@tanstack/react-query";

import ArtisanIcon from "@/components/icons/artisan";
import { Message } from "@/components/Message";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePhoneVerification } from "@/hooks/usePhoneVerification";
import { useTRPC } from "@/trpc/client";
import { cn } from "@/utilities/cn";
import {
  createAccountSchema,
  type CreateAccountFormData,
} from "./createAccountSchema";
import PersonalInfoForm from "./personal-info-form";

const accountTypes = [
  {
    id: "customer",
    label: "Shopper",
    description:
      "Shop for unique, handcrafted items from artisans around the world.",
    icon: (
      <HugeiconsIcon
        icon={ShoppingBasket01Icon}
        className="size-6 text-primary"
      />
    ),
  },
  {
    id: "vendor",
    label: "Artisan / Vendor",
    description:
      "Share your craft with the world and build your brand on a global stage.",
    icon: <ArtisanIcon className="size-6 text-primary" />,
  },
];

export const CreateAccountForm: React.FC = () => {
  const [error, setError] = useState<null | string>(null);

  const searchParams = useSearchParams();
  const allParams = searchParams.toString()
    ? `?${searchParams.toString()}`
    : "";

  const router = useRouter();

  const trpc = useTRPC();

  const registrationMutation = useMutation(
    trpc.auth.register.mutationOptions({
      onSuccess: () => {
        router.push(
          `/login?success=${encodeURIComponent("Please verify your email to login with the verification link sent to your inbox")}`,
        );
      },
      onError: (error) => {
        setError(error.message);
      },
    }),
  );

  const defaultValues: CreateAccountFormData = {
    accountType: "customer",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    otp: "",
    isPhoneVerified: false,
    password: "",
    passwordConfirm: "",
  };

  const {
    control,
    watch,
    reset,
    setValue,
    formState: { isSubmitting, errors },
    handleSubmit,
  } = useForm<CreateAccountFormData>({
    resolver: zodResolver(createAccountSchema),
    defaultValues,
  });

  const { reset: resetPhoneVerification } = usePhoneVerification();

  const onSubmit = async (data: CreateAccountFormData) => {
    setError(null);
    await registrationMutation.mutateAsync(data);
  };

  return (
    <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
      <div className="w-full">
        {/* Header */}
        <div className="mb-10">
          <p className="mb-3 text-xs uppercase tracking-[2.75px] text-primary">
            JOIN THE COMMUNITY
          </p>
          <h1 className="font-serif text-sub-heading leading-heading tracking-tight text-foreground sm:text-heading">
            Dress in stories.
            <br />
            Join DTlea.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Become part of a movement that bridges ancient heritage with
            contemporary life. Support the hands that weave the future of
            fashion.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Already a member?{" "}
            <Link
              href={`/login${allParams}`}
              className="font-medium text-primary underline-offset-4 transition-colors hover:text-primary/80 hover:underline"
            >
              Sign in &rarr;
            </Link>
          </p>
        </div>

        <Separator className="mb-8" />

        {/* Error Message */}
        {error && <Message className="mb-6" error={error} />}

        {/* Form */}
        <Tabs>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup className="gap-6">
              <Controller
                control={control}
                name="accountType"
                render={({ field }) => (
                  <Field className="">
                    <TabsList
                      className={"w-full group-data-horizontal/tabs:h-32"}
                    >
                      {accountTypes.map((accountType) => (
                        <TabsTrigger
                          key={accountType.id}
                          value={accountType.id}
                          disabled={isSubmitting}
                          className={cn(
                            "flex flex-col items-center gap-3 whitespace-normal overflow-hidden",
                            field.value === accountType.id &&
                              "border-2 border-primary text-primary",
                          )}
                          onClick={() => {
                            field.onChange(accountType.id);
                            reset(
                              {
                                ...defaultValues,
                                accountType: accountType.id,
                              } as CreateAccountFormData,
                              { keepDirtyValues: false },
                            );
                            resetPhoneVerification();
                          }}
                          aria-selected={field.value === accountType.id}
                        >
                          {accountType.icon}
                          <span className="text-[10px] uppercase tracking-[1.5px] font-bold text-primary">
                            {accountType.label}
                          </span>
                          <span className="min-w-0 w-full text-wrap wrap-break-word text-[10px] italic text-muted-foreground">
                            {accountType.description}
                          </span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Field>
                )}
              />

              <PersonalInfoForm
                control={control}
                setValue={setValue}
                watch={watch}
              />

              <Field orientation={"horizontal"} className="gap-6">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-12 flex-1 text-xs font-semibold uppercase tracking-[0.2em]"
                  size="lg"
                >
                  {isSubmitting ? <Spinner /> : "Create My Account"}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </Tabs>

        {/* Trust Badges */}
        <div className="mt-12 flex items-center justify-center gap-4 text-[0.6rem] font-medium uppercase tracking-[0.15em] text-muted-foreground">
          <TrustBadge icon={UserLock01Icon} label="Secure &amp; Private" />
          <span className="text-border">·</span>
          <TrustBadge icon={Leaf01Icon} label="Ethical Sourcing" />
          <span className="text-border">·</span>
          <TrustBadge icon={StarIcon} label="Artisan Verified" />
        </div>
      </div>
    </div>
  );
};

function TrustBadge({ icon, label }: { icon: IconSvgElement; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 flex-1">
      <HugeiconsIcon icon={icon} className="size-4" />
      <span>{label}</span>
    </div>
  );
}
