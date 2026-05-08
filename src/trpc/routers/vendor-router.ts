import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  IFSCVerificationResponse,
  vendorOnboardingSchema,
} from "@/components/forms/CreateAccountForm/vendor-onboarding-schema";
import { protectedProcedure } from "../init";

export const vendorRouter = {
  create: protectedProcedure
    .input(vendorOnboardingSchema)
    .mutation(async ({ ctx, input }) => {}),

  verifyIFSC: protectedProcedure
    .input(
      z.object({
        ifsc: z
          .string()
          .min(11, "IFSC code must be of 11 characters")
          .max(11, "IFSC code must be of 11 characters"),
      }),
    )
    .mutation(async ({ input }) => {
      const ifsc = await fetch(`https://ifsc.razorpay.com/${input.ifsc}`);
      if (!ifsc.ok) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid IFSC" });
      }
      const data: IFSCVerificationResponse = await ifsc.json();
      return data;
    }),
};
