export type BusinessType =
  | "individual"
  | "partnership"
  | "proprietorship"
  | "llp"
  | "private_limited"
  | "public_limited"
  | "ngo"
  | "trust"
  | "society"
  | "educational_institutes"
  | "not_yet_registered"
  | "other";

export type RazorpayWebhookEvent = {
  id: string;
  entity: "event";
  event:
    | "payment.captured"
    | "payment.failed"
    | "transfer.processed"
    | "transfer.failed"
    | "settlement.processed"
    | "refund.processed"
    | "payment.dispute.created"
    | "product.route.activated"
    | "product.route.under_review"
    | "product.route.needs_clarification"
    | string;
  contains: string[];
  created_at: number;
  payload: {
    payment?: { entity: any };
    transfer?: { entity: any };
    refund?: { entity: any };
    dispute?: { entity: any };
    settlement?: { entity: any };
    merchant_product?: { entity: any; data: any };
  };
};
