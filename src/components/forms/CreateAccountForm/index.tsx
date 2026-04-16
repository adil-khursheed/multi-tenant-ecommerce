"use client";

import React, { Activity, useCallback, useState } from "react";
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

import ArtisanIcon from "@/components/icons/artisan";
import { Message } from "@/components/Message";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup } from "@/components/ui/field";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePhoneVerification } from "@/hooks/usePhoneVerification";
import { useAuth } from "@/providers/Auth";
import { cn } from "@/utilities/cn";
import AddressForm from "./address-form";
import BankAccountInfoForm from "./bank-account-info-form";
import BusinessInfoForm from "./business-info-form";
import {
  addressSchema,
  bankAccountSchema,
  businessInfoSchema,
  createAccountSchema,
  personalInfoSchema,
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
  const [activeStep, setActiveStep] = useState(0);
  const steps = [
    { name: "personalInfo", schema: personalInfoSchema },
    { name: "businessInfo", schema: businessInfoSchema },
    { name: "address", schema: addressSchema },
    { name: "bankAccount", schema: bankAccountSchema },
  ] as const;

  const currentStep = steps[activeStep].name;

  const [error, setError] = useState<null | string>(null);

  const searchParams = useSearchParams();
  const allParams = searchParams.toString()
    ? `?${searchParams.toString()}`
    : "";

  const { login } = useAuth();

  const router = useRouter();

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
    businessName: "",
    businessType: "",
    storeName: "",
    storeSlug: "",
    storeLogo: "",
    panNumber: "",
    isGST: false,
    gst: "",
    country: {
      name: "",
      isoCode: "",
    },
    state: {
      name: "",
      isoCode: "",
    },
    city: "",
    addressLine1: "",
    addressLine2: "",
    pincode: "",
    bankAccountNumber: "",
    bankIfscCode: "",
    bankName: "",
    bankBranch: "",
    bankAccountHolderName: "",
    bankAccountType: "savings",
  };

  const {
    control,
    watch,
    trigger,
    reset,
    setValue,
    formState: { isSubmitting, errors },
    handleSubmit,
  } = useForm<CreateAccountFormData>({
    resolver: zodResolver(createAccountSchema),
    defaultValues,
  });

  const watchedAccountType = watch("accountType");

  const { reset: resetPhoneVerification } = usePhoneVerification();

  const onSubmit = useCallback(
    async (data: CreateAccountFormData) => {
      // try {
      //   setError(null);

      //   const response = await fetch(
      //     `${env.NEXT_PUBLIC_SERVER_URL}/api/users`,
      //     {
      //       body: JSON.stringify(data),
      //       headers: {
      //         "Content-Type": "application/json",
      //       },
      //       method: "POST",
      //     },
      //   );

      //   if (!response.ok) {
      //     const message =
      //       response.statusText || "There was an error creating the account.";
      //     setError(message);
      //     return;
      //   }

      //   const redirect = searchParams.get("redirect");

      //   await login(data);
      //   if (redirect) router.push(redirect);
      //   else
      //     router.push(
      //       `/account?success=${encodeURIComponent("Account created successfully")}`,
      //     );
      // } catch (_) {
      //   setError(
      //     "There was an error with the credentials provided. Please try again.",
      //   );
      // }

      console.log(data);
    },
    [login, router, searchParams],
  );

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
                            setActiveStep(0);
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

              <Activity
                mode={currentStep === "personalInfo" ? "visible" : "hidden"}
              >
                <PersonalInfoForm
                  control={control}
                  setValue={setValue}
                  watch={watch}
                />
              </Activity>

              <Activity
                mode={
                  watchedAccountType === "vendor" &&
                  currentStep === "businessInfo"
                    ? "visible"
                    : "hidden"
                }
              >
                <BusinessInfoForm
                  control={control}
                  setValue={setValue}
                  watch={watch}
                />
              </Activity>

              <Activity
                mode={
                  watchedAccountType === "vendor" && currentStep === "address"
                    ? "visible"
                    : "hidden"
                }
              >
                <AddressForm
                  control={control}
                  watch={watch}
                  setValue={setValue}
                />
              </Activity>

              <Activity
                mode={
                  watchedAccountType === "vendor" &&
                  currentStep === "bankAccount"
                    ? "visible"
                    : "hidden"
                }
              >
                <BankAccountInfoForm control={control} />
              </Activity>

              <Field orientation={"horizontal"} className="gap-6">
                {watchedAccountType === "vendor" && activeStep > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-12 flex-1 text-xs font-semibold uppercase tracking-[0.2em]"
                    size="lg"
                    onClick={() => setActiveStep((i) => i - 1)}
                  >
                    Back
                  </Button>
                )}

                {watchedAccountType === "vendor" &&
                  activeStep < steps.length - 1 && (
                    <Button
                      type="button"
                      className="h-12 flex-1 w-full text-xs font-semibold uppercase tracking-[0.2em]"
                      size="lg"
                      onClick={async () => {
                        const currentFields = Object.keys(
                          steps[activeStep].schema.shape,
                        ) as Array<keyof CreateAccountFormData>;

                        const valid = await trigger(currentFields);
                        if (!valid) return;
                        setActiveStep((i) => i + 1);
                      }}
                    >
                      Save & Next
                    </Button>
                  )}

                {watchedAccountType === "customer" ||
                (watchedAccountType === "vendor" &&
                  activeStep === steps.length - 1) ? (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-12 flex-1 text-xs font-semibold uppercase tracking-[0.2em]"
                    size="lg"
                  >
                    {isSubmitting ? <Spinner /> : "Create My Account"}
                  </Button>
                ) : null}
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
