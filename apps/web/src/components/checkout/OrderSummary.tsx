"use client";

import React from "react";

import { useCart } from "@payloadcms/plugin-ecommerce/client/react";

import {
  CustomerSupportIcon,
  PackageIcon,
  Shield01Icon,
  TruckIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Media } from "@/components/Media";
import { Price } from "@/components/Price";
import { PriceBreakdown } from "@/components/checkout/PriceBreakdown";

type Props = {
  selectedPaymentMethod?: "razorpay" | "cod";
  appliedCoupon?: { code: string; discountAmount: number } | null;
  onApplyCoupon: (code: string) => void;
  onRemoveCoupon: () => void;
  couponLoading: boolean;
  couponError: string | null;
};

export const OrderSummary: React.FC<Props> = ({
  selectedPaymentMethod,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  couponLoading,
  couponError,
}) => {
  const { cart } = useCart();

  if (!cart || !cart.items || !cart.items.length) return null;

  const vendorGroups: Record<string, typeof cart.items> = {};

  cart.items.forEach((item) => {
    if (typeof item.product === "object" && item.product) {
      const vendorId =
        (typeof item.product.tenant === "string"
          ? item.product.tenant
          : typeof item.product.tenant === "object" && item.product.tenant
            ? (item.product.tenant.id as string)
            : null) || "unknown";

      if (!vendorGroups[vendorId]) {
        vendorGroups[vendorId] = [];
      }
      vendorGroups[vendorId].push(item);
    }
  });

  const totalItems = cart.items.reduce(
    (acc, item) => acc + (item.quantity || 1),
    0,
  );

  const subtotal = cart.subtotal || 0;
  const discount = appliedCoupon?.discountAmount || 0;

  return (
    <aside className="w-full">
      <div className="md:sticky md:top-8 border border-border rounded-[4px] bg-card overflow-hidden flex flex-col max-h-[calc(100vh-8rem)]">
        <div className="bg-foreground px-6 py-5 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <h2 className="font-serif text-[22px] text-background">
              Order Summary
            </h2>
            <span className="font-mono text-[13px] text-muted-foreground">
              ({totalItems} items)
            </span>
          </div>
          <button className="font-sans text-[12px] text-primary hover:underline">
            Edit Cart
          </button>
        </div>

        {/* Items by Vendor */}
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
          {Object.entries(vendorGroups).map(([vendorId, items]) => {
            const firstProduct = items[0]?.product;

            const vendorName =
              typeof firstProduct === "object" && firstProduct
                ? typeof firstProduct.tenant === "object" &&
                  firstProduct.tenant
                  ? ((firstProduct.tenant as Record<string, unknown>)
                      .storeName as string) ||
                    "Store"
                  : "Store"
                : "Store";

            const vendorItemsCount = items.reduce(
              (acc, item) => acc + (item.quantity || 1),
              0,
            );
            const vendorInitial = vendorName.charAt(0).toUpperCase();

            return (
              <React.Fragment key={vendorId}>
                <div className="bg-muted px-6 py-2 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border border-border bg-background flex items-center justify-center text-[8px] font-bold text-foreground">
                      {vendorInitial}
                    </div>
                    <span className="font-sans font-medium text-[12px] text-foreground">
                      {vendorName} — {vendorItemsCount} item
                      {vendorItemsCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {items.map((item, index) => {
                  if (typeof item.product !== "object" || !item.product)
                    return null;

                  const { product, quantity, variant } = item;
                  let price = product.priceInINR;
                  let image =
                    product.gallery?.[0]?.image || product.meta?.image;

                  const isVariant =
                    Boolean(variant) && typeof variant === "object";
                  if (isVariant) {
                    price = variant?.priceInINR;
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
                    if (
                      imageVariant &&
                      typeof imageVariant.image !== "string"
                    ) {
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

                  return (
                    <div
                      key={`${vendorId}-${index}`}
                      className="p-6 border-b border-border flex gap-4 bg-card"
                    >
                      <div className="relative w-14 h-[72px] bg-muted rounded-[2px] overflow-hidden shrink-0 border border-border">
                        {image && typeof image !== "string" && (
                          <Media
                            fill
                            imgClassName="object-cover"
                            resource={image}
                            size="56px"
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-sans font-medium text-[10px] tracking-wider text-primary mb-1 uppercase truncate">
                          {vendorName}
                        </p>
                        <h3 className="font-sans font-medium text-[13px] text-foreground mb-1 line-clamp-2 leading-snug">
                          {product.title}
                        </h3>
                        {variantLabel && (
                          <p className="font-sans text-[11px] text-muted-foreground">
                            {variantLabel}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-1">
                          <p className="font-mono text-[11px] text-muted-foreground">
                            Qty: {quantity}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {typeof price === "number" && (
                          <Price
                            amount={price * (quantity || 1)}
                            className="font-mono font-medium text-[14px] text-foreground"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>

        {/* Price Breakdown */}
        <div className="p-6 bg-card shrink-0">
          <PriceBreakdown
            subtotal={subtotal}
            discount={discount}
            couponCode={appliedCoupon?.code ?? (cart as Record<string, unknown>).couponCode as string | null}
            selectedPaymentMethod={selectedPaymentMethod}
            onApplyCoupon={onApplyCoupon}
            onRemoveCoupon={onRemoveCoupon}
            couponLoading={couponLoading}
            couponError={couponError}
          />
        </div>

        {/* Trust signals */}
        <div className="px-6 py-8 border-t border-border bg-muted/50 grid grid-cols-2 gap-y-5 gap-x-4 shrink-0">
          <div className="flex items-start gap-2">
            <HugeiconsIcon
              icon={Shield01Icon}
              className="w-4 h-4 text-primary shrink-0 mt-0.5"
            />
            <p className="font-sans text-[11px] text-muted-foreground leading-tight">
              100% Secure Payments
            </p>
          </div>
          <div className="flex items-start gap-2">
            <HugeiconsIcon
              icon={PackageIcon}
              className="w-4 h-4 text-primary shrink-0 mt-0.5"
            />
            <p className="font-sans text-[11px] text-muted-foreground leading-tight">
              Easy 15-Day Returns
            </p>
          </div>
          <div className="flex items-start gap-2">
            <HugeiconsIcon
              icon={TruckIcon}
              className="w-4 h-4 text-primary shrink-0 mt-0.5"
            />
            <p className="font-sans text-[11px] text-muted-foreground leading-tight">
              Genuine Branded Products
            </p>
          </div>
          <div className="flex items-start gap-2">
            <HugeiconsIcon
              icon={CustomerSupportIcon}
              className="w-4 h-4 text-primary shrink-0 mt-0.5"
            />
            <p className="font-sans text-[11px] text-muted-foreground leading-tight">
              24/7 Customer Support
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};
