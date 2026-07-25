import type {
  PaymentAdapter,
  PaymentAdapterClient,
} from "@payloadcms/plugin-ecommerce/types";

import { confirmOrder } from "./confirmOrder";
import { initiatePayment } from "./initiatePayment";
import type { CODAdapterArgs } from "./types";

export const codAdapter = (props?: CODAdapterArgs): PaymentAdapter => {
  const label = props?.label || "Cash on Delivery";

  const baseFields = [
    {
      name: "codConfirmed",
      type: "checkbox" as const,
      label: "COD Confirmed",
      defaultValue: false,
    },
  ];

  const groupField = {
    name: "cod",
    type: "group" as const,
    ...props?.groupOverrides,
    admin: {
      condition: (data: Record<string, unknown>) => {
        return data?.paymentMethod === "cod";
      },
      ...props?.groupOverrides?.admin,
    },
    fields:
      props?.groupOverrides?.fields &&
      typeof props.groupOverrides.fields === "function"
        ? props.groupOverrides.fields({ defaultFields: baseFields })
        : baseFields,
  };

  return {
    name: "cod",
    confirmOrder: confirmOrder(),
    group: groupField,
    initiatePayment: initiatePayment(),
    label,
  };
};

export const codAdapterClient = (): PaymentAdapterClient => {
  return {
    name: "cod",
    confirmOrder: true,
    initiatePayment: true,
    label: "Cash on Delivery",
  };
};
