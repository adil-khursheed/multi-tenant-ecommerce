"use client";

import React, { useState } from "react";

import { useCart } from "@payloadcms/plugin-ecommerce/client/react";

import { ChevronUp } from "lucide-react";

import { PriceBreakdown } from "@/components/checkout/PriceBreakdown";
import { Media } from "@/components/Media";
import { Price } from "@/components/Price";
import {
  Drawer,
  DrawerContent,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

const COD_FEE = 50;

type Props = {
  selectedPaymentMethod?: "razorpay" | "cod";
  appliedCoupon?: { code: string; discountAmount: number } | null;
  onApplyCoupon: (code: string) => void;
  onRemoveCoupon: () => void;
  couponLoading: boolean;
  couponError: string | null;
};

export const MobileSummary: React.FC<Props> = ({
  selectedPaymentMethod,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  couponLoading,
  couponError,
}) => {
  const [open, setOpen] = useState(false);
  const { cart } = useCart();

  if (!cart || !cart.items || !cart.items.length) return null;

  const itemCount = cart.items.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0,
  );

  const subtotal = cart.subtotal || 0;
  const discount = appliedCoupon?.discountAmount || 0;
  const totalAfterDiscount = subtotal - discount;
  const isCOD = selectedPaymentMethod === "cod";
  const grandTotal = isCOD ? totalAfterDiscount + COD_FEE : totalAfterDiscount;

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

  return (
    <>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <button className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-foreground text-background border-t border-border px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
              <ChevronUp className="size-4 text-muted-foreground" />
            </div>
            <Price amount={grandTotal} className="text-[18px]" />
          </button>
        </DrawerTrigger>

        <DrawerPortal>
          <DrawerOverlay className="fixed inset-0 bg-foreground/60 z-50 backdrop-blur-sm" />
          <DrawerContent className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border rounded-t-xl max-h-[85vh] flex flex-col focus-visible:outline-none">
            <DrawerTitle className="sr-only">Order Summary</DrawerTitle>
            <div className="p-4 shrink-0 bg-background rounded-t-xl z-10 border-b border-border/50">
              <div className="w-12 h-1 bg-border rounded-full mx-auto mb-6" />
              <h3 className="font-serif text-[24px] text-foreground text-center">
                Order Summary
              </h3>
            </div>

            <div className="flex-1 min-h-0 flex flex-col">
              <div className="flex-1 min-h-0 overflow-y-auto p-6">
                {/* Items by Vendor */}
                <div className="space-y-6">
                  {Object.entries(vendorGroups).map(([vendorId, items]) => {
                    const firstProduct = items[0]?.product;

                    const vendorName =
                      typeof firstProduct === "object" && firstProduct
                        ? typeof firstProduct.tenant === "object" &&
                          firstProduct.tenant
                          ? ((firstProduct.tenant as Record<string, unknown>)
                              .storeName as string) || "Store"
                          : "Store"
                        : "Store";

                    const vendorItemsCount = items.reduce(
                      (acc, item) => acc + (item.quantity || 1),
                      0,
                    );
                    const vendorInitial = vendorName.charAt(0).toUpperCase();

                    return (
                      <React.Fragment key={vendorId}>
                        <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                          <div className="w-5 h-5 rounded-full border border-border bg-muted flex items-center justify-center text-[9px] font-bold text-foreground">
                            {vendorInitial}
                          </div>
                          <span className="font-sans font-medium text-[11px] text-muted-foreground uppercase tracking-wider">
                            {vendorName} — {vendorItemsCount} item
                            {vendorItemsCount !== 1 ? "s" : ""}
                          </span>
                        </div>

                        {items.map((item, index) => {
                          if (typeof item.product !== "object" || !item.product)
                            return null;

                          const { product, quantity } = item;
                          let price = product.effectivePrice ?? product.priceInINR;
                          let originalPrice = product.priceInINR;
                          const discountPct = product.discountPercent;
                          let image =
                            product.gallery?.[0]?.image || product.meta?.image;

                          const isVariant =
                            Boolean(item.variant) &&
                            typeof item.variant === "object";
                          if (isVariant) {
                            price =
                              item.variant?.effectivePrice ??
                              item.variant?.priceInINR ??
                              product.effectivePrice ??
                              product.priceInINR;
                            originalPrice = item.variant?.priceInINR ?? product.priceInINR;
                            const imageVariant = product.gallery?.find(
                              (g: any) => {
                                if (!g.variantOption) return false;
                                const variantOptionID =
                                  typeof g.variantOption === "object"
                                    ? g.variantOption.id
                                    : g.variantOption;
                                return item.variant?.options?.some((o: any) =>
                                  typeof o === "object"
                                    ? o.id === variantOptionID
                                    : o === variantOptionID,
                                );
                              },
                            );
                            if (
                              imageVariant &&
                              typeof imageVariant.image !== "string"
                            ) {
                              image = imageVariant.image;
                            }
                          }

                          return (
                            <div key={index} className="flex gap-4">
                              <div className="relative w-20 h-24 rounded-[2px] border border-border overflow-hidden shrink-0 bg-secondary">
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
                                <p className="font-sans font-medium text-[10px] tracking-wider text-primary mb-0.5 uppercase truncate">
                                  {vendorName}
                                </p>
                                <p className="font-serif text-[16px] text-foreground leading-tight mb-1 truncate">
                                  {product.title}
                                </p>
                                {isVariant && (
                                  <p className="font-sans text-[11px] text-muted-foreground tracking-wide mb-2">
                                    {item.variant?.options
                                      ?.map((o: any) =>
                                        typeof o === "object" ? o.label : "",
                                      )
                                      .filter(Boolean)
                                      .join(", ")}
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
                                    className="font-sans text-[13px] text-foreground"
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
              </div>

              {/* Price Breakdown - fixed at bottom */}
              <div className="shrink-0 p-6 pt-0 border-t border-border">
                <PriceBreakdown
                  subtotal={subtotal}
                  discount={discount}
                  couponCode={
                    appliedCoupon?.code ??
                    ((cart as Record<string, unknown>).couponCode as
                      | string
                      | null)
                  }
                  selectedPaymentMethod={selectedPaymentMethod}
                  onApplyCoupon={onApplyCoupon}
                  onRemoveCoupon={onRemoveCoupon}
                  couponLoading={couponLoading}
                  couponError={couponError}
                />
                <p className="font-sans text-[11px] text-muted-foreground text-right mt-2 mb-8">
                  Including all taxes
                </p>
              </div>
            </div>
          </DrawerContent>
        </DrawerPortal>
      </Drawer>
    </>
  );
};
