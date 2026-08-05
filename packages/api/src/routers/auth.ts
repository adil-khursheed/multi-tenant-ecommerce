import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createAccountSchema, loginSchema } from "@repo/validators";
import { baseProcedure, protectedProcedure } from "../trpc";

export const authRouter = {
  register: baseProcedure
    .input(createAccountSchema)
    .mutation(async ({ ctx, input }) => {
      const { email, password, firstName, lastName, accountType, phone } =
        input;

      await ctx.payload.create({
        collection: "users",
        data: {
          email,
          password,
          name: firstName + `${lastName ? ` ${lastName}` : ""}`,
          roles: accountType === "vendor" ? ["vendor"] : ["customer"],
          phone,
        },
        disableVerificationEmail: accountType === "customer",
      });

      if (accountType === "customer") {
        const userData = await ctx.payload.login({
          collection: "users",
          data: {
            email,
            password,
          },
        });

        if (!userData.token) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Failed to login",
          });
        }

        if (ctx.setCookie) {
          await ctx.setCookie(
            `${ctx.payload.config.cookiePrefix}-token`,
            userData.token,
            {
              httpOnly: true,
              path: "/",
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
            },
          );
        }

        return {
          success: true,
          message: "Account created successfully",
          accountType,
          data: userData.user,
          token: userData.token,
        };
      }

      return {
        success: true,
        message: "Please verify your email to login",
        accountType,
        data: null,
      };
    }),

  login: baseProcedure.input(loginSchema).mutation(async ({ ctx, input }) => {
    const userData = await ctx.payload.login({
      collection: "users",
      data: {
        email: input.email,
        password: input.password,
      },
    });

    if (!userData.token) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Failed to login",
      });
    }

    if (ctx.setCookie) {
      await ctx.setCookie(
        `${ctx.payload.config.cookiePrefix}-token`,
        userData.token,
        {
          httpOnly: true,
          path: "/",
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        },
      );
    }

    return {
      success: true,
      message: "User logged in successfully",
      data: userData.user,
      token: userData.token,
    };
  }),

  logout: baseProcedure.mutation(async ({ ctx }) => {
    if (ctx.setCookie) {
      await ctx.setCookie(`${ctx.payload.config.cookiePrefix}-token`, "", {
        httpOnly: true,
        path: "/",
        expires: new Date(0),
      });
    }

    return {
      success: true,
      message: "User logged out successfully",
    };
  }),

  me: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.payload.findByID({
      collection: "users",
      id: ctx.session.user.id,
      overrideAccess: false,
      user: ctx.session.user,
    });

    return { user };
  }),

  forgotPassword: baseProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.payload.forgotPassword({
        collection: "users",
        data: { email: input.email },
        disableEmail: false,
      });

      return {
        success: true,
        message: "Password reset email sent",
      };
    }),

  resetPassword: baseProcedure
    .input(
      z.object({
        password: z.string().min(6),
        passwordConfirm: z.string().min(1),
        token: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.payload.resetPassword({
        collection: "users",
        data: {
          password: input.password,
          token: input.token,
        },
        overrideAccess: true,
      });

      return {
        success: true,
        message: "Password reset successfully",
      };
    }),

  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Invalid email address"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.payload.update({
        collection: "users",
        id: ctx.session.user.id,
        data: {
          name: input.name,
          email: input.email,
        },
        overrideAccess: false,
        user: ctx.session.user,
      });

      return { user };
    }),

  changePassword: protectedProcedure
    .input(
      z.object({
        password: z.string().min(6, "Password must be at least 6 characters"),
        passwordConfirm: z.string().min(1, "Please confirm your password"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.password !== input.passwordConfirm) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Passwords do not match",
        });
      }

      const user = await ctx.payload.update({
        collection: "users",
        id: ctx.session.user.id,
        data: {
          password: input.password,
        },
        overrideAccess: false,
        user: ctx.session.user,
      });

      return { user };
    }),

  verifyEmail: baseProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!input.token)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Please provide a verification token",
        });

      const result = await ctx.payload.verifyEmail({
        collection: "users",
        token: input.token,
      });

      if (!result) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid verification token",
        });
      }

      return {
        success: true,
        message: "Email verified successfully",
      };
    }),
};
