import React, { createContext, useContext } from "react";

type CurrencyConfig = {
  code: string;
  decimals: number;
  label: string;
  symbol: string;
};

type CurrencyContext = {
  currency: CurrencyConfig;
  supportedCurrencies: CurrencyConfig[];
  formatPrice: (amount: number) => string;
};

const DEFAULT_CURRENCY: CurrencyConfig = {
  code: "INR",
  decimals: 2,
  label: "Indian Rupee",
  symbol: "₹",
};

const CurrencyContext = createContext<CurrencyContext>({
  currency: DEFAULT_CURRENCY,
  supportedCurrencies: [DEFAULT_CURRENCY],
  formatPrice: () => "",
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const formatPrice = (amount: number): string => {
    const formatted = (amount / 100).toLocaleString("en-IN", {
      minimumFractionDigits: DEFAULT_CURRENCY.decimals,
      maximumFractionDigits: DEFAULT_CURRENCY.decimals,
    });
    return `${DEFAULT_CURRENCY.symbol}${formatted}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency: DEFAULT_CURRENCY,
        supportedCurrencies: [DEFAULT_CURRENCY],
        formatPrice,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
