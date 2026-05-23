import type { WorkflowConfig } from "payload";

import {
  adminVendorOnboardedEmail,
  vendorApprovalEmail,
} from "@/email/templates";
import { env } from "@/env";

export const vendorActivationWorkflow: WorkflowConfig<"vendorActivation"> = {
  slug: "vendorActivation",

  inputSchema: [
    { name: "tenantId", type: "text", required: true },
    { name: "ownerName", type: "text", required: true },
    { name: "ownerEmail", type: "text", required: true },
    { name: "storeName", type: "text", required: true },
  ],

  handler: async ({ job, tasks }) => {
    const { tenantId, ownerName, ownerEmail, storeName } = job.input;

    // ── Step 1: Send approval email to vendor immediately ─────────────────
    // This runs first so the vendor gets notified right away, even if
    // Razorpay setup takes time or needs clarification.
    await tasks.sendEmail("1-vendor-approval-email", {
      input: {
        to: ownerEmail,
        subject: `Your ${env.COMPANY_NAME} seller account is approved — ${storeName}`,
        html: vendorApprovalEmail(ownerName, storeName),
      },
    });

    // ── Step 2: Create Razorpay Linked Account ────────────────────────────
    // Runs after the email so a failure here doesn't prevent the vendor
    // from knowing they were approved.
    // const razorpayOutput = await tasks.createRazorpayLinkedAccount(
    //   "2-create-razorpay-account",
    //   { input: { tenantId } },
    // );

    // ── Step 3: Notify admin ─────────────────────────────────────────
    await tasks.sendEmail("3-admin-notification", {
      input: {
        to: env.SMTP_USER,
        subject: `[${env.COMPANY_NAME}] Vendor onboarded: ${storeName}`,
        html: adminVendorOnboardedEmail(
          storeName,
          tenantId,
          // razorpayOutput.activationStatus ?? "",
          "activated",
        ),
      },
    });
  },
};
