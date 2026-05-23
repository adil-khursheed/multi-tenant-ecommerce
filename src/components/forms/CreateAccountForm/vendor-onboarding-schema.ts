import DOMPurify from "isomorphic-dompurify";
import { z } from "zod";

import { GST_REGEX, PAN_REGEX } from "@/lib/constants";

const sanitize = (val: string) => DOMPurify.sanitize(val) as string;

export const businessInfoSchema = z
  .object({
    businessName: z
      .string()
      .min(1, "Business name is required.")
      .transform(sanitize),
    businessType: z.string().min(1, "Business type is required."),
    storeName: z.string().min(1, "Store name is required.").transform(sanitize),
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
    .min(1, "Address line 1 is required.")
    .transform(sanitize),
  addressLine2: z
    .string()
    .optional()
    .transform((val) => (val ? sanitize(val) : undefined)),
  city: z.string().min(1, "City is required.").transform(sanitize),
  state: z.object({
    name: z.string().min(1, "State is required.").transform(sanitize),
    isoCode: z.string().min(1, "State is required."),
  }),
  country: z.object({
    name: z.string().min(1, "Country is required.").transform(sanitize),
    isoCode: z.string().min(1, "Country is required."),
  }),
  pincode: z.string().min(6, "Pincode is required.").transform(sanitize),
});

export const bankAccountSchema = z
  .object({
    bankAccountHolderName: z
      .string()
      .min(1, "Account holder name is required.")
      .transform(sanitize),
    bankAccountNumber: z.string().min(1, "Account number is required."),
    bankIfscCode: z
      .string()
      .min(11, "IFSC code must be at least 11 characters.")
      .max(11, "IFSC code must be at most 11 characters"),
    isIFSCVerified: z.boolean(),
    bankBranchAddress: z
      .string()
      .optional()
      .transform((val) => (val ? sanitize(val) : undefined)),
    bankName: z.string().min(1, "Bank name is required.").transform(sanitize),
    bankBranch: z
      .string()
      .min(1, "Bank branch is required.")
      .transform(sanitize),
    bankAccountType: z.enum(["savings", "current"]),
  })
  .refine((data) => data.isIFSCVerified, {
    message: "Please verify your IFSC code before proceeding.",
    path: ["bankIfscCode"],
  });

// Combined schema for the entire vendor onboarding form
export const vendorOnboardingSchema = businessInfoSchema
  .extend(addressSchema.shape)
  .extend(bankAccountSchema.shape);

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
