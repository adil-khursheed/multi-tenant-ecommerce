"use client";

import React, { useMemo } from "react";

import { useCurrency } from "@payloadcms/plugin-ecommerce/client/react";

import clsx from "clsx";

type BaseProps = {
  className?: string;
  currencyCodeClassName?: string;
  as?: "span" | "p";
};

type PriceFixed = {
  amount: number;
  originalAmount?: number;
  currencyCode?: string;
  highestAmount?: never;
  lowestAmount?: never;
  discountPercent?: number;
};

type PriceRange = {
  amount?: never;
  originalAmount?: never;
  currencyCode?: string;
  highestAmount: number;
  lowestAmount: number;
  discountPercent?: number;
};

type Props = BaseProps & (PriceFixed | PriceRange);

export const Price = ({
  amount,
  originalAmount,
  className,
  highestAmount,
  lowestAmount,
  discountPercent,
  currencyCode: currencyCodeFromProps,
  as = "p",
}: Props & React.ComponentProps<"p">) => {
  const { formatCurrency, supportedCurrencies } = useCurrency();

  const Element = as;

  const currencyToUse = useMemo(() => {
    if (currencyCodeFromProps) {
      return supportedCurrencies.find(
        (currency) => currency.code === currencyCodeFromProps,
      );
    }
    return undefined;
  }, [currencyCodeFromProps, supportedCurrencies]);

  if (typeof amount === "number") {
    if (typeof originalAmount === "number" && originalAmount > amount) {
      return (
        <Element
          className={clsx("flex items-center gap-2", className)}
          suppressHydrationWarning
        >
          <span>{formatCurrency(amount, { currency: currencyToUse })}</span>
          <span className="line-through text-muted-foreground text-sm">
            {formatCurrency(originalAmount, { currency: currencyToUse })}
          </span>
          <span className="bg-primary/10 px-1.5 py-0.5 text-xs font-mono text-primary">{`${discountPercent}% off`}</span>
        </Element>
      );
    }

    return (
      <Element className={className} suppressHydrationWarning>
        {formatCurrency(amount, { currency: currencyToUse })}
      </Element>
    );
  }

  if (highestAmount && highestAmount !== lowestAmount) {
    return (
      <Element className={className} suppressHydrationWarning>
        {`${formatCurrency(lowestAmount, { currency: currencyToUse })} - ${formatCurrency(highestAmount, { currency: currencyToUse })}`}
      </Element>
    );
  }

  if (lowestAmount) {
    return (
      <Element className={className} suppressHydrationWarning>
        {`${formatCurrency(lowestAmount, { currency: currencyToUse })}`}
      </Element>
    );
  }

  return null;
};
