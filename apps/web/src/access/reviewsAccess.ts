import type { Access } from "payload";

import { checkRole } from "@/access/utilities";
import { getUserTenantIds } from "@/access/products";

/**
 * Reviews read access:
 * - Admin: full access
 * - Vendor: only reviews on products belonging to their tenant(s)
 * - Storefront (isStorefront context): public read (all reviews visible)
 * - Unauthenticated (no context): denied
 */
export const reviewsReadAccess: Access = ({ req: { user, context } }) => {
  // Storefront requests: reviews are public-facing data
  if (context?.isStorefront) {
    return true;
  }

  if (!user) return false;

  // Admin: full access to all reviews
  if (checkRole(["admin"], user)) return true;

  // Vendor: can see reviews for products belonging to their tenant(s)
  if (checkRole(["vendor"], user)) {
    const tenantIds = getUserTenantIds(user);
    if (tenantIds.length === 0) return false;
    return {
      "product.tenant": {
        in: tenantIds,
      },
    };
  }

  return false;
};

/**
 * Reviews create access:
 * - Admin: full access
 * - Customer: can write reviews
 * - Vendor/Unauthenticated: denied
 */
export const reviewsCreateAccess: Access = ({ req: { user } }) => {
  if (!user) return false;

  if (checkRole(["admin"], user)) return true;
  if (checkRole(["customer"], user)) return true;

  return false;
};
