"use client";

import React, { useCallback, useState } from "react";

import {
  useCart,
  usePayments,
} from "@payloadcms/plugin-ecommerce/client/react";

import { Message } from "@/components/Message";
import { Button } from "@/components/ui/button";
import { env } from "@/env";

type Props = {
  razorpayOrderID: string;
  amount: number;
  currency: string;
  customerEmail?: string;
  billingAddress?: Record<string, unknown>;
  setProcessingPayment: (v: boolean) => void;
  onSuccess?: (result: { orderID: string; accessToken?: string }) => void;
};

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: Record<string, unknown>) => void) => void;
    };
  }
}

export const RazorpayCheckout: React.FC<Props> = ({
  razorpayOrderID,
  amount,
  currency,
  customerEmail,
  billingAddress,
  setProcessingPayment,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { confirmOrder } = usePayments();
  const { clearCart } = useCart();

  const handlePayment = useCallback(() => {
    if (!window.Razorpay) {
      setError("Razorpay SDK not loaded. Please refresh the page.");
      return;
    }

    setIsLoading(true);
    setProcessingPayment(true);

    const options = {
      key: env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount,
      currency,
      name: env.COMPANY_NAME || "Store",
      order_id: razorpayOrderID,
      handler: async (response: Record<string, unknown>) => {
        try {
          const razorpayPaymentID = response.razorpay_payment_id as string;
          const razorpayOrderIDResp = response.razorpay_order_id as string;
          const razorpaySignature = response.razorpay_signature as string;

          const result = await confirmOrder("razorpay", {
            additionalData: {
              razorpayPaymentID,
              razorpayOrderID: razorpayOrderIDResp,
              razorpaySignature,
              ...(customerEmail ? { customerEmail } : {}),
            },
          });

          if (
            result &&
            typeof result === "object" &&
            "orderID" in result &&
            result.orderID
          ) {
            clearCart();

            if (onSuccess) {
              onSuccess({
                orderID: result.orderID as string,
                accessToken: "accessToken" in result ? (result.accessToken as string) : undefined,
              });
            }
          }
        } catch (err) {
          const msg =
            err instanceof Error ? err.message : "Order confirmation failed";
          setError(msg);
          setIsLoading(false);
          setProcessingPayment(false);
        }
      },
      prefill: {
        email: customerEmail,
        contact: (billingAddress?.phone as string) || undefined,
      },
      theme: {
        color: "#C4622D",
      },
      modal: {
        ondismiss: () => {
          setIsLoading(false);
          setProcessingPayment(false);
        },
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: Record<string, unknown>) => {
        const errorData = response.error as Record<string, unknown> | undefined;
        setError(
          (errorData?.description as string) || "Payment failed",
        );
        setIsLoading(false);
        setProcessingPayment(false);
      });
      rzp.open();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to open Razorpay";
      setError(msg);
      setIsLoading(false);
      setProcessingPayment(false);
    }
  }, [
    razorpayOrderID,
    amount,
    currency,
    customerEmail,
    billingAddress,
    confirmOrder,
    clearCart,
    onSuccess,
    setProcessingPayment,
  ]);

  return (
    <div>
      {error && <Message error={error} />}
      <Button
        onClick={handlePayment}
        disabled={isLoading}
        variant="default"
        className="mt-4"
      >
        {isLoading ? "Processing..." : "Pay with Razorpay"}
      </Button>
    </div>
  );
};
