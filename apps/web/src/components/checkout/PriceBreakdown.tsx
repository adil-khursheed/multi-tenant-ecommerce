"use client";

import React from "react";
import { Controller, useForm } from "react-hook-form";

import { z } from "zod";

import { Price } from "@/components/Price";
import { Field, FieldContent, FieldError } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";

const couponInputSchema = z.object({
  code: z.string().min(1, "Coupon code is required.").max(50),
});

type CouponInputData = z.infer<typeof couponInputSchema>;

const COD_FEE = 50;

type Props = {
  subtotal: number;
  discount: number;
  couponCode: string | null | undefined;
  selectedPaymentMethod?: "razorpay" | "cod";
  onApplyCoupon: (code: string) => void;
  onRemoveCoupon: () => void;
  couponLoading: boolean;
  couponError: string | null;
  showCouponInput?: boolean;
};

export const PriceBreakdown: React.FC<Props> = ({
  subtotal,
  discount,
  couponCode,
  selectedPaymentMethod,
  onApplyCoupon,
  onRemoveCoupon,
  couponLoading,
  couponError,
  showCouponInput = true,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CouponInputData>({
    defaultValues: { code: "" },
  });

  const handleApply = handleSubmit(async (data) => {
    const result = couponInputSchema.safeParse(data);
    if (!result.success) {
      return;
    }
    await onApplyCoupon(result.data.code);
    reset({ code: "" });
  });

  const isCOD = selectedPaymentMethod === "cod";
  const totalAfterDiscount = subtotal - discount;
  const grandTotal = isCOD ? totalAfterDiscount + COD_FEE : totalAfterDiscount;

  return (
    <div className="space-y-3">
      {/* Coupon Input */}
      {showCouponInput && !couponCode && (
        <form onSubmit={handleApply} className="pb-1">
          <Controller
            name="code"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldContent>
                  <InputGroup className="h-9">
                    <InputGroupInput
                      {...field}
                      value={field.value || ""}
                      placeholder="Coupon code"
                      className="uppercase text-[11px] tracking-wider"
                    />
                    <InputGroupButton
                      type="submit"
                      disabled={couponLoading}
                      className="h-full rounded-l-none"
                    >
                      {couponLoading ? <Spinner className="size-3" /> : "Apply"}
                    </InputGroupButton>
                  </InputGroup>
                  {(fieldState.error || couponError) && (
                    <FieldError
                      errors={
                        [
                          fieldState.error,
                          couponError ? { message: couponError } : undefined,
                        ].filter(Boolean) as Array<{ message?: string }>
                      }
                    />
                  )}
                </FieldContent>
              </Field>
            )}
          />
        </form>
      )}

      {/* Applied Coupon */}
      {couponCode && (
        <div className="flex items-center justify-between text-[12px] font-sans">
          <span className="text-muted-foreground uppercase tracking-wider">
            Coupon ({couponCode})
          </span>
          <div className="flex items-center gap-2">
            <Price amount={discount} className="text-destructive font-mono" />
            <button
              type="button"
              onClick={onRemoveCoupon}
              disabled={couponLoading}
              className="text-primary hover:underline text-[11px] font-medium"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Subtotal */}
      <div className="flex justify-between items-center">
        <span className="font-sans text-[13px] text-muted-foreground">
          Subtotal
        </span>
        <Price
          amount={subtotal}
          className="font-mono text-[14px] text-foreground"
        />
      </div>

      {/* Discount */}
      {discount > 0 && (
        <div className="flex justify-between items-center">
          <span className="font-sans text-[13px] text-destructive">
            Discount
          </span>
          <Price
            amount={-discount}
            className="font-mono text-[14px] text-destructive"
          />
        </div>
      )}

      {/* Shipping */}
      <div className="flex justify-between items-center">
        <span className="font-sans text-[13px] text-muted-foreground">
          Shipping{isCOD ? " (COD)" : ""}
        </span>
        {isCOD ? (
          <Price
            amount={COD_FEE}
            className="font-mono text-[14px] text-foreground"
          />
        ) : (
          <span className="font-mono text-[14px] text-muted-foreground">
            Free
          </span>
        )}
      </div>

      {/* Grand Total */}
      <div className="pt-3 border-t border-border flex justify-between items-baseline">
        <span className="font-sans font-medium text-[15px] text-foreground">
          Total
        </span>
        <Price
          amount={grandTotal}
          className="font-mono font-bold text-[20px] text-foreground"
        />
      </div>
    </div>
  );
};
