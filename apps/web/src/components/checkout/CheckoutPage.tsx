"use client";

import React, {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import Script from "next/script";

import {
  useAddresses,
  useCart,
} from "@payloadcms/plugin-ecommerce/client/react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Lock } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { AddressStep } from "@/components/checkout/AddressStep";
import { CODCheckout } from "@/components/checkout/CODCheckout";
import { ContactStep } from "@/components/checkout/ContactStep";
import { MobileSummary } from "@/components/checkout/MobileSummary";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { PaymentStep } from "@/components/checkout/PaymentStep";
import { RazorpayCheckout } from "@/components/checkout/RazorpayCheckout";
import { ReviewStep } from "@/components/checkout/ReviewStep";
import { SuccessScreen } from "@/components/checkout/SuccessScreen";
import { StepHeader } from "@/components/checkout/ui/StepHeader";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Address } from "@/payload-types";
import { useAuth } from "@/providers/Auth";
import { useTRPC } from "@/trpc/client";
import { cn } from "@/utilities/cn";

type PaymentMethod = "razorpay" | "cod";
type StepId = "contact" | "address" | "payment" | "review" | "success";

export const CheckoutPage: React.FC = () => {
  const { user } = useAuth();
  const { cart } = useCart();
  const { addresses } = useAddresses();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [activeStep, setActiveStep] = useState<StepId>("contact");
  const [completedSteps, setCompletedSteps] = useState<StepId[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [emailEditable, setEmailEditable] = useState(true);

  const [billingAddress, setBillingAddress] = useState<Partial<Address>>();
  const [shippingAddress, setShippingAddress] = useState<Partial<Address>>();
  const [sameAsShipping, setSameAsShipping] = useState(true);

  const [paymentData, setPaymentData] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>("razorpay");
  const [selectedPaymentSubMethod, setSelectedPaymentSubMethod] =
    useState<string>("card");
  const [isProcessingPayment, setProcessingPayment] = useState(false);

  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);
  const checkoutContainerRef = useRef<HTMLDivElement>(null);

  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const applyCouponMutation = useMutation(
    trpc.cart.applyCoupon.mutationOptions({
      onMutate: () => {
        setCouponLoading(true);
        setCouponError(null);
      },
      onSuccess: (result) => {
        if (result.cart) {
          setAppliedCoupon({
            code: result.cart.couponCode || "",
            discountAmount: result.cart.discount || 0,
          });
          queryClient.invalidateQueries({ queryKey: trpc.cart.get.queryKey() });
        }
      },
      onError: (err) => {
        setCouponError(err.message || "Failed to apply coupon");
        setAppliedCoupon(null);
      },
      onSettled: () => {
        setCouponLoading(false);
      },
    }),
  );

  const removeCouponMutation = useMutation(
    trpc.cart.removeCoupon.mutationOptions({
      onMutate: () => {
        setCouponLoading(true);
      },
      onSuccess: () => {
        setAppliedCoupon(null);
        setCouponError(null);
        queryClient.invalidateQueries({ queryKey: trpc.cart.get.queryKey() });
      },
      onError: (err) => {
        setCouponError(err.message || "Failed to remove coupon");
      },
      onSettled: () => {
        setCouponLoading(false);
      },
    }),
  );

  const handleApplyCoupon = useCallback(
    (code: string) => {
      applyCouponMutation.mutate({ code });
    },
    [applyCouponMutation],
  );

  const handleRemoveCoupon = useCallback(() => {
    removeCouponMutation.mutate();
  }, [removeCouponMutation]);

  const cartIsEmpty = !cart || !cart.items || !cart.items.length;

  useEffect(() => {
    if (!billingAddress && addresses && addresses.length > 0) {
      setBillingAddress(addresses[0]);
    }
  }, [addresses, billingAddress]);

  useEffect(() => {
    if (
      user &&
      activeStep === "contact" &&
      !completedSteps.includes("contact")
    ) {
      handleNext("contact", "address");
    }
  }, [user, activeStep, completedSteps]);

  const effectiveShippingAddress = sameAsShipping
    ? billingAddress
    : shippingAddress;
  const canProceedToPayment =
    Boolean(user || (email && !emailEditable)) && Boolean(billingAddress);

  const handleNext = (current: StepId, next: StepId) => {
    setCompletedSteps((prev) => [...new Set([...prev, current])]);
    setActiveStep(next);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handlePaymentReady = useCallback(
    (
      method: PaymentMethod,
      subMethod: string,
      data: Record<string, unknown>,
    ) => {
      setSelectedPaymentMethod(method);
      setSelectedPaymentSubMethod(subMethod);
      setPaymentData(data);
      setError(null);
      handleNext("payment", "review");
    },
    [],
  );

  const handlePaymentSuccess = useCallback(
    (result: { orderID: string; accessToken?: string }) => {
      setCompletedOrderId(result.orderID);
      handleNext("review", "success");
    },
    [],
  );

  if (cartIsEmpty && isProcessingPayment) {
    return (
      <div className="py-20 w-full flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <p className="font-sans text-[13px] text-muted-foreground mb-6 tracking-wide">
            Processing your payment...
          </p>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (cartIsEmpty && activeStep !== "success") {
    return (
      <div className="py-20 w-full text-center min-h-screen bg-background flex flex-col items-center justify-center">
        <p className="font-sans text-[15px] text-muted-foreground mb-6">
          Your cart is empty.
        </p>
        <Link href="/search">
          <Button
            variant="default"
            size="lg"
            className="h-12 px-8 uppercase tracking-[0.08em] font-sans text-[11px]"
          >
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  if (activeStep === "success" && completedOrderId) {
    return <SuccessScreen orderID={completedOrderId} />;
  }

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20 selection:text-primary pb-20">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      {/* Navbar */}
      <nav className="sticky top-0 z-100 bg-card border-b border-border h-16 px-4 md:px-12 flex items-center justify-between">
        {/* Desktop Stepper */}
        <div className="hidden md:flex items-center gap-12 flex-1 justify-center">
          {[
            { id: "address", label: "Address", step: 1 },
            { id: "payment", label: "Payment", step: 2 },
            { id: "review", label: "Confirmation", step: 3 },
          ].map((item, idx) => {
            const isActive =
              activeStep === item.id ||
              (activeStep === "contact" && item.id === "address");
            const isDone =
              completedSteps.includes(item.id as StepId) &&
              activeStep !== item.id;
            return (
              <div key={item.id} className="flex items-center gap-3 relative">
                {idx > 0 && (
                  <div
                    className={cn(
                      "absolute -left-8 top-1/2 -translate-y-1/2 w-4 h-px",
                      isDone ? "bg-success" : "bg-border",
                    )}
                  />
                )}
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center transition-colors",
                    isDone
                      ? "bg-success"
                      : isActive
                        ? "bg-foreground"
                        : "border border-border",
                  )}
                >
                  {isDone ? (
                    <Check className="w-3.5 h-3.5 text-background" />
                  ) : (
                    <span
                      className={cn(
                        "font-mono text-[13px]",
                        isActive ? "text-background" : "text-muted-foreground",
                      )}
                    >
                      {item.step}
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    "font-sans font-medium text-[12px]",
                    isDone
                      ? "text-success"
                      : isActive
                        ? "text-foreground"
                        : "text-muted-foreground",
                  )}
                >
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex-1 flex justify-end items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-success">
            <Lock className="w-3.5 h-3.5 stroke-[1.5]" />
            <span className="font-sans text-[12px]">Secure Checkout</span>
          </div>
          <button className="font-sans text-[12px] text-primary hover:underline">
            Need help?
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[1200px] mx-auto px-5 md:px-12 py-10 md:py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Left Column - Checkout Steps */}
          <div
            className="w-full lg:w-[60%] flex flex-col gap-12"
            ref={checkoutContainerRef}
          >
            {/* Step 1 - Contact */}
            <section
              className={cn(
                "transition-opacity duration-300",
                activeStep !== "contact" && completedSteps.includes("contact")
                  ? "opacity-100"
                  : activeStep === "contact"
                    ? "opacity-100"
                    : "opacity-40 grayscale pointer-events-none",
              )}
            >
              <StepHeader
                number="01"
                title="Contact"
                subtitle="How should we reach you about your order?"
                isCompleted={
                  completedSteps.includes("contact") && activeStep !== "contact"
                }
                onEdit={() => setActiveStep("contact")}
              />

              <AnimatePresence mode="wait">
                {activeStep === "contact" ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <ContactStep
                      email={email}
                      setEmail={setEmail}
                      emailEditable={emailEditable}
                      setEmailEditable={setEmailEditable}
                      user={user}
                      onContinue={() => handleNext("contact", "address")}
                    />
                  </motion.div>
                ) : (
                  completedSteps.includes("contact") && (
                    <div className="bg-secondary border border-border rounded-[4px] p-4 flex items-center justify-between">
                      <p className="font-sans text-[13px] text-muted-foreground">
                        {email || user?.email}
                      </p>
                    </div>
                  )
                )}
              </AnimatePresence>
            </section>

            {/* Step 2 - Address */}
            <section
              className={cn(
                "transition-opacity duration-300",
                activeStep !== "address" && completedSteps.includes("address")
                  ? "opacity-100"
                  : activeStep === "address"
                    ? "opacity-100"
                    : "opacity-40 grayscale pointer-events-none",
              )}
            >
              <StepHeader
                number="02"
                title="Delivery Address"
                subtitle="Where should we send your order?"
                isCompleted={
                  completedSteps.includes("address") && activeStep !== "address"
                }
                onEdit={() => setActiveStep("address")}
              />

              <AnimatePresence mode="wait">
                {activeStep === "address" ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <AddressStep
                      billingAddress={billingAddress}
                      setBillingAddress={setBillingAddress}
                      shippingAddress={shippingAddress}
                      setShippingAddress={setShippingAddress}
                      sameAsShipping={sameAsShipping}
                      setSameAsShipping={setSameAsShipping}
                      email={email}
                      user={user}
                      emailEditable={emailEditable}
                    />

                    <div className="mt-8 border-t border-border pt-6">
                      <Button
                        type="button"
                        variant="default"
                        className="w-full h-14 uppercase tracking-[0.1em] text-[14px] font-medium"
                        disabled={!canProceedToPayment}
                        onClick={() => handleNext("address", "payment")}
                      >
                        Continue to Payment →
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  completedSteps.includes("address") &&
                  billingAddress && (
                    <div className="bg-secondary border border-border rounded-[4px] p-5 flex items-center justify-between">
                      <p className="font-sans text-[13px] text-muted-foreground">
                        {billingAddress.firstName} {billingAddress.lastName},{" "}
                        {billingAddress.city}
                      </p>
                    </div>
                  )
                )}
              </AnimatePresence>
            </section>

            {/* Step 3 - Payment */}
            <section
              className={cn(
                "transition-opacity duration-300",
                activeStep !== "payment" && completedSteps.includes("payment")
                  ? "opacity-100"
                  : activeStep === "payment"
                    ? "opacity-100"
                    : "opacity-40 grayscale pointer-events-none",
              )}
            >
              <StepHeader
                number="03"
                title="Payment"
                subtitle="All transactions are 256-bit SSL encrypted."
                isCompleted={
                  completedSteps.includes("payment") && activeStep !== "payment"
                }
                onEdit={() => setActiveStep("payment")}
              />

              <AnimatePresence mode="wait">
                {activeStep === "payment" ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <PaymentStep
                      onPaymentReady={handlePaymentReady}
                      billingAddress={billingAddress as Record<string, unknown>}
                      shippingAddress={
                        effectiveShippingAddress as Record<string, unknown>
                      }
                      email={email || ((user as any)?.email as string)}
                    />
                  </motion.div>
                ) : (
                  completedSteps.includes("payment") &&
                  paymentData && (
                    <div className="bg-secondary border border-border rounded-[4px] p-5 flex items-center justify-between">
                      <p className="font-sans text-[13px] text-muted-foreground">
                        {selectedPaymentMethod === "cod"
                          ? "Cash on Delivery"
                          : "Razorpay"}
                      </p>
                    </div>
                  )
                )}
              </AnimatePresence>
            </section>

            {/* Step 4 - Review (only shown when in review step) */}
            <AnimatePresence>
              {activeStep === "review" && paymentData && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <ReviewStep
                    billingAddress={billingAddress}
                    shippingAddress={effectiveShippingAddress}
                    paymentMethod={selectedPaymentMethod}
                    onEdit={(step) => setActiveStep(step as StepId)}
                  />

                  {error && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-[4px] p-4 text-[13px] font-sans text-destructive">
                      {error}
                    </div>
                  )}

                  <Suspense
                    fallback={
                      <div className="py-12 text-center">
                        <LoadingSpinner />
                      </div>
                    }
                  >
                    {selectedPaymentMethod === "razorpay" &&
                      Boolean(paymentData["razorpayOrderID"]) && (
                        <RazorpayCheckout
                          razorpayOrderID={
                            paymentData["razorpayOrderID"] as string
                          }
                          amount={paymentData["amount"] as number}
                          currency={paymentData["currency"] as string}
                          customerEmail={
                            email || ((user as any)?.email as string)
                          }
                          billingAddress={
                            billingAddress as Record<string, unknown>
                          }
                          setProcessingPayment={setProcessingPayment}
                          onSuccess={handlePaymentSuccess}
                        />
                      )}

                    {selectedPaymentMethod === "cod" &&
                      Boolean(paymentData["transactionID"]) && (
                        <CODCheckout
                          transactionID={paymentData["transactionID"] as string}
                          customerEmail={
                            email || ((user as any)?.email as string)
                          }
                          setProcessingPayment={setProcessingPayment}
                          onSuccess={handlePaymentSuccess}
                        />
                      )}
                  </Suspense>

                  <Button
                    variant="outline"
                    className="w-full h-12 uppercase tracking-[0.08em]"
                    onClick={() => {
                      setPaymentData(null);
                      setActiveStep("payment");
                    }}
                  >
                    Back to Payment
                  </Button>
                </motion.section>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column - Order Summary */}
          <aside className="w-full lg:w-[40%] hidden lg:block">
            <div className="sticky top-24">
              <OrderSummary
                selectedPaymentMethod={selectedPaymentMethod}
                appliedCoupon={appliedCoupon}
                onApplyCoupon={handleApplyCoupon}
                onRemoveCoupon={handleRemoveCoupon}
                couponLoading={couponLoading}
                couponError={couponError}
              />
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile Summary */}
      <MobileSummary
        selectedPaymentMethod={selectedPaymentMethod}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={handleApplyCoupon}
        onRemoveCoupon={handleRemoveCoupon}
        couponLoading={couponLoading}
        couponError={couponError}
      />
    </div>
  );
};
