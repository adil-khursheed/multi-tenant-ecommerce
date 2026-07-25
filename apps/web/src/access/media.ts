import type { Access } from "payload";

import { getActiveTenantIds, getUserTenantIds } from "@/access/products";
import { checkRole } from "@/access/utilities";

/**
 * Media create access:
 * - Admin: always allowed
 * - Vendor: allowed if they have at least one active tenant
 * - Others: denied
 */
export const mediaCreateAccess: Access = async ({ req }) => {
  const { user, payload } = req;
  if (!user) return false;

  if (checkRole(["admin"], user)) return true;

  if (!checkRole(["vendor"], user)) return false;

  const activeIds = await getActiveTenantIds(user, payload);
  return activeIds.length > 0;
};

/**
 * Media read access:
 * - Unauthenticated / Customer: full public read (same as current behavior)
 * - Admin: sees all media
 * - Vendor: sees only their own media (scoped by tenant)
 */
export const mediaReadAccess: Access = ({ req: { user } }) => {
  // Public / customer: full read access (frontend + admin for customers)
  if (!user) return true;

  if (checkRole(["admin"], user)) return true;

  // Vendor: scoped to own tenant(s) — they only see their own media in admin panel
  if (checkRole(["vendor"], user)) {
    const tenantIds = getUserTenantIds(user);
    if (tenantIds.length === 0) return false;

    return {
      tenant: {
        in: tenantIds,
      },
    };
  }

  // Customer or any other authenticated role: full read
  return true;
};

/**
 * Media update/delete access:
 * - Admin: full access
 * - Vendor: only their own media (scoped by tenant)
 * - Others: denied
 */
export const mediaUpdateDeleteAccess: Access = ({ req: { user } }) => {
  if (!user) return false;

  if (checkRole(["admin"], user)) return true;

  if (!checkRole(["vendor"], user)) return false;

  const tenantIds = getUserTenantIds(user);
  if (tenantIds.length === 0) return false;

  return {
    tenant: {
      in: tenantIds,
    },
  };
};
