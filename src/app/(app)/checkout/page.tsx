import { Fragment } from "react";
import type { Metadata } from "next";

import { CheckoutPage } from "@/components/checkout/CheckoutPage";
import { env } from "@/env";
import { mergeOpenGraph } from "@/utilities/mergeOpenGraph";

export default function Checkout() {
  return (
    <div className="container min-h-[90vh] flex">
      {!env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && (
        <div>
          <Fragment>
            {"To enable checkout, you must "}
            <a
              href="https://dashboard.stripe.com/test/apikeys"
              rel="noopener noreferrer"
              target="_blank"
            >
              obtain your Stripe API Keys
            </a>
            {" then set them as environment variables. See the "}
            <a
              href="https://github.com/payloadcms/payload/blob/main/templates/ecommerce/README.md#stripe"
              rel="noopener noreferrer"
              target="_blank"
            >
              README
            </a>
            {" for more details."}
          </Fragment>
        </div>
      )}

      <h1 className="sr-only">Checkout</h1>

      <CheckoutPage />
    </div>
  );
}

export const metadata: Metadata = {
  description: "Checkout.",
  openGraph: mergeOpenGraph({
    title: "Checkout",
    url: "/checkout",
  }),
  title: "Checkout",
};
