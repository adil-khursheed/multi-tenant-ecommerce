"use client";

import React, { useCallback, useState } from "react";

import { usePayments } from "@payloadcms/plugin-ecommerce/client/react";

import { AlertCircle, Banknote, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/utilities/cn";

type PaymentMethod = "razorpay" | "cod";
type PaymentTab = "razorpay" | "cod";

type Props = {
  isCompleted?: boolean;
  onEdit?: () => void;
  onPaymentReady: (
    method: PaymentMethod,
    subMethod: string,
    data: Record<string, unknown>,
  ) => void;
  billingAddress?: Record<string, unknown>;
  shippingAddress?: Record<string, unknown>;
  email?: string;
};

const paymentMethods = [
  {
    id: "razorpay" as const,
    label: "Razorpay",
    icon: ShieldCheck,
    description: "Cards, UPI, Netbanking & Wallets",
  },
  {
    id: "cod" as const,
    label: "Cash on Delivery",
    icon: Banknote,
    description: "Pay on delivery",
  },
];

export const PaymentStep: React.FC<Props> = ({
  isCompleted,
  onEdit,
  onPaymentReady,
  billingAddress,
  shippingAddress,
  email,
}) => {
  const [activeTab, setActiveTab] = useState<PaymentTab>("razorpay");
  const [isInitiating, setIsInitiating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { initiatePayment } = usePayments();

  const handleInitiate = useCallback(
    async (method: PaymentMethod) => {
      setIsInitiating(true);
      setError(null);

      try {
        const data = (await initiatePayment(method, {
          additionalData: {
            ...(email ? { customerEmail: email } : {}),
            billingAddress,
            shippingAddress,
          },
        })) as Record<string, unknown> | null;

        if (data) {
          onPaymentReady(method, method, data);
        }
      } catch (err) {
        const errorData =
          err instanceof Error
            ? (() => {
                try {
                  return JSON.parse(err.message);
                } catch {
                  return {};
                }
              })()
            : {};
        let msg = "Failed to initiate payment. Please try again.";
        if (errorData?.cause?.code === "OutOfStock") {
          msg = "One or more items in your cart are out of stock.";
        }
        setError(msg);
      } finally {
        setIsInitiating(false);
      }
    },
    [email, billingAddress, shippingAddress, initiatePayment, onPaymentReady],
  );

  const handleRazorpaySubmit = useCallback(() => {
    setError(null);
    handleInitiate("razorpay");
  }, [handleInitiate]);

  const handleCODSubmit = useCallback(() => {
    setError(null);
    handleInitiate("cod");
  }, [handleInitiate]);

  return (
    <div className="overflow-hidden">
      {error && (
        <div className="mb-6 bg-destructive/10 border border-destructive/20 rounded-[4px] p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <p className="font-sans text-[13px] text-destructive leading-relaxed">
            {error}
          </p>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-0 md:gap-8 min-h-[400px]">
        {/* Payment Methods Nav */}
        <div className="w-full md:w-[200px] flex md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 mb-6 md:mb-0 border-b md:border-b-0 md:border-r border-border pr-0 md:pr-4 hide-scrollbar">
          {paymentMethods.map((pm) => {
            const Icon = pm.icon;
            const isActive = activeTab === pm.id;
            return (
              <button
                key={pm.id}
                type="button"
                onClick={() => {
                  setActiveTab(pm.id as PaymentTab);
                  setError(null);
                }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-[4px] font-sans text-[13px] font-medium transition-all whitespace-nowrap",
                  isActive
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-secondary",
                )}
              >
                <Icon className="w-4 h-4" />
                {pm.label.toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* Right Content */}
        <div className="flex-1 max-w-none md:max-w-[400px]">
          {activeTab === "razorpay" && (
            <div className="space-y-6">
              <div className="bg-secondary border border-border rounded-[4px] p-6 text-center">
                <ShieldCheck className="w-8 h-8 text-success mx-auto mb-3" />
                <h4 className="font-serif text-[18px] text-foreground mb-2">
                  Pay with Razorpay
                </h4>
                <p className="font-sans text-[13px] text-muted-foreground leading-relaxed">
                  You will be securely redirected to Razorpay where you can pay
                  using Credit/Debit Card, UPI, Netbanking, or Wallets.
                </p>
              </div>

              <ul className="space-y-3 font-sans text-[13px] text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Supports Cards, UPI, Netbanking &amp; Wallets
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  256-bit SSL encrypted &amp; secure
                </li>
              </ul>

              <Button
                disabled={isInitiating}
                onClick={handleRazorpaySubmit}
                variant="default"
                className="w-full h-14 uppercase tracking-[0.1em] text-[14px] font-medium"
              >
                {isInitiating ? "Processing..." : "Proceed to Pay"}
              </Button>
            </div>
          )}

          {activeTab === "cod" && (
            <div className="space-y-6">
              <div className="bg-secondary border border-border rounded-[4px] p-6 text-center">
                <Banknote className="w-8 h-8 text-foreground mx-auto mb-3" />
                <h4 className="font-serif text-[18px] text-foreground mb-2">
                  Cash on Delivery
                </h4>
                <p className="font-sans text-[13px] text-muted-foreground leading-relaxed">
                  Pay in cash when your order arrives. A convenience fee of ₹50
                  applies to all COD orders.
                </p>
              </div>

              <ul className="space-y-3 font-sans text-[13px] text-muted-foreground">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Please keep exact change ready
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Order confirmation SMS will be sent
                </li>
              </ul>

              <Button
                disabled={isInitiating}
                onClick={handleCODSubmit}
                variant="default"
                className="w-full h-14 uppercase tracking-[0.1em] text-[14px] font-medium mt-6"
              >
                {isInitiating ? "Processing..." : "Place Order"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
