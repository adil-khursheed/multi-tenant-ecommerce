import { z } from "zod";

export const applyCouponSchema = z.object({
  code: z
    .string()
    .min(1, "Coupon code is required.")
    .max(50, "Coupon code is too long."),
});

export type ApplyCouponFormData = z.infer<typeof applyCouponSchema>;
