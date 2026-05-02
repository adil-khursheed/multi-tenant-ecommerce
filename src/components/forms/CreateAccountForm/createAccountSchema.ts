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

export const createAccountSchema = accountTypeSchema.extend(
  personalInfoSchema.shape,
);

export type CreateAccountFormData = z.infer<typeof createAccountSchema>;
