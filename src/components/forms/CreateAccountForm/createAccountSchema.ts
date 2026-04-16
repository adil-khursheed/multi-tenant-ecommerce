import { z } from "zod";

export const accountTypeSchema = z.object({
  accountType: z.enum(["customer", "vendor"]),
});

export const personalInfoSchema = z
  .object({
    firstName: z.string().min(1, "First name is required."),
    lastName: z.string().optional(),
    email: z
      .email("Please enter a valid email address.")
      .min(1, "Email is required."),
    phone: z.string().min(10, "Please enter a valid phone number"),
    otp: z
      .string()
      .min(6, "Please enter a valid OTP")
      .max(6, "Please enter a valid OTP"),
    isPhoneVerified: z.boolean(),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters.")
      .max(128, "Password must be at most 128 characters."),
    passwordConfirm: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords do not match.",
    path: ["passwordConfirm"],
  })
  .refine((data) => data.isPhoneVerified, {
    message: "Please verify your phone number.",
    path: ["phone"],
  });

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
    .regex(/^[a-zA-z]{5}\d{4}[a-zA-Z]{1}$/, "Invalid PAN"),
  isGST: z.boolean(),
  gst: z
    .string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      return (
        val.length === 15 &&
        /^[0123][0-9][a-z]{5}[0-9]{4}[a-z][0-9][a-z0-9][a-z0-9]$/gi.test(val)
      );
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

const customerSchema = z
  .object({
    accountType: z.literal("customer"),
  })
  .loose();

const vendorSchema = z
  .object({
    accountType: z.literal("vendor"),
    ...businessInfoSchema.shape,
    ...addressSchema.shape,
    ...bankAccountSchema.shape,
  })
  .superRefine((data, ctx) => {
    if (data.isGST && (!data.gst || data.gst.trim() === "")) {
      ctx.addIssue({
        code: "custom",
        message: "GST is required.",
        path: ["gst"],
      });
    }
  });

export const createAccountSchema = z
  .discriminatedUnion("accountType", [customerSchema, vendorSchema])
  .and(personalInfoSchema);

// Manually define the type since the customer branch uses .passthrough()
// and doesn't include vendor-only fields in its Zod schema.
export type CreateAccountFormData = z.infer<typeof personalInfoSchema> &
  (
    | ({ accountType: "customer" } & Partial<
        z.infer<typeof businessInfoSchema> &
          z.infer<typeof addressSchema> &
          z.infer<typeof bankAccountSchema>
      >)
    | ({ accountType: "vendor" } & z.infer<typeof businessInfoSchema> &
        z.infer<typeof addressSchema> &
        z.infer<typeof bankAccountSchema>)
  );
