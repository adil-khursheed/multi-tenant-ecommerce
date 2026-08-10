import { INR_CURRENCIES } from "@/currencies";

// Admin field components that convert base-unit (paise) values to/from the
// display unit (rupees) — same treatment as the plugin's `priceInINR`.
export const inrFieldComponents = {
  Cell: {
    path: "@payloadcms/plugin-ecommerce/client#PriceCell",
    clientProps: { currenciesConfig: INR_CURRENCIES },
  },
  Field: {
    path: "@payloadcms/plugin-ecommerce/rsc#PriceInput",
    clientProps: { currenciesConfig: INR_CURRENCIES },
  },
};
