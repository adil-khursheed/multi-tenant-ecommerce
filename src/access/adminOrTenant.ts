import { Access } from "payload";

import { checkRole } from "./utilities";

export const adminOrTenantByField = (fieldName: string): Access => {
  return ({ req: { user } }) => {
    if (!user) return false;

    if (checkRole(["admin"], user)) return true;

    const tenantIds = (user.tenants ?? [])
      .map((t) => (typeof t.tenant === "string" ? t.tenant : t.tenant?.id))
      .filter(Boolean);

    if (tenantIds.length === 0) return false;

    return {
      [fieldName]: {
        in: tenantIds,
      },
    };
  };
};

export const adminOrTenant = adminOrTenantByField("tenant");
