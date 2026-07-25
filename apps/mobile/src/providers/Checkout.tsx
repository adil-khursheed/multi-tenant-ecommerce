import React, { createContext, useCallback, useContext, useState } from "react";

type PaymentMethod = "razorpay" | "cod";

type AddressData = {
  firstName: string;
  lastName: string;
  phone?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
};

type CouponData = {
  code: string;
  discountAmount: number;
} | null;

type CheckoutContext = {
  billingAddress: AddressData | null;
  setBillingAddress: (addr: AddressData | null) => void;
  selectedPaymentMethod: PaymentMethod;
  setSelectedPaymentMethod: (method: PaymentMethod) => void;
  paymentData: Record<string, unknown> | null;
  setPaymentData: (data: Record<string, unknown> | null) => void;
  completedOrderId: string | null;
  setCompletedOrderId: (id: string | null) => void;
  appliedCoupon: CouponData;
  setAppliedCoupon: (coupon: CouponData) => void;
  error: string | null;
  setError: (error: string | null) => void;
  reset: () => void;
};

const CheckoutContext = createContext<CheckoutContext>({} as CheckoutContext);

export function CheckoutProvider({ children }: { children: React.ReactNode }) {
  const [billingAddress, setBillingAddress] = useState<AddressData | null>(
    null,
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<PaymentMethod>("razorpay");
  const [paymentData, setPaymentData] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponData>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setBillingAddress(null);
    setSelectedPaymentMethod("razorpay");
    setPaymentData(null);
    setCompletedOrderId(null);
    setAppliedCoupon(null);
    setError(null);
  }, []);

  return (
    <CheckoutContext.Provider
      value={{
        billingAddress,
        setBillingAddress,
        selectedPaymentMethod,
        setSelectedPaymentMethod,
        paymentData,
        setPaymentData,
        completedOrderId,
        setCompletedOrderId,
        appliedCoupon,
        setAppliedCoupon,
        error,
        setError,
        reset,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  return useContext(CheckoutContext);
}
