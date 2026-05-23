import type { FieldAccess } from "payload";

export const tenantOnlyFieldAccess: FieldAccess = ({ req: { user }, doc }) => {
  if (!user) return false;

  const tenantIds = (user.tenants ?? [])
    .map((t) => (typeof t.tenant === "string" ? t.tenant : t.tenant?.id))
    .filter(Boolean);

  if (tenantIds.length === 0) return false;

  // Field-level access must return a boolean, not query constraints.
  // We verify if the current document's ID is one of the user's tenant IDs.
  if (doc?.id) {
    return tenantIds.includes(doc.id as string);
  }

  return false;
};
