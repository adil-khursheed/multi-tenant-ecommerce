import type { CollectionConfig } from "payload";

import { adminOnly } from "@/access/adminOnly";
import { adminOnlyFieldAccess } from "@/access/adminOnlyFieldAccess";
import { adminOrSelf } from "@/access/adminOrSelf";
import { publicAccess } from "@/access/publicAccess";
import { checkRole } from "@/access/utilities";
import { forgotPasswordHTML, verifyEmailHTML } from "@/email/templates";
import { env } from "@/env";
import { ensureFirstUserIsAdmin } from "./hooks/ensureFirstUserIsAdmin";

export const Users: CollectionConfig = {
  slug: "users",
  access: {
    admin: ({ req: { user } }) => checkRole(["admin"], user),
    create: publicAccess,
    delete: adminOnly,
    read: adminOrSelf,
    unlock: adminOnly,
    update: adminOrSelf,
  },
  admin: {
    group: "Users",
    defaultColumns: ["name", "email", "roles"],
    useAsTitle: "name",
  },
  auth: {
    tokenExpiration: 1209600,
    maxLoginAttempts: 5,
    lockTime: 600000,
    verify: {
      generateEmailHTML: ({ token, user }) => {
        const verificationUrl = `${env.NEXT_PUBLIC_SERVER_URL}/verify-email?token=${token}`;
        return verifyEmailHTML({
          userName: user.name,
          verificationUrl,
        });
      },
      generateEmailSubject: () => {
        return "Verify your email – DTLEA";
      },
    },
    forgotPassword: {
      generateEmailHTML(args) {
        const resetUrl = `${env.NEXT_PUBLIC_SERVER_URL}/reset-password?token=${args?.token}`;
        return forgotPasswordHTML({
          userName: args?.user?.name,
          resetUrl,
        });
      },
      generateEmailSubject: () => {
        return "Reset your password – DTLEA";
      },
    },
  },
  fields: [
    {
      name: "name",
      label: "Full Name",
      type: "text",
      required: true,
    },
    {
      name: "phone",
      label: "Phone Number",
      type: "text",
      required: true,
    },
    {
      name: "roles",
      type: "select",
      defaultValue: ["customer"],
      hasMany: true,
      access: {
        create: adminOnlyFieldAccess,
        read: adminOnlyFieldAccess,
        update: adminOnlyFieldAccess,
      },
      admin: {
        position: "sidebar",
      },
      hooks: {
        beforeChange: [ensureFirstUserIsAdmin],
      },
      options: [
        {
          label: "admin",
          value: "admin",
        },
        {
          label: "vendor",
          value: "vendor",
        },
        {
          label: "customer",
          value: "customer",
        },
      ],
    },
    {
      name: "isActive",
      type: "checkbox",
      defaultValue: true,
      access: {
        create: adminOnlyFieldAccess,
        read: adminOnlyFieldAccess,
        update: adminOnlyFieldAccess,
      },
    },
    {
      name: "orders",
      type: "join",
      collection: "orders",
      on: "customer",
      admin: {
        allowCreate: false,
        defaultColumns: ["id", "createdAt", "total", "currency", "items"],
      },
    },
    {
      name: "cart",
      type: "join",
      collection: "carts",
      on: "customer",
      admin: {
        allowCreate: false,
        defaultColumns: ["id", "createdAt", "total", "currency", "items"],
      },
    },
    {
      name: "addresses",
      type: "join",
      collection: "addresses",
      on: "customer",
      admin: {
        allowCreate: false,
        defaultColumns: ["id"],
      },
    },
  ],
};
