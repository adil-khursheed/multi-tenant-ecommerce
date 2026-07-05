"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { useCurrency } from "@payloadcms/plugin-ecommerce/client/react";

import {
  FavouriteIcon,
  PackageReceiveIcon,
  RulerIcon,
  Shield01Icon,
  ShippingTruck01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { AddToCart } from "@/components/Cart/AddToCart";
import { Price } from "@/components/Price";
import { StarRating } from "@/components/StarRating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Product, Variant } from "@/payload-types";
import { StockIndicator } from "./StockIndicator";
import { VariantSelector } from "./VariantSelector";

export const ProductInfo: React.FC<{ product: Product }> = ({ product }) => {
  const [quantity, setQuantity] = useState(1);
  const { currency } = useCurrency();

  const tenant = typeof product.tenant === "object" ? product.tenant : null;
  const averageRating = product.ratings?.average || 0;
  const reviewCount = product.ratings?.count || 0;

  return (
    <div className="flex flex-col gap-6 lg:pl-10">
      {/* Vendor Row */}
      {tenant && (
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage
              src={
                typeof tenant.storeLogo === "object" && tenant.storeLogo?.url
                  ? tenant.storeLogo.url
                  : undefined
              }
              alt={tenant.storeName || "Store Logo"}
            />
            <AvatarFallback>
              {tenant.storeName?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <Link
            href={`/seller/${tenant.id}`}
            className="text-sm font-medium hover:underline underline-offset-4"
          >
            {tenant.storeName}
          </Link>
        </div>
      )}

      {/* Title */}
      <div>
        <h1 className="text-3xl md:text-4xl font-serif font-medium tracking-tight">
          {product.title}
        </h1>

        {product.shortDescription && (
          <p className="mt-2 text-sm text-muted-foreground">
            {product.shortDescription}
          </p>
        )}
      </div>

      {/* Rating */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-full">
          <span className="text-sm font-semibold">
            {averageRating.toFixed(1)}
          </span>
          <StarRating rating={averageRating} maxStars={1} className="gap-0" />
        </div>
        <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors underline underline-offset-4">
          {reviewCount} Reviews
        </span>
      </div>

      <Separator />

      {/* Price */}
      <div className="flex flex-col gap-2">
        <ProductPrice product={product} currencyCode={currency.code} />
        <p className="text-xs text-muted-foreground">Inclusive of all taxes</p>
      </div>

      {/* Variants */}
      <VariantSelector product={product} />

      {/* Size Guide Trigger */}
      <div className="flex items-center justify-end">
        <Sheet>
          <SheetTrigger
            render={
              <Button
                variant="link"
                className="h-auto p-0 text-xs text-muted-foreground gap-1"
              />
            }
          >
            <HugeiconsIcon icon={RulerIcon} size={14} />
            Size Guide
          </SheetTrigger>
          <SheetContent className="sm:max-w-[425px]">
            <SheetHeader>
              <SheetTitle>Size Guide</SheetTitle>
              <SheetDescription>
                Find your perfect fit. Measurements are in centimeters.
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Size</TableHead>
                    <TableHead>Chest</TableHead>
                    <TableHead>Waist</TableHead>
                    <TableHead>Hip</TableHead>
                    <TableHead>Length</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { size: "XS", chest: 78, waist: 62, hip: 86, length: 136 },
                    { size: "S", chest: 82, waist: 66, hip: 90, length: 138 },
                    { size: "M", chest: 86, waist: 70, hip: 94, length: 140 },
                    { size: "L", chest: 90, waist: 74, hip: 98, length: 142 },
                    { size: "XL", chest: 96, waist: 80, hip: 104, length: 144 },
                    {
                      size: "XXL",
                      chest: 102,
                      waist: 86,
                      hip: 110,
                      length: 146,
                    },
                  ].map((row) => (
                    <TableRow key={row.size}>
                      <TableCell className="font-medium">{row.size}</TableCell>
                      <TableCell>{row.chest}</TableCell>
                      <TableCell>{row.waist}</TableCell>
                      <TableCell>{row.hip}</TableCell>
                      <TableCell>{row.length}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Quantity & Cart Actions */}
      <div className="flex flex-col gap-4 mt-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center border border-border rounded-md h-12 w-32">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-10 h-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors rounded-l-md"
            >
              -
            </button>
            <div className="flex-1 h-full flex items-center justify-center font-medium text-sm">
              {quantity}
            </div>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors rounded-r-md"
            >
              +
            </button>
          </div>
          <StockIndicator product={product} />
        </div>

        <div className="flex items-center gap-3 w-full">
          <div className="flex-1">
            <AddToCart
              product={product}
              data-main-add-to-cart
              className="h-12 text-base"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 shrink-0 rounded-md"
          >
            <HugeiconsIcon icon={FavouriteIcon} size={20} />
          </Button>
        </div>
      </div>

      {/* Delivery Checker */}
      {/* <div className="mt-4 p-4 border border-border rounded-lg bg-muted/30">
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <HugeiconsIcon icon={ShippingTruck01Icon} size={18} />
          Delivery Estimates
        </h3>
        <div className="flex items-center gap-2">
          <Input placeholder="Enter pincode" className="bg-background h-10" />
          <Button variant="secondary">Check</Button>
        </div>
        <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
          Usually delivers in 3-5 business days. Free shipping on orders over
          ₹999.
        </p>
      </div> */}

      {/* Trust Signals */}
      <div className="grid grid-cols-3 gap-2 mt-4">
        <div className="flex flex-col items-center justify-center gap-2 p-3 text-center rounded-lg bg-muted/50">
          <HugeiconsIcon
            icon={ShippingTruck01Icon}
            size={20}
            className="text-primary"
          />
          <span className="text-[10px] font-medium uppercase tracking-wider">
            Free Shipping
          </span>
        </div>
        <div className="flex flex-col items-center justify-center gap-2 p-3 text-center rounded-lg bg-muted/50">
          <HugeiconsIcon
            icon={PackageReceiveIcon}
            size={20}
            className="text-primary"
          />
          <span className="text-[10px] font-medium uppercase tracking-wider">
            Easy Returns
          </span>
        </div>
        <div className="flex flex-col items-center justify-center gap-2 p-3 text-center rounded-lg bg-muted/50">
          <HugeiconsIcon
            icon={Shield01Icon}
            size={20}
            className="text-primary"
          />
          <span className="text-[10px] font-medium uppercase tracking-wider">
            Secure Checkout
          </span>
        </div>
      </div>
    </div>
  );
};

function ProductPrice({
  product,
  currencyCode,
}: {
  product: Product;
  currencyCode: string;
}) {
  const searchParams = useSearchParams();
  const variantId = searchParams.get("variant");
  const priceField = `priceIn${currencyCode}` as keyof Product;

  const hasVariants =
    product.enableVariants && Boolean(product.variants?.docs?.length);
  let selectedVariant: Variant | undefined;

  if (hasVariants && variantId && product.variants?.docs) {
    selectedVariant = product.variants.docs.find(
      (v) => typeof v === "object" && String(v.id) === variantId,
    ) as Variant | undefined;
  }

  if (selectedVariant) {
    const variantPriceField = `priceIn${currencyCode}` as keyof Variant;
    const vPrice = selectedVariant[variantPriceField];
    const originalAmount =
      typeof vPrice === "number"
        ? vPrice
        : (product[priceField] as number | undefined);
    const effectiveAmount = selectedVariant.effectivePrice ?? originalAmount;
    const discountPercent =
      typeof originalAmount === "number" &&
      typeof effectiveAmount === "number" &&
      originalAmount > effectiveAmount
        ? Math.round(
            ((originalAmount - effectiveAmount) / originalAmount) * 100,
          )
        : undefined;
    return (
      <Price
        amount={effectiveAmount as number}
        originalAmount={originalAmount}
        discountPercent={discountPercent}
        className="text-2xl font-semibold"
      />
    );
  }

  if (hasVariants) {
    const minPrice = product.minEffectivePrice;
    const maxPrice = product.maxEffectivePrice;
    if (typeof minPrice === "number" && typeof maxPrice === "number") {
      return (
        <Price
          lowestAmount={minPrice}
          highestAmount={maxPrice}
          className="text-2xl font-semibold"
        />
      );
    }
  }

  const basePrice = product[priceField] as number;
  const effectivePrice = product.effectivePrice ?? basePrice;
  const discountPercent =
    typeof basePrice === "number" &&
    typeof effectivePrice === "number" &&
    basePrice > effectivePrice
      ? Math.round(((basePrice - effectivePrice) / basePrice) * 100)
      : undefined;

  return (
    <Price
      amount={effectivePrice}
      originalAmount={basePrice}
      discountPercent={discountPercent}
      className="text-2xl font-semibold"
    />
  );
}
