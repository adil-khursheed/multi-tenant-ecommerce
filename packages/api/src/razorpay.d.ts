declare module "razorpay" {
  interface RazorpayConfig {
    key_id?: string;
    key_secret?: string;
  }

  interface RazorpayOrder {
    id: string;
    amount: number;
    currency: string;
    status: string;
    receipt?: string;
    [key: string]: unknown;
  }

  interface RazorpayPayment {
    id: string;
    amount: number;
    currency: string;
    status: string;
    order_id: string;
    [key: string]: unknown;
  }

  class Razorpay {
    constructor(config: RazorpayConfig);
    orders: {
      create(params: {
        amount: number;
        currency: string;
        receipt?: string;
        notes?: Record<string, string>;
      }): Promise<RazorpayOrder>;
    };
    payments: {
      fetch(paymentId: string): Promise<RazorpayPayment>;
    };
  }

  export default Razorpay;
}

declare module "razorpay/dist/utils/razorpay-utils" {
  export function validateWebhookSignature(
    body: string,
    signature: string,
    secret: string,
  ): void;
}
