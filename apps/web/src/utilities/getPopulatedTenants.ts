import { Tenant, User } from "@/payload-types";

export const getPopulatedTenants = async (user: User) => {
  // Future-proof: resolve populated tenants and check across all of them
  const populatedTenants = (user.tenants ?? [])
    .map((t) => t.tenant)
    .filter((t): t is Tenant => typeof t === "object" && t !== null);

  // If ANY tenant is already active, the vendor should be in the admin panel
  const hasActiveTenant = populatedTenants.some((t) => t.isTenantActive);

  // Find the most recently created pending tenant (for display purposes)
  const pendingTenant = populatedTenants
    .filter((t) => !t.isTenantActive)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0];

  return { hasActiveTenant, pendingTenant };
};
