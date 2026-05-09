import type { TaskConfig } from "payload";

import { configureRouteProduct } from "@/razorpay/configureRouteProduct";
import { createLinkedAccount } from "@/razorpay/createLinkedAccount";
import { createStakeholder } from "@/razorpay/createStakeholder";

export const createRazorpayLinkedAccountTask: TaskConfig<"createRazorpayLinkedAccount"> =
  {
    slug: "createRazorpayLinkedAccount",

    inputSchema: [{ name: "tenantId", type: "text", required: true }],

    outputSchema: [
      { name: "razorpayAccountId", type: "text" },
      { name: "razorpayStakeholderId", type: "text" },
      { name: "razorpayProductId", type: "text" },
      { name: "activationStatus", type: "text" },
    ],

    // Retry up to 3 times — Razorpay API can be transiently unavailable
    retries: 3,

    handler: async ({ input, req: { payload } }) => {
      const { tenantId } = input;

      const tenant = await payload.findByID({
        collection: "tenants",
        id: tenantId,
      });

      if (!tenant) {
        throw new Error(`Tenant not found: ${tenantId}`);
      }

      // Guard: bank details must be present before attempting Razorpay onboarding
      if (
        !tenant.bankDetails.accountNumber ||
        !tenant.bankDetails.ifscCode ||
        !tenant.ownerName
      ) {
        await payload.update({
          collection: "tenants",
          id: tenantId,
          data: { razorpayActivationStatus: "missing_bank_details" },
        });
        throw new Error(
          `Tenant ${tenantId} is missing bank details — cannot create Razorpay Linked Account`,
        );
      }

      // Guard: prevent duplicate linked accounts
      if (tenant.razorpayAccountId) {
        payload.logger.warn({
          msg: `Razorpay Linked Account already exists for tenant ${tenantId} — skipping`,
          tenantId,
          razorpayAccountId: tenant.razorpayAccountId,
        });
        return {
          output: {
            razorpayAccountId: tenant.razorpayAccountId,
            razorpayStakeholderId: tenant.razorpayStakeholderId ?? "",
            razorpayProductId: tenant.razorpayProductId ?? "",
            activationStatus: tenant.razorpayActivationStatus ?? "pending",
          },
        };
      }

      // ── Step 1: Create Linked Account ─────────────────────────────────────
      const account = await createLinkedAccount(tenant);

      payload.logger.info({
        msg: `Razorpay Linked Account created for tenant ${tenantId}`,
        tenantId,
        razorpayAccountId: account.id,
      });

      // ── Step 2: Create Stakeholder ────────────────────────────────────────
      const stakeholder = await createStakeholder(account.id, tenant);

      // ── Step 3: Configure Route Product (bank details) ────────────────────
      const product = await configureRouteProduct(account.id, tenant);

      if (
        product.activation_status === "needs_clarification" &&
        product.requirements?.length
      ) {
        payload.logger.warn({
          msg: `Razorpay Linked Account needs clarification for tenant ${tenantId}`,
          tenantId,
          requirements: product.requirements,
        });
      }

      // Persist all Razorpay IDs back to the Tenant document
      await payload.update({
        collection: "tenants",
        id: tenantId,
        data: {
          razorpayAccountId: account.id,
          razorpayStakeholderId: stakeholder.id,
          razorpayProductId: product.id,
          razorpayActivationStatus: product.activation_status,
        },
      });

      payload.logger.info({
        msg: `Razorpay onboarding complete for tenant ${tenantId}`,
        tenantId,
        activationStatus: product.activation_status,
      });

      return {
        output: {
          razorpayAccountId: account.id,
          razorpayStakeholderId: stakeholder.id,
          razorpayProductId: product.id,
          activationStatus: product.activation_status,
        },
      };
    },
  };
