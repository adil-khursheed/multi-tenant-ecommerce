import { createAccountSchema } from "@/components/forms/CreateAccountForm/createAccountSchema";
import { baseProcedure } from "../init";

export const authRouter = {
  register: baseProcedure
    .input(createAccountSchema)
    .mutation(async ({ ctx, input }) => {
      const {
        email,
        password,
        firstName,
        lastName,
        accountType,
        businessName,
        businessType,
        phone,
      } = input;

      await ctx.payload.create({
        collection: "users",
        data: {
          email,
          password,
          name: firstName + `${lastName ? ` ${lastName}` : ""}`,
        },
      });
      return {
        message: "User registered successfully",
      };
    }),
};
