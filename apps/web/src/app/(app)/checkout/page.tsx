import { Fragment } from "react";
import type { Metadata } from "next";

import { CheckoutPage } from "@/components/checkout/CheckoutPage";
import { env } from "@/env";
import { mergeOpenGraph } from "@/utilities/mergeOpenGraph";

export default function Checkout() {
  return (
    <div className="min-h-screen">
      {!env.NEXT_PUBLIC_RAZORPAY_KEY_ID && (
        <div>
          <Fragment>
            {"To enable online checkout, you must configure "}
            <a
              href="https://dashboard.razorpay.com/app/keys"
              rel="noopener noreferrer"
              target="_blank"
            >
              Razorpay API Keys
            </a>
            {" and set NEXT_PUBLIC_RAZORPAY_KEY_ID as an environment variable."}
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
