"use client";

import type { DefaultCellComponentProps } from "payload";

import { INR_CURRENCIES } from "@/currencies";

const currency = INR_CURRENCIES.supportedCurrencies[0]!;

export const CouponValueCell: React.FC<DefaultCellComponentProps> = ({
  cellData,
  rowData,
}) => {
  const value = cellData as number | undefined;

  if (rowData?.discountType === "percentage") {
    return <span>{value ?? 0}%</span>;
  }

  const decimalValue =
    (value ?? 0) / 10 ** currency.decimals;
  return (
    <span>
      {currency.symbol}
      {decimalValue.toFixed(currency.decimals)}
    </span>
  );
};
