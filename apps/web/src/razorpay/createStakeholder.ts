import type { Tenant } from "@/payload-types";
import { getRazorpayClient } from "./client";

export type StakeholderResult = {
  id: string;
  entity: string;
  name: string;
};

/**
 * Step 2 of Razorpay Route onboarding.
 * Creates a stakeholder (beneficial owner) for the Linked Account.
 * The stakeholder's name must match their PAN card exactly.
 * Each Linked Account can only have one stakeholder for the Route product.
 *
 * Docs: https://razorpay.com/docs/api/payments/route/stakeholders/create/
 */
export async function createStakeholder(
  razorpayAccountId: string,
  tenant: Tenant,
): Promise<StakeholderResult> {
  const razorpay = getRazorpayClient();

  const stakeholder = await razorpay.stakeholders.create(razorpayAccountId, {
    name: tenant.ownerName, // must match PAN card
    email: tenant.email,
    phone: {
      primary: tenant.phone,
    },
    kyc: {
      pan: tenant.panNumber,
    },
    percentage_ownership: 100,
    relationship: {
      director: true,
    },
  });

  return stakeholder as StakeholderResult;
}
