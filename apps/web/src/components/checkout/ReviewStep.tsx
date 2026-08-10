"use client";

import React from "react";

import {
  defaultCountries as supportedCountries,
  useCart,
} from "@payloadcms/plugin-ecommerce/client/react";

import { Banknote, CreditCard, MapPin, ShieldCheck } from "lucide-react";

import { StepHeader } from "@/components/checkout/ui/StepHeader";
import { Media } from "@/components/Media";
import { Price } from "@/components/Price";
import { Address } from "@/payload-types";

const getCountryLabel = (code: string): string => {
  const country = supportedCountries.find((c) =>
    typeof c === "string" ? c === code : c.value === code,
  );
  if (!country) return code;
  return typeof country === "string" ? country : country.label;
};

type Props = {
  billingAddress?: Partial<Address>;
  shippingAddress?: Partial<Address>;
  paymentMethod: "razorpay" | "cod";
  isCompleted?: boolean;
  onEdit?: (step: "address" | "payment") => void;
};

export const ReviewStep: React.FC<Props> = ({
  billingAddress,
  shippingAddress,
  paymentMethod,
  isCompleted,
  onEdit,
}) => {
  const { cart } = useCart();

  if (!cart || !cart.items || !cart.items.length) return null;

  return (
    <div>
      <StepHeader
        number="04"
        title="Review Order"
        isCompleted={isCompleted}
        onEdit={() => onEdit?.("address")}
      />

      <div className="space-y-6 mt-4">
        {/* Address Summary */}
        <div className="bg-card border border-border p-6 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-secondary group-hover:bg-primary transition-colors" />
          <div className="flex items-center justify-between mb-4 pl-3">
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <p className="text-[11px] font-sans uppercase tracking-[0.1em] font-medium text-foreground">
                Delivery Address
              </p>
            </div>
            <button
              onClick={() => onEdit?.("address")}
              className="text-[11px] font-sans font-medium uppercase tracking-[0.08em] text-primary hover:underline transition-colors"
            >
              Change
            </button>
          </div>
          {billingAddress && (
            <div className="text-[13px] font-sans text-muted-foreground pl-7 space-y-1">
              <p className="text-foreground font-medium mb-2">
                {billingAddress.firstName} {billingAddress.lastName}
              </p>
              <p>{billingAddress.addressLine1}</p>
              {billingAddress.addressLine2 && (
                <p>{billingAddress.addressLine2}</p>
              )}
              <p>
                {billingAddress.city}, {billingAddress.state}{" "}
                {billingAddress.postalCode}
              </p>
              <p>{getCountryLabel(billingAddress.country || "")}</p>
              {billingAddress.phone && (
                <p className="mt-2 text-foreground">{billingAddress.phone}</p>
              )}
            </div>
          )}
        </div>

        {/* Payment Summary */}
        <div className="bg-card border border-border p-6 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-secondary group-hover:bg-primary transition-colors" />
          <div className="flex items-center justify-between mb-4 pl-3">
            <div className="flex items-center gap-3">
              {paymentMethod === "cod" ? (
                <Banknote className="w-4 h-4 text-muted-foreground" />
              ) : (
                <CreditCard className="w-4 h-4 text-muted-foreground" />
              )}
              <p className="text-[11px] font-sans uppercase tracking-[0.1em] font-medium text-foreground">
                Payment Method
              </p>
            </div>
            <button
              onClick={() => onEdit?.("payment")}
              className="text-[11px] font-sans font-medium uppercase tracking-[0.08em] text-primary hover:underline transition-colors"
            >
              Change
            </button>
          </div>
          <p className="text-[13px] font-sans font-medium text-foreground pl-7">
            {paymentMethod === "cod" ? "Cash on Delivery" : "Razorpay"}
          </p>
        </div>

        {/* Items */}
        <div className="bg-card border border-border p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-secondary" />
          <p className="text-[11px] font-sans uppercase tracking-[0.1em] font-medium text-foreground mb-6 pl-3">
            Items ({cart.items.reduce((s, i) => s + (i.quantity || 0), 0)})
          </p>
          <div className="space-y-4 pl-3">
            {cart.items.map((item, index) => {
              if (typeof item.product !== "object" || !item.product)
                return null;
              const { product, quantity, variant } = item;

              const isVariant =
                Boolean(variant) && typeof variant === "object";

              let price =
                item.unitPrice ??
                product.effectivePrice ??
                product.priceInINR;
              let originalPrice = item.basePrice ?? product.priceInINR;
              let image =
                product.gallery?.[0]?.image || product.meta?.image;

              if (isVariant) {
                price =
                  item.unitPrice ??
                  variant?.effectivePrice ??
                  variant?.priceInINR ??
                  product.effectivePrice ??
                  product.priceInINR;
                originalPrice =
                  item.basePrice ?? variant?.priceInINR ?? product.priceInINR;
                const imageVariant = product.gallery?.find((g: any) => {
                  if (!g.variantOption) return false;
                  const variantOptionID =
                    typeof g.variantOption === "object"
                      ? g.variantOption.id
                      : g.variantOption;
                  return variant?.options?.some((o: any) =>
                    typeof o === "object"
                      ? o.id === variantOptionID
                      : o === variantOptionID,
                  );
                });
                if (imageVariant && typeof imageVariant.image !== "string") {
                  image = imageVariant.image;
                }
              }

              const variantLabel = isVariant
                ? variant?.options
                    ?.map((o: any) =>
                      typeof o === "object" ? o.label : "",
                    )
                    .filter(Boolean)
                    .join(", ")
                : undefined;

              const discountPct =
                originalPrice > price
                  ? Math.round(
                      ((originalPrice - price) / originalPrice) * 100,
                    )
                  : product.discountPercent;

              return (
                <div key={index} className="flex items-start gap-4">
                  <div className="relative w-16 h-20 rounded-[2px] border border-border overflow-hidden shrink-0 bg-secondary">
                    {image && typeof image !== "string" && (
                      <Media
                        fill
                        imgClassName="object-cover"
                        resource={image}
                        size="100px"
                      />
                    )}
                    <div className="absolute top-0 right-0 bg-foreground text-background text-[10px] font-mono px-1.5 py-0.5 m-1 rounded-sm">
                      {quantity}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <p className="font-serif text-[16px] text-foreground truncate mb-1">
                      {product.title}
                    </p>
                    {variantLabel && (
                      <p className="text-[11px] font-sans uppercase tracking-wide text-muted-foreground mb-1">
                        {variantLabel}
                      </p>
                    )}
                    {typeof price === "number" && (
                      <Price
                        amount={price * (quantity || 1)}
                        originalAmount={
                          typeof originalPrice === "number"
                            ? originalPrice * (quantity || 1)
                            : undefined
                        }
                        discountPercent={discountPct}
                        className="font-sans text-[13px] text-muted-foreground"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Trust */}
        <div className="flex items-center justify-center gap-2 text-muted-foreground pt-4">
          <ShieldCheck className="w-4 h-4 text-muted-foreground opacity-50" />
          <p className="text-[11px] font-sans tracking-wide">
            Secure checkout. Your data is protected.
          </p>
        </div>
      </div>
    </div>
  );
};
