import { TRPCError } from "@trpc/server";
import { z } from "zod";

import type { BusinessType } from "@repo/types";
import {
  IFSCVerificationResponse,
  vendorOnboardingSchema,
} from "@repo/validators";
import { protectedProcedure } from "../trpc";
import { createMediaDoc } from "../utils/createMediaDoc";

export const vendorRouter = {
  checkExistingSlug: protectedProcedure
    .input(
      z.object({
        storeSlug: z.string().trim().min(1, "Store slug is required"),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const allTenants = await ctx.payload.find({
        collection: "tenants",
        where: {
          OR: [
            {
              storeSlug: {
                equals: input.storeSlug,
              },
            },
          ],
        },
      });

      return { exists: allTenants.docs.length > 0 };
    }),

  create: protectedProcedure
    .input(vendorOnboardingSchema)
    .mutation(async ({ ctx, input }) => {
      const currentUserTenants = ctx.session.user.tenants;

      if (currentUserTenants && currentUserTenants.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You are already a tenant",
        });
      }

      const allTenants = await ctx.payload.find({
        collection: "tenants",
        where: {
          storeSlug: {
            equals: input.storeSlug,
          },
        },
      });

      if (allTenants.docs.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Store slug already exists",
        });
      }

      let uploadedLogoId: string | null = null;
      let uploadedBannerId: string | null = null;

      if (input.storeLogo) {
        try {
          uploadedLogoId = await createMediaDoc({
            payload: ctx.payload,
            base64String: input.storeLogo,
            alt: `${input.storeName} Logo`,
            uploadedMediaId: uploadedLogoId,
            storeName: input.storeName,
          });
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to process and upload store logo",
          });
        }
      }

      if (input.storeBanner) {
        try {
          uploadedBannerId = await createMediaDoc({
            payload: ctx.payload,
            base64String: input.storeBanner,
            alt: `${input.storeName} Banner`,
            uploadedMediaId: uploadedBannerId,
            storeName: input.storeName,
          });
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to process and upload store banner",
          });
        }
      }

      // Add DOMPurify sanitization here if needed on the server
      // The original schema had DOMPurify, but it was removed for mobile compatibility.
      // We can apply it here on the input values if we want.

      try {
        const newTenant = await ctx.payload.create({
          collection: "tenants",
          data: {
            ownerName: ctx.session.user.name,
            email: ctx.session.user.email,
            phone: ctx.session.user.phone,
            storeName: input.storeName,
            storeSlug: input.storeSlug,
            businessName: input.businessName,
            businessType: input.businessType as BusinessType,
            panNumber: input.panNumber,
            ...(input.gst ? { gstNumber: input.gst.trim().toUpperCase() } : {}),
            storeLogo: uploadedLogoId || undefined,
            storeBanner: uploadedBannerId || undefined,
            bankDetails: {
              accountNumber: input.bankAccountNumber,
              bankName: input.bankName,
              accountHolderName: input.bankAccountHolderName,
              ifscCode: input.bankIfscCode,
              bankBranch: input.bankBranch,
              bankAccountType: input.bankAccountType,
            },
            address: {
              street1: input.addressLine1,
              street2: input.addressLine2,
              city: input.city,
              state: input.state.name,
              postalCode: input.pincode,
              country: input.country.isoCode,
            },
            commissionRate: 15,
          },
        });

        const updatedTenants = [
          ...(currentUserTenants || []).map((t: any) => ({
            tenant: typeof t.tenant === "string" ? t.tenant : t.tenant.id,
          })),
          { tenant: newTenant.id },
        ];

        const currentRoles = ctx.session.user.roles || [];
        const updatedRoles = Array.from(
          new Set([...currentRoles, "vendor"]),
        ) as ("admin" | "vendor" | "customer")[];

        await ctx.payload.update({
          collection: "users",
          id: ctx.session.user.id,
          data: {
            tenants: updatedTenants,
            roles: updatedRoles,
          },
        });

        return {
          success: true,
          message: "Vendor account created successfully",
        };
      } catch (error) {
        if (uploadedLogoId) {
          try {
            await ctx.payload.delete({
              collection: "media",
              id: uploadedLogoId,
            });
          } catch (rollbackError) {}
        }

        if (uploadedBannerId) {
          try {
            await ctx.payload.delete({
              collection: "media",
              id: uploadedBannerId,
            });
          } catch (rollbackError) {}
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create vendor account. Please try again.",
        });
      }
    }),

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
