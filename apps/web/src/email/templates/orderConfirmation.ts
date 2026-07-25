import { emailLayout } from "../templates";

const brand = {
  name: "DTLEA",
  colors: {
    foreground: "#2D2D2D",
    primary: "#6B4E3A",
    primaryForeground: "#E8E1D5",
    secondary: "#F0DEB6",
    secondaryForeground: "#5B381B",
    mutedForeground: "#757575",
    border: "#DBDBDB",
    success: "#2D6A4F",
    successBg: "#D8F3DC",
  },
  fonts: {
    sans: "'DM Sans', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "'Cormorant Garamond', 'Georgia', 'Times New Roman', Times, serif",
  },
} as const;

interface OrderItem {
  name: string;
  quantity: number;
}

interface ShippingAddress {
  firstName?: string | null;
  lastName?: string | null;
  addressLine1?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
}

interface OrderConfirmationParams {
  customerName?: string;
  orderId: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingCharge: number;
  total: number;
  paymentMethod: "razorpay" | "cod";
  shippingAddress?: ShippingAddress;
  orderUrl: string;
}

function formatAmount(amount: number): string {
  return `\u20B9${(amount / 100).toFixed(2)}`;
}

export function orderConfirmationHTML({
  customerName,
  orderId,
  items,
  subtotal,
  discount,
  shippingCharge,
  total,
  paymentMethod,
  shippingAddress,
  orderUrl,
}: OrderConfirmationParams): string {
  const greeting = customerName ? `Hi ${customerName},` : "Hi there,";

  const itemsHtml = items
    .map(
      (item) => `
      <tr>
        <td style="padding:12px 0; border-bottom:1px solid ${brand.colors.border}; font-size:14px; color:${brand.colors.foreground};">
          ${item.name}
        </td>
        <td style="padding:12px 0; border-bottom:1px solid ${brand.colors.border}; font-size:14px; color:${brand.colors.mutedForeground}; text-align:center;">
          ${item.quantity}
        </td>
      </tr>`,
    )
    .join("");

  const addressHtml = shippingAddress
    ? `
      <p style="margin:0 0 6px; font-size:14px; line-height:22px; color:${brand.colors.foreground};">
        ${shippingAddress.firstName || ""} ${shippingAddress.lastName || ""}
      </p>
      <p style="margin:0 0 6px; font-size:14px; line-height:22px; color:${brand.colors.mutedForeground};">
        ${shippingAddress.addressLine1 || ""}
      </p>
      <p style="margin:0; font-size:14px; line-height:22px; color:${brand.colors.mutedForeground};">
        ${shippingAddress.city || ""}, ${shippingAddress.state || ""} ${shippingAddress.postalCode || ""}
      </p>
    `
    : "";

  const content = `
    <p style="margin:0 0 16px; font-size:16px; line-height:26px; color:${brand.colors.foreground};">
      ${greeting}
    </p>
    <p style="margin:0 0 24px; font-size:16px; line-height:26px; color:${brand.colors.foreground};">
      Your order has been confirmed and we're getting it ready for you. Here are the details:
    </p>

    <!-- Success Badge -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:28px;">
      <tr>
        <td style="padding:16px 20px; background-color:${brand.colors.successBg}; border-left:4px solid ${brand.colors.success};">
          <p style="margin:0; font-size:14px; font-weight:600; line-height:22px; color:${brand.colors.success};">
            Order #${orderId}
          </p>
        </td>
      </tr>
    </table>

    <!-- Items -->
    <p style="margin:0 0 12px; font-size:12px; font-weight:600; letter-spacing:1px; text-transform:uppercase; color:${brand.colors.mutedForeground};">
      Items
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:24px;">
      <tr>
        <th style="padding:0 0 8px; text-align:left; font-size:12px; font-weight:600; color:${brand.colors.mutedForeground}; text-transform:uppercase; letter-spacing:0.5px;">Product</th>
        <th style="padding:0 0 8px; text-align:center; font-size:12px; font-weight:600; color:${brand.colors.mutedForeground}; text-transform:uppercase; letter-spacing:0.5px;">Qty</th>
      </tr>
      ${itemsHtml}
    </table>

    <!-- Price Breakdown -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:24px;">
      <tr>
        <td style="padding:8px 0; font-size:14px; color:${brand.colors.mutedForeground};">Subtotal</td>
        <td style="padding:8px 0; font-size:14px; color:${brand.colors.foreground}; text-align:right;">${formatAmount(subtotal)}</td>
      </tr>
      ${
        discount > 0
          ? `<tr>
        <td style="padding:8px 0; font-size:14px; color:${brand.colors.mutedForeground};">Discount</td>
        <td style="padding:8px 0; font-size:14px; color:${brand.colors.success}; text-align:right;">-${formatAmount(discount)}</td>
      </tr>`
          : ""
      }
      <tr>
        <td style="padding:8px 0; font-size:14px; color:${brand.colors.mutedForeground};">Shipping</td>
        <td style="padding:8px 0; font-size:14px; color:${brand.colors.foreground}; text-align:right;">${shippingCharge > 0 ? formatAmount(shippingCharge) : "Free"}</td>
      </tr>
      <tr>
        <td style="padding:12px 0 0; border-top:2px solid ${brand.colors.border}; font-size:16px; font-weight:600; color:${brand.colors.foreground};">Total</td>
        <td style="padding:12px 0 0; border-top:2px solid ${brand.colors.border}; font-size:16px; font-weight:600; color:${brand.colors.foreground}; text-align:right;">${formatAmount(total)}</td>
      </tr>
    </table>

    <!-- Payment & Shipping -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:24px;">
      <tr>
        <td style="padding:12px 16px; background-color:${brand.colors.secondary}; border-left:4px solid ${brand.colors.primary};">
          <p style="margin:0 0 4px; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; color:${brand.colors.secondaryForeground};">Payment Method</p>
          <p style="margin:0; font-size:14px; color:${brand.colors.foreground};">${paymentMethod === "cod" ? "Cash on Delivery" : "Razorpay (Paid)"}</p>
        </td>
      </tr>
    </table>

    ${
      shippingAddress
        ? `
    <p style="margin:0 0 8px; font-size:12px; font-weight:600; letter-spacing:1px; text-transform:uppercase; color:${brand.colors.mutedForeground};">
      Shipping Address
    </p>
    <div style="margin-bottom:28px; padding:16px; background-color:${brand.colors.secondary}; border-radius:4px;">
      ${addressHtml}
    </div>
    `
        : ""
    }

    <!-- CTA Button -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td align="center" style="padding: 0 0 28px;">
          <a href="${orderUrl}"
            target="_blank"
            style="display:inline-block; padding:14px 40px; background-color:${brand.colors.primary}; color:${brand.colors.primaryForeground}; font-family:${brand.fonts.sans}; font-size:14px; font-weight:600; text-decoration:none; letter-spacing:1.2px; text-transform:uppercase;">
            View Your Order
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 16px; font-size:14px; line-height:22px; color:${brand.colors.mutedForeground};">
      If you have any questions about your order, reply to this email or contact us at <a href="mailto:support@${brand.name.toLowerCase()}.com" style="color:${brand.colors.primary}; text-decoration:underline;">support@${brand.name.toLowerCase()}.com</a>.
    </p>

    <p style="margin:16px 0 0; font-size:16px; line-height:26px; color:${brand.colors.foreground};">
      Thank you for shopping with us!<br />
      <strong style="color:${brand.colors.primary};">The ${brand.name} Team</strong>
    </p>
  `;

  return emailLayout(content);
}
