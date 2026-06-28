import { z } from "zod";
import { GST_REGEX, PAN_REGEX } from "@repo/types";

export const businessInfoBaseSchema = z
  .object({
    businessName: z
      .string()
      .min(1, "Business name is required."),
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
    storeLogo: z
      .string()
      .optional()
      .refine(
        (val) => !val || val.startsWith("data:image/"),
        "Store logo must be a valid image format.",
      ),
    storeBanner: z
      .string()
      .optional()
      .refine(
        (val) => !val || val.startsWith("data:image/"),
        "Store banner must be a valid image format.",
      ),
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
  })
export const businessInfoSchema = businessInfoBaseSchema
  .superRefine((data, ctx) => {
    if (data.isGST && (!data.gst || data.gst.trim() === "")) {
      ctx.addIssue({
        code: "custom",
        message: "GSTIN is required.",
        path: ["gst"],
      });
    }
  });

export const addressSchema = z.object({
  addressLine1: z
    .string()
    .min(1, "Address line 1 is required."),
  addressLine2: z
    .string()
    .optional(),
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

export const bankAccountBaseSchema = z
  .object({
    bankAccountHolderName: z
      .string()
      .min(1, "Account holder name is required."),
    bankAccountNumber: z.string().min(1, "Account number is required."),
    bankIfscCode: z
      .string()
      .min(11, "IFSC code must be at least 11 characters.")
      .max(11, "IFSC code must be at most 11 characters"),
    isIFSCVerified: z.boolean(),
    bankBranchAddress: z
      .string()
      .optional(),
    bankName: z.string().min(1, "Bank name is required."),
    bankBranch: z
      .string()
      .min(1, "Bank branch is required."),
    bankAccountType: z.enum(["savings", "current"]),
  })
export const bankAccountSchema = bankAccountBaseSchema
  .refine((data) => data.isIFSCVerified, {
    message: "Please verify your IFSC code before proceeding.",
    path: ["bankIfscCode"],
  });

// Combined schema for the entire vendor onboarding form
export const vendorOnboardingSchema = businessInfoBaseSchema
  .merge(addressSchema)
  .merge(bankAccountBaseSchema);

export type VendorOnboardingFormData = z.input<typeof vendorOnboardingSchema>;

export type IFSCVerificationResponse = {
  BRANCH: string;
  CENTRE: string;
  DISTRICT: string;
  STATE: string;
  ADDRESS: string;
  CONTACT: string;
  IMPS: boolean;
  CITY: string;
  UPI: boolean;
  MICR: string;
  RTGS: boolean;
  NEFT: boolean;
  SWIFT: string;
  ISO3166: string;
  BANK: string;
  BANKCODE: string;
  IFSC: string;
};
