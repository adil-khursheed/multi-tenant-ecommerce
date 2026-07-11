"use client";

import React, { useState } from "react";

import { useCart } from "@payloadcms/plugin-ecommerce/client/react";

import { ChevronUp } from "lucide-react";

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

export const MobileSummary: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { cart } = useCart();

  if (!cart || !cart.items || !cart.items.length) return null;

  const itemCount = cart.items.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0,
  );

  return (
    <>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <button className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-foreground text-background border-t border-border px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-sans text-[13px] font-medium">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            </div>
            <Price
              amount={cart.subtotal || 0}
              className="font-serif text-[18px]"
            />
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

            <div className="p-6 overflow-y-auto">
              <div className="space-y-6">
                {cart.items.map((item, index) => {
                  if (typeof item.product !== "object" || !item.product)
                    return null;
                  const { product, quantity } = item;
                  let price = product.priceInINR;
                  let image =
                    product.gallery?.[0]?.image || product.meta?.image;

                  const isVariant =
                    Boolean(item.variant) && typeof item.variant === "object";
                  if (isVariant) {
                    price = item.variant?.priceInINR;
                    const imageVariant = product.gallery?.find((g: any) => {
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
                    });
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
                            className="font-sans text-[13px] text-foreground"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-border space-y-3">
                <div className="flex justify-between font-sans text-[13px] text-muted-foreground">
                  <span>Subtotal</span>
                  <Price amount={cart.subtotal || 0} />
                </div>
                <div className="flex justify-between font-sans text-[13px] text-muted-foreground">
                  <span>Shipping</span>
                  <span>Calculated at next step</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-foreground">
                <div className="flex justify-between items-end">
                  <span className="font-sans text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                    Total
                  </span>
                  <Price
                    className="font-serif text-[28px] text-foreground leading-none"
                    amount={cart.subtotal || 0}
                  />
                </div>
                <p className="font-sans text-[11px] text-muted-foreground text-right mt-2 mb-8">
                  Including GST
                </p>
              </div>
            </div>
          </DrawerContent>
        </DrawerPortal>
      </Drawer>
    </>
  );
};
