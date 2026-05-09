import type { Tenant } from "@/payload-types";
import { getRazorpayClient } from "./client";

export type LinkedAccountResult = {
  id: string;
  //   entity: string
  email: string;
};

/**
 * Step 1 of Razorpay Route onboarding.
 * Creates a Linked Account under your master Razorpay account for the given vendor (tenant).
 *
 * Docs: https://razorpay.com/docs/api/payments/route/linked-accounts/create/
 */
export async function createLinkedAccount(
  tenant: Tenant,
): Promise<LinkedAccountResult> {
  const razorpay = getRazorpayClient();

  const account = await razorpay.accounts.create({
    email: tenant.email,
    phone: tenant.phone,
    contact_name: "",
    legal_business_name: tenant.businessName,
    customer_facing_business_name: tenant.storeName ?? tenant.businessName,
    business_type: tenant.businessType ?? "individual",
    reference_id: tenant.id, // your internal Payload tenant ID — useful for reconciliation
    profile: {
      category: "ecommerce",
      subcategory: "fashion_and_lifestyle",
      addresses: {
        registered: {
          street1: tenant.address?.street1,
          street2: tenant.address?.street2 || "",
          city: tenant.address?.city,
          state: tenant.address?.state,
          postal_code: tenant.address?.postalCode,
          country: tenant.address.country,
        },
      },
    },
  });

  return account as LinkedAccountResult;
}
