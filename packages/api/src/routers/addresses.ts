import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { protectedProcedure } from "../trpc";

const ADDRESSES_DEPTH = 0;

const COUNTRY_VALUES = [
  "US",
  "GB",
  "CA",
  "AU",
  "AT",
  "BE",
  "BR",
  "BG",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HK",
  "HU",
  "IN",
  "IE",
  "IT",
  "JP",
  "LV",
  "LT",
  "LU",
  "MY",
  "MT",
  "MX",
  "NL",
  "NZ",
  "NO",
  "PL",
  "PT",
  "RO",
  "SG",
  "SK",
  "SI",
  "ES",
  "SE",
  "CH",
] as const;

const addressInputSchema = z.object({
  title: z.string().nullable().optional(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  company: z.string().nullable().optional(),
  addressLine1: z.string().min(1, "Address line 1 is required"),
  addressLine2: z.string().nullable().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().nullable().optional(),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.enum(COUNTRY_VALUES, { message: "Country is required" }),
  phone: z.string().nullable().optional(),
});

export const addressesRouter = {
  list: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;

    const result = await ctx.payload.find({
      collection: "addresses",
      where: {
        customer: { equals: userId },
      },
      depth: ADDRESSES_DEPTH,
      sort: "-createdAt",
    });

    return { addresses: result.docs };
  }),

  create: protectedProcedure
    .input(addressInputSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const address = await ctx.payload.create({
        collection: "addresses",
        data: {
          customer: userId,
          ...input,
        },
        depth: ADDRESSES_DEPTH,
        overrideAccess: false,
      });

      return { address };
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        data: addressInputSchema.partial(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, data } = input;
      const userId = ctx.session.user.id;

      const existing = await ctx.payload.findByID({
        collection: "addresses",
        id,
        depth: 0,
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Address not found",
        });
      }

      if (String(existing.customer) !== String(userId)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only update your own addresses",
        });
      }

      const address = await ctx.payload.update({
        collection: "addresses",
        id,
        data,
        depth: ADDRESSES_DEPTH,
        overrideAccess: false,
      });

      return { address };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const existing = await ctx.payload.findByID({
        collection: "addresses",
        id: input.id,
        depth: 0,
      });

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Address not found",
        });
      }

      if (String(existing.customer) !== String(userId)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own addresses",
        });
      }

      await ctx.payload.delete({
        collection: "addresses",
        id: input.id,
        overrideAccess: false,
      });

      return { success: true };
    }),
};
