import type { Access, BasePayload, Where } from "payload";

import { checkRole } from "@/access/utilities";
import type { User } from "@/payload-types";

/** Tenant IDs from user.tenants (IDs only, works when tenant is not populated). */
export function getUserTenantIds(user: User): string[] {
  return (user.tenants ?? [])
    .map((t) => (typeof t.tenant === "string" ? t.tenant : t.tenant?.id))
    .filter((id): id is string => Boolean(id));
}

/** DB lookup: tenant IDs where isTenantActive is true (use overrideAccess: true intentionally). */
export async function getActiveTenantIds(
  user: User,
  payload: BasePayload,
): Promise<string[]> {
  const tenantIds = getUserTenantIds(user);
  if (tenantIds.length === 0) return [];

  const { docs } = await payload.find({
    collection: "tenants",
    where: {
      and: [{ id: { in: tenantIds } }, { isTenantActive: { equals: true } }],
    },
    depth: 0,
    limit: tenantIds.length,
    overrideAccess: true, // required: vendors cannot read isTenantActive on tenants
  });

  return docs.map((d) => d.id);
}

const tenantWhere = (tenantIds: string[]): Where => ({
  tenant: { in: tenantIds },
});

export const productsReadAccess: Access = ({ req: { user } }) => {
  if (!user) {
    // Storefront: published only (adjust if you require login to browse)
    return { _status: { equals: "published" } };
  }

  if (checkRole(["admin"], user)) return true;

  if (checkRole(["vendor"], user)) {
    const tenantIds = getUserTenantIds(user);
    if (tenantIds.length === 0) return false;
    return tenantWhere(tenantIds);
  }

  //   if (checkRole(["customer"], user)) return true;

  return { _status: { equals: "published" } };
};

export const productsCreateAccess: Access = async ({ req }) => {
  const { user, payload } = req;
  if (!user) return false;

  if (checkRole(["admin"], user)) return true;

  if (!checkRole(["vendor"], user)) return false;

  const activeIds = await getActiveTenantIds(user, payload);
  return activeIds.length > 0;
};

export const productsUpdateDeleteAccess: Access = ({ req: { user } }) => {
  if (!user) return false;

  if (checkRole(["admin"], user)) return true;

  if (!checkRole(["vendor"], user)) return false;

  const tenantIds = getUserTenantIds(user);
  if (tenantIds.length === 0) return false;

  return tenantWhere(tenantIds);
};
