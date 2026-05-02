import { z } from "zod";

import { GST_REGEX, PAN_REGEX } from "@/lib/constants";

export const businessInfoSchema = z.object({
  businessName: z.string().min(1, "Business name is required."),
  businessType: z.string().min(1, "Business type is required."),
  storeName: z.string().min(1, "Store name is required."),
  storeSlug: z
    .string()
    .min(3, "Store slug must be at least 3 characters.")
    .max(63, "Store slug must be less than 63 characters")
    .regex(
      /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
      "Store slug can only contain lowercase letters, numbers and hyphens. It must start and end with a letter or number",
    )
    .refine(
      (val) => !val.includes("--"),
      "Store slug cannot contain consecutive hyphens",
    )
    .transform((val) => val.toLowerCase()),
  storeLogo: z.string().optional(),
  panNumber: z
    .string()
    .min(10, "PAN is required.")
    .regex(PAN_REGEX, "Invalid PAN"),
  isGST: z.boolean(),
  gst: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      return val.length === 15 && GST_REGEX.test(val);
    }, "Invalid GST"),
});

export const addressSchema = z.object({
  addressLine1: z.string().min(1, "Address line 1 is required."),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required."),
  state: z.object({
    name: z.string().min(1, "State is required."),
    isoCode: z.string().min(1, "State is required."),
  }),
  country: z.object({
    name: z.string().min(1, "Country is required."),
    isoCode: z.string().min(1, "Country is required."),
  }),
  pincode: z.string().min(6, "Pincode is required."),
});

export const bankAccountSchema = z.object({
  bankAccountNumber: z.string().min(1, "Account number is required."),
  bankIfscCode: z.string().min(1, "IFSC code is required."),
  bankName: z.string().min(1, "Bank name is required."),
  bankBranch: z.string().min(1, "Bank branch is required."),
  bankAccountHolderName: z.string().min(1, "Account holder name is required."),
  bankAccountType: z.enum(["savings", "current"]),
});

// Combined schema for the entire vendor onboarding form
export const vendorOnboardingSchema = businessInfoSchema
  .extend(addressSchema.shape)
  .extend(bankAccountSchema.shape);

export type VendorOnboardingFormData = z.infer<typeof vendorOnboardingSchema>;
