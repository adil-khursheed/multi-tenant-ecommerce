declare module "react-native-razorpay" {
  interface RazorpayOptions {
    key: string;
    amount: number;
    currency?: string;
    name?: string;
    description?: string;
    order_id?: string;
    prefill?: {
      email?: string;
      contact?: string;
    };
    theme?: {
      color?: string;
    };
  }

  interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }

  export default {
    open(options: RazorpayOptions): Promise<RazorpayResponse>;
  };
}
