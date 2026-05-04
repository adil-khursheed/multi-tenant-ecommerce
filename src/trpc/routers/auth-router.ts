import { TRPCError } from "@trpc/server";

import { createAccountSchema } from "@/components/forms/CreateAccountForm/createAccountSchema";
import { loginSchema } from "@/components/forms/LoginForm/loginSchema";
import { generateAuthCookie } from "@/utilities/generateAuthCookie";
import { baseProcedure } from "../init";

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

        await generateAuthCookie({
          prefix: ctx.payload.config.cookiePrefix,
          value: userData.token,
        });

        return {
          success: true,
          message: "Account created successfully",
          accountType,
          data: userData.user,
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

    await generateAuthCookie({
      prefix: ctx.payload.config.cookiePrefix,
      value: userData.token,
    });

    return {
      success: true,
      message: "User logged in successfully",
      data: userData.user,
    };
  }),
};
