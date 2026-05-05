"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  BankIcon,
  CheckmarkCircle01Icon,
  Location01Icon,
  Store01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { useMutation } from "@tanstack/react-query";

import { Message } from "@/components/Message";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useTRPC } from "@/trpc/client";
import { cn } from "@/utilities/cn";
import AddressForm from "./address-form";
import BankAccountInfoForm from "./bank-account-info-form";
import BusinessInfoForm from "./business-info-form";
import ReviewStep from "./review-step";
import {
  addressSchema,
  bankAccountSchema,
  businessInfoSchema,
  VendorOnboardingFormData,
  vendorOnboardingSchema,
} from "./vendor-onboarding-schema";

/* ---------- Step configuration ---------- */

interface StepConfig {
  id: string;
  label: string;
  stepLabel: string;
  icon: IconSvgElement;
  heading: string;
  description: string;
  fields: string[];
}

const steps: StepConfig[] = [
  {
    id: "business",
    label: "Business Profile",
    stepLabel: "Step 01",
    icon: Store01Icon,
    heading: "Business Identity",
    description:
      "Tell us about your business, store, and tax registration details.",
    fields: Object.keys(businessInfoSchema.shape),
  },
  {
    id: "address",
    label: "Store Address",
    stepLabel: "Step 02",
    icon: Location01Icon,
    heading: "Store Address",
    description: "Where is your workshop or store located?",
    fields: Object.keys(addressSchema.shape),
  },
  {
    id: "payment",
    label: "Payment Info",
    stepLabel: "Step 03",
    icon: BankIcon,
    heading: "Payment Information",
    description: "Set up your bank account for receiving payments.",
    fields: Object.keys(bankAccountSchema.shape),
  },
  {
    id: "review",
    label: "Review",
    stepLabel: "Step 04",
    icon: CheckmarkCircle01Icon,
    heading: "Review & Submit",
    description: "Review all your information before submitting.",
    fields: [],
  },
];

/* ---------- Component ---------- */

const VendorMultiStepForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const trpc = useTRPC();

  const registrationMutation = useMutation(
    trpc.auth.register.mutationOptions({
      onSuccess: () => {
        router.push(
          `/login?success=${encodeURIComponent("Your vendor application has been submitted. Please check your email for further instructions.")}`,
        );
      },
      onError: (err) => {
        setError(err.message);
      },
    }),
  );

  const {
    control,
    watch,
    setValue,
    getValues,
    trigger,
    formState: { isSubmitting },
    handleSubmit,
  } = useForm<VendorOnboardingFormData>({
    resolver: zodResolver(vendorOnboardingSchema),
    defaultValues: {
      businessName: "",
      businessType: "",
      storeName: "",
      storeSlug: "",
      storeLogo: "",
      panNumber: "",
      isGST: false,
      gst: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: { name: "", isoCode: "" },
      country: { name: "", isoCode: "" },
      pincode: "",
      bankAccountNumber: "",
      bankIfscCode: "",
      bankName: "",
      bankBranch: "",
      bankAccountHolderName: "",
      bankAccountType: "savings",
    },
  });

  const currentStep = steps[activeStep];

  const handleNext = async () => {
    if (activeStep >= steps.length - 1) return;

    const currentFields = steps[activeStep]
      .fields as (keyof VendorOnboardingFormData)[];

    if (currentFields.length > 0) {
      const valid = await trigger(currentFields);
      if (!valid) return;
    }

    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (activeStep <= 0) return;
    setActiveStep((prev) => prev - 1);
  };

  const onSubmit = async (data: VendorOnboardingFormData) => {
    setError(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await registrationMutation.mutateAsync({
      ...data,
      accountType: "vendor",
    } as any);
  };

  return (
    <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-start gap-8 px-4 py-8 sm:px-6 md:px-8 lg:flex-row lg:gap-16 lg:py-16 xl:gap-24">
      {/* ──────────── Left Sidebar: Progress Tracker ──────────── */}
      <aside className="w-full shrink-0 lg:sticky lg:top-32 lg:w-1/4">
        <h1 className="mb-2 font-serif text-3xl leading-tight text-foreground lg:text-4xl xl:text-5xl">
          Vendor
          <br className="hidden lg:block" />
          <span className="lg:hidden"> </span>
          Onboarding
        </h1>
        <p className="mb-6 text-sm text-muted-foreground lg:mb-12">
          Step {activeStep + 1} of {steps.length}
        </p>

        {/* Mobile / Tablet: horizontal compact progress bar */}
        <div className="mb-6 flex items-center gap-2 lg:hidden">
          {steps.map((step, index) => (
            <button
              key={step.id}
              type="button"
              className={cn(
                "flex h-1.5 flex-1 rounded-full transition-all duration-300",
                index < activeStep && "bg-primary",
                index === activeStep && "bg-primary",
                index > activeStep && "bg-border",
              )}
              onClick={() => {
                if (index < activeStep) setActiveStep(index);
              }}
              aria-label={`Go to ${step.label}`}
            />
          ))}
        </div>

        {/* Mobile: current step label */}
        <div className="mb-2 flex items-center gap-3 lg:hidden">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
            <HugeiconsIcon icon={currentStep.icon} className="size-4" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.15em] text-primary">
              {currentStep.stepLabel}
            </p>
            <p className="font-serif text-lg text-foreground">
              {currentStep.label}
            </p>
          </div>
        </div>

        {/* Desktop: vertical step navigator */}
        <nav className="hidden flex-col gap-6 lg:flex">
          {steps.map((step, index) => {
            const isActive = index === activeStep;
            const isCompleted = index < activeStep;
            const isLast = index === steps.length - 1;

            return (
              <button
                key={step.id}
                type="button"
                className={cn(
                  "flex items-start gap-4 text-left transition-opacity",
                  !isActive && !isCompleted && "opacity-50 hover:opacity-75",
                  isCompleted && "cursor-pointer",
                )}
                onClick={() => {
                  if (isCompleted) setActiveStep(index);
                }}
                disabled={!isCompleted && !isActive}
              >
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "relative z-10 flex size-8 items-center justify-center rounded-full transition-colors",
                      isActive &&
                        "bg-primary text-primary-foreground shadow-sm",
                      isCompleted &&
                        "border border-primary/30 bg-primary/10 text-primary",
                      !isActive &&
                        !isCompleted &&
                        "border border-border bg-card text-muted-foreground",
                    )}
                  >
                    <HugeiconsIcon icon={step.icon} className="size-4" />
                  </div>
                  {!isLast && (
                    <div
                      className={cn(
                        "my-2 h-12 w-px",
                        isCompleted ? "bg-primary/30" : "bg-border/40",
                      )}
                    />
                  )}
                </div>
                <div className="pt-0.5">
                  <p
                    className={cn(
                      "mb-1 text-xs font-medium uppercase tracking-[0.15em]",
                      isActive ? "text-primary" : "text-muted-foreground",
                    )}
                  >
                    {step.stepLabel}
                  </p>
                  <p className="font-serif text-lg text-foreground xl:text-xl">
                    {step.label}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ──────────── Main Content Area ──────────── */}
      <div className="w-full lg:max-w-3xl grow lg:w-3/4">
        {/* Step Header */}
        <div className="mb-8 lg:mb-12">
          <h2 className="relative inline-block font-serif text-2xl sm:text-3xl lg:text-4xl">
            {currentStep.heading}
            <div className="absolute bottom-[-8px] left-0 h-px w-1/3 bg-secondary" />
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base lg:mt-6 lg:text-lg">
            {currentStep.description}
          </p>
        </div>

        {/* Error Message */}
        {error && <Message className="mb-6" error={error} />}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
          {/* Form Card */}
          <div className="border border-border/50 bg-card p-5 shadow-sm sm:p-8 lg:p-10 xl:p-14">
            <FieldGroup className="gap-6 lg:gap-8">
              {activeStep === 0 && (
                <BusinessInfoForm
                  control={control}
                  setValue={setValue}
                  watch={watch}
                />
              )}

              {activeStep === 1 && (
                <AddressForm
                  control={control}
                  watch={watch}
                  setValue={setValue}
                />
              )}

              {activeStep === 2 && <BankAccountInfoForm control={control} />}

              {activeStep === 3 && (
                <ReviewStep getValues={getValues} onEditStep={setActiveStep} />
              )}
            </FieldGroup>
          </div>

          {/* ──────────── Actions ──────────── */}
          <div className="mt-6 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between lg:mt-10 lg:pt-8">
            {/* Left: Back button */}
            <div>
              {activeStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 gap-2 text-xs font-semibold uppercase tracking-[0.15em] sm:h-12"
                  onClick={handleBack}
                >
                  <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
                  Back
                </Button>
              )}
            </div>

            {/* Right: Save Draft + Continue/Submit */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Button
                type="button"
                variant="ghost"
                className="h-11 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground sm:h-12"
              >
                Save Draft
              </Button>

              {activeStep < steps.length - 1 ? (
                <Button
                  type="button"
                  className="h-11 gap-2 px-6 text-xs font-semibold uppercase tracking-[0.15em] sm:h-12 sm:px-8"
                  onClick={handleNext}
                >
                  Continue
                  <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 gap-2 px-6 text-xs font-semibold uppercase tracking-[0.15em] sm:h-12 sm:px-8"
                >
                  {isSubmitting ? <Spinner /> : "Submit Application"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </main>
  );
};

export default VendorMultiStepForm;
