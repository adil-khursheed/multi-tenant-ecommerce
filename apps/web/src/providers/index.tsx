import React from "react";

import { EcommerceProvider } from "@payloadcms/plugin-ecommerce/client/react";
import { razorpayAdapterClient } from "@repo/payments/razorpay";
import { codAdapterClient } from "@repo/payments/cod";

import { TooltipProvider } from "@/components/ui/tooltip";
import { env } from "@/env";
import { AuthProvider } from "@/providers/Auth";
import { LoginModalProvider } from "@/providers/LoginModal";
import { SonnerProvider } from "@/providers/Sonner";
import { TRPCReactProvider } from "@/trpc/client";
import { HeaderThemeProvider } from "./HeaderTheme";
import { ThemeProvider } from "./Theme";

export const Providers: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <TRPCReactProvider>
      <ThemeProvider>
        <AuthProvider>
          <LoginModalProvider>
            <TooltipProvider>
              <HeaderThemeProvider>
                <SonnerProvider />
                <EcommerceProvider
                  enableVariants={true}
                  currenciesConfig={{
                    defaultCurrency: "INR",
                    supportedCurrencies: [
                      {
                        code: "INR",
                        decimals: 2,
                        label: "Indian Rupee",
                        symbol: "₹",
                      },
                    ],
                  }}
                  api={{
                    cartsFetchQuery: {
                      depth: 2,
                      populate: {
                        products: {
                          slug: true,
                          title: true,
                          gallery: true,
                          inventory: true,
                          tenant: true,
                          priceInINR: true,
                          meta: true,
                        },
                        variants: {
                          title: true,
                          inventory: true,
                        },
                      },
                    },
                  }}
                  paymentMethods={[
                    razorpayAdapterClient(),
                    codAdapterClient(),
                  ]}
                >
                  {children}
                </EcommerceProvider>
              </HeaderThemeProvider>
            </TooltipProvider>
          </LoginModalProvider>
        </AuthProvider>
      </ThemeProvider>
    </TRPCReactProvider>
  );
};
