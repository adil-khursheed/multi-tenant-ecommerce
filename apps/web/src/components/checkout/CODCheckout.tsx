"use client";

import React, { useCallback, useState } from "react";

import {
  useCart,
  usePayments,
} from "@payloadcms/plugin-ecommerce/client/react";

import { Message } from "@/components/Message";
import { Button } from "@/components/ui/button";

type Props = {
  transactionID: string;
  customerEmail?: string;
  setProcessingPayment: (v: boolean) => void;
  onSuccess?: (result: { orderID: string; accessToken?: string }) => void;
};

export const CODCheckout: React.FC<Props> = ({
  transactionID,
  customerEmail,
  setProcessingPayment,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { confirmOrder } = usePayments();
  const { clearCart } = useCart();

  const handleConfirm = useCallback(async () => {
    setIsLoading(true);
    setProcessingPayment(true);

    try {
      const result = await confirmOrder("cod", {
        additionalData: {
          transactionID,
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
  }, [
    transactionID,
    customerEmail,
    confirmOrder,
    clearCart,
    onSuccess,
    setProcessingPayment,
  ]);

  return (
    <div>
      {error && <Message error={error} />}
      <p className="text-[13px] font-sans text-muted-foreground mb-6">
        Pay when your order is delivered. Keep exact change ready.
      </p>
      <Button
        type="button"
        onClick={handleConfirm}
        disabled={isLoading}
        variant="default"
        className="w-full h-12 uppercase tracking-[0.08em] font-medium rounded-[4px]"
      >
        {isLoading ? "Placing order..." : "Place Order (COD)"}
      </Button>
    </div>
  );
};
