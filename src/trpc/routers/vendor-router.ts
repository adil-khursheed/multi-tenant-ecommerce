import { vendorOnboardingSchema } from "@/components/forms/CreateAccountForm/vendor-onboarding-schema";
import { protectedProcedure } from "../init";

export const vendorRouter = {
  create: protectedProcedure
    .input(vendorOnboardingSchema)
    .mutation(async ({ ctx, input }) => {}),
};
