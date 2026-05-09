import { decryptField } from "@/lib/crypto";
import type { Tenant } from "@/payload-types";
import { getRazorpayClient } from "./client";

export type ProductConfigResult = {
  id: string;
  account_id: string;
  activation_status:
    | "activated"
    | "under_review"
    | "needs_clarification"
    | "pending";
  requirements?: {
    field_reference: string;
    resolution_url: string;
    reason_code: string;
  }[];
};

/**
 * Step 3 of Razorpay Route onboarding.
 * Requests the Route product, then patches it with the vendor's bank account details.
 * Bank account number is stored encrypted in MongoDB — decrypted here before sending to Razorpay.
 *
 * Docs: https://razorpay.com/docs/api/payments/route/products/
 */
export async function configureRouteProduct(
  razorpayAccountId: string,
  tenant: Tenant,
): Promise<ProductConfigResult> {
  const razorpay = getRazorpayClient();

  // Request the Route product for this linked account
  const product = await razorpay.products.requestProductConfiguration(
    razorpayAccountId,
    {
      product_name: "route",
      tnc_accepted: true,
    },
  );

  // Decrypt the bank account number before sending to Razorpay
  // (afterRead hook normally handles this, but we decrypt explicitly here for clarity)
  const plainAccountNumber = decryptField(tenant.bankDetails.accountNumber);

  // Patch with bank account details
  const configured = await razorpay.products.edit(
    razorpayAccountId,
    product.id,
    {
      settlements: {
        account_number: plainAccountNumber,
        ifsc_code: tenant.bankDetails.ifscCode,
        beneficiary_name: tenant.bankDetails.accountHolderName,
      },
      tnc_accepted: true,
    },
  );

  return configured as ProductConfigResult;
}
