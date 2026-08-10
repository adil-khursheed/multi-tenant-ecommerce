"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useCart } from "@payloadcms/plugin-ecommerce/client/react";

import { ShoppingCart } from "lucide-react";

import type { CartItem } from "@/components/Cart";
import { Price } from "@/components/Price";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DeleteItemButton } from "./DeleteItemButton";
import { EditItemQuantityButton } from "./EditItemQuantityButton";
import { OpenCartButton } from "./OpenCart";

export function CartModal() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { cart } = useCart();

  useEffect(() => {
    // Close the cart modal when the pathname changes.
    setIsOpen(false);
  }, [pathname]);

  const totalQuantity = useMemo(() => {
    if (!cart || !cart.items || !cart.items.length) return undefined;
    return cart.items.reduce(
      (quantity, item) => (item.quantity || 0) + quantity,
      0,
    );
  }, [cart]);

  const vendorGroups = useMemo(() => {
    if (!cart?.items) return {};
    const groups: Record<string, CartItem[]> = {};
    cart.items.forEach((item) => {
      if (typeof item.product !== "object" || !item.product) return;
      const tenant = item.product.tenant;
      const vendorId =
        (typeof tenant === "string"
          ? tenant
          : typeof tenant === "object" && tenant
            ? (tenant.id as string)
            : null) || "unknown";
      if (!groups[vendorId]) {
        groups[vendorId] = [];
      }
      groups[vendorId].push(item);
    });
    return groups;
  }, [cart]);

  const totalSavings = useMemo(() => {
    if (!cart?.items) return 0;
    return cart.items.reduce((acc, item) => {
      const product = item.product;
      if (typeof product !== "object" || !product) return acc;
      const quantity = item.quantity || 1;
      const variant = item.variant;
      const isVariant = Boolean(variant) && typeof variant === "object";
      const price = isVariant
        ? (item.unitPrice ?? variant?.effectivePrice ?? variant?.priceInINR)
        : (item.unitPrice ?? product.effectivePrice ?? product.priceInINR);
      const originalPrice = isVariant
        ? (item.basePrice ?? variant?.priceInINR)
        : (item.basePrice ?? product.priceInINR);
      if (
        typeof price === "number" &&
        typeof originalPrice === "number" &&
        originalPrice > price
      ) {
        return acc + (originalPrice - price) * quantity;
      }
      return acc;
    }, 0);
  }, [cart]);

  return (
    <Sheet onOpenChange={setIsOpen} open={isOpen}>
      <SheetTrigger render={<OpenCartButton quantity={totalQuantity} />} />

      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>My Cart</SheetTitle>

          <SheetDescription>
            Manage your cart here, add items to view the total.
          </SheetDescription>
        </SheetHeader>

        {!cart || cart?.items?.length === 0 ? (
          <div className="text-center flex flex-col items-center gap-2">
            <ShoppingCart className="h-16" />
            <p className="text-center text-2xl font-bold">
              Your cart is empty.
            </p>
          </div>
        ) : (
          <div className="grow flex flex-col overflow-hidden">
            <div className="grow overflow-y-auto">
              {Object.entries(vendorGroups).map(([vendorId, items]) => {
                const firstProduct = items[0]?.product;
                const tenant =
                  typeof firstProduct === "object" && firstProduct
                    ? typeof firstProduct.tenant === "object" &&
                      firstProduct.tenant
                      ? firstProduct.tenant
                      : null
                    : null;

                const vendorName = tenant?.storeName || "Store";
                const vendorInitial = vendorName.charAt(0).toUpperCase();
                const vendorLogo =
                  tenant &&
                  typeof tenant.storeLogo === "object" &&
                  tenant.storeLogo?.url
                    ? tenant.storeLogo
                    : undefined;

                const vendorItemsCount = items.reduce(
                  (acc, item) => acc + (item.quantity || 1),
                  0,
                );

                return (
                  <div key={vendorId}>
                    <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-2.5">
                      <Avatar className="size-7">
                        <AvatarImage
                          alt={vendorName}
                          src={vendorLogo?.url ?? undefined}
                        />
                        <AvatarFallback className="text-[10px] font-bold">
                          {vendorInitial}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-foreground">
                        {vendorName} — {vendorItemsCount} item
                        {vendorItemsCount !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <ul>
                      {items.map((item, i) => {
                        const product = item.product;
                        const variant = item.variant;

                        if (
                          typeof product !== "object" ||
                          !product ||
                          !product.slug
                        )
                          return <React.Fragment key={i} />;

                        const metaImage =
                          product.meta?.image &&
                          typeof product.meta?.image === "object"
                            ? product.meta.image
                            : undefined;

                        const firstGalleryImage =
                          typeof product.gallery?.[0]?.image === "object"
                            ? product.gallery?.[0]?.image
                            : undefined;

                        let image = firstGalleryImage || metaImage;

                        const isVariant =
                          Boolean(variant) && typeof variant === "object";

                        const price = isVariant
                          ? (item.unitPrice ??
                            variant?.effectivePrice ??
                            variant?.priceInINR)
                          : (item.unitPrice ??
                            product.effectivePrice ??
                            product.priceInINR);
                        const originalPrice = isVariant
                          ? (item.basePrice ?? variant?.priceInINR)
                          : (item.basePrice ?? product.priceInINR);
                        const discountPct =
                          typeof originalPrice === "number" &&
                          typeof price === "number" &&
                          originalPrice > price
                            ? Math.round(
                                ((originalPrice - price) / originalPrice) * 100,
                              )
                            : product.discountPercent;

                        if (isVariant) {
                          const imageVariant = product.gallery?.find(
                            (item: any) => {
                              if (!item.variantOption) return false;
                              const variantOptionID =
                                typeof item.variantOption === "object"
                                  ? item.variantOption.id
                                  : item.variantOption;

                              const hasMatch = variant?.options?.some(
                                (option: any) => {
                                  if (typeof option === "object")
                                    return option.id === variantOptionID;
                                  else return option === variantOptionID;
                                },
                              );

                              return hasMatch;
                            },
                          );

                          if (
                            imageVariant &&
                            typeof imageVariant.image === "object"
                          ) {
                            image = imageVariant.image;
                          }
                        }

                        const variantLabel = isVariant
                          ? variant?.options
                              ?.map((option: any) =>
                                typeof option === "object" ? option.label : "",
                              )
                              .filter(Boolean)
                              .join(", ")
                          : undefined;

                        const href = `/products/${product.slug}${isVariant && variant ? `?variant=${variant.id}` : ""}`;

                        return (
                          <li
                            className="flex flex-col gap-3 border-b border-border px-4 py-4"
                            key={i}
                          >
                            <div className="flex gap-3">
                              <Link
                                className="relative size-18 shrink-0 overflow-hidden rounded-lg border border-border bg-muted"
                                href={href}
                              >
                                {image?.url && (
                                  <Image
                                    alt={image?.alt || product?.title || ""}
                                    className="h-full w-full object-cover"
                                    height={72}
                                    src={image.url}
                                    width={72}
                                  />
                                )}
                              </Link>

                              <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <Link
                                    className="line-clamp-2 text-sm font-medium leading-tight text-foreground hover:underline"
                                    href={href}
                                  >
                                    {product?.title}
                                  </Link>
                                  {variantLabel && (
                                    <span className="mt-1.5 inline-block rounded-lg bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                                      {variantLabel}
                                    </span>
                                  )}
                                </div>
                                <DeleteItemButton item={item} />
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-3">
                              {typeof price === "number" && (
                                <Price
                                  amount={price}
                                  originalAmount={
                                    typeof originalPrice === "number"
                                      ? originalPrice
                                      : undefined
                                  }
                                  discountPercent={discountPct ?? undefined}
                                  className="font-mono text-sm font-medium text-foreground"
                                />
                              )}
                              <div className="ml-auto flex h-8 flex-row items-center rounded-lg border border-border">
                                <EditItemQuantityButton
                                  item={item}
                                  type="minus"
                                />
                                <p className="w-7 text-center text-sm">
                                  {item.quantity}
                                </p>
                                <EditItemQuantityButton
                                  item={item}
                                  type="plus"
                                />
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>

            <div className="shrink-0 border-t border-border px-4 py-4">
              {typeof cart?.subtotal === "number" && (
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <Price
                    amount={cart?.subtotal}
                    className="text-base font-semibold text-foreground"
                  />
                </div>
              )}

              {totalSavings > 0 && (
                <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>You save</span>
                  <Price
                    amount={totalSavings}
                    className="font-mono font-medium text-emerald-600"
                  />
                </div>
              )}

              <Button className="w-full h-11 text-sm font-semibold" size="lg">
                <Link className="w-full text-center" href="/checkout">
                  Proceed to Checkout
                </Link>
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
