import type { CollectionBeforeChangeHook } from "payload";

export const autoVerifyCustomers: CollectionBeforeChangeHook = async ({
  data,
  operation,
}) => {
  if (operation === "create") {
    if (!data?.roles?.includes("vendor")) {
      data._verified = true;
      data._verificationToken = null;
    }
  }

  return data;
};
