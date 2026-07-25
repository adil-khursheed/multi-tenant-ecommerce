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
    destructive: "#C44536",
    destructiveBg: "#FDE8E4",
    warning: "#BC6C25",
    warningBg: "#FEFAE0",
  },
  fonts: {
    sans: "'DM Sans', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "'Cormorant Garamond', 'Georgia', 'Times New Roman', Times, serif",
  },
} as const;

type OrderStatus = "completed" | "cancelled" | "refunded";

interface OrderStatusUpdateParams {
  customerName?: string;
  orderId: string;
  newStatus: OrderStatus;
  orderUrl: string;
}

const statusConfig: Record<
  OrderStatus,
  {
    heading: string;
    message: string;
    badgeColor: string;
    badgeBg: string;
  }
> = {
  completed: {
    heading: "Your order has been delivered",
    message:
      "Your order has been successfully delivered. We hope you enjoy your purchase!",
    badgeColor: brand.colors.success,
    badgeBg: brand.colors.successBg,
  },
  cancelled: {
    heading: "Your order has been cancelled",
    message:
      "Your order has been cancelled as requested. If you were charged, a refund will be initiated shortly.",
    badgeColor: brand.colors.destructive,
    badgeBg: brand.colors.destructiveBg,
  },
  refunded: {
    heading: "Your refund has been processed",
    message:
      "Your refund has been processed and will be credited to your original payment method within 5-7 business days.",
    badgeColor: brand.colors.warning,
    badgeBg: brand.colors.warningBg,
  },
};

export function orderStatusUpdateHTML({
  customerName,
  orderId,
  newStatus,
  orderUrl,
}: OrderStatusUpdateParams): string {
  const greeting = customerName ? `Hi ${customerName},` : "Hi there,";
  const config = statusConfig[newStatus];

  const content = `
    <p style="margin:0 0 16px; font-size:16px; line-height:26px; color:${brand.colors.foreground};">
      ${greeting}
    </p>
    <p style="margin:0 0 24px; font-size:16px; line-height:26px; color:${brand.colors.foreground};">
      ${config.message}
    </p>

    <!-- Status Badge -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:28px;">
      <tr>
        <td style="padding:16px 20px; background-color:${config.badgeBg}; border-left:4px solid ${config.badgeColor};">
          <p style="margin:0 0 4px; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; color:${config.badgeColor};">
            Order Update
          </p>
          <p style="margin:0; font-size:16px; font-weight:600; line-height:24px; color:${brand.colors.foreground};">
            ${config.heading}
          </p>
        </td>
      </tr>
    </table>

    <!-- Order ID -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:28px;">
      <tr>
        <td style="padding:12px 16px; background-color:${brand.colors.secondary}; border-left:4px solid ${brand.colors.primary};">
          <p style="margin:0 0 4px; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; color:${brand.colors.secondaryForeground};">Order Reference</p>
          <p style="margin:0; font-size:14px; font-family:monospace; color:${brand.colors.foreground};">#${orderId}</p>
        </td>
      </tr>
    </table>

    <!-- CTA Button -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td align="center" style="padding: 0 0 28px;">
          <a href="${orderUrl}"
            target="_blank"
            style="display:inline-block; padding:14px 40px; background-color:${brand.colors.primary}; color:${brand.colors.primaryForeground}; font-family:${brand.fonts.sans}; font-size:14px; font-weight:600; text-decoration:none; letter-spacing:1.2px; text-transform:uppercase;">
            View Order
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 16px; font-size:14px; line-height:22px; color:${brand.colors.mutedForeground};">
      If you have any questions, reply to this email or contact us at <a href="mailto:support@${brand.name.toLowerCase()}.com" style="color:${brand.colors.primary}; text-decoration:underline;">support@${brand.name.toLowerCase()}.com</a>.
    </p>

    <p style="margin:16px 0 0; font-size:16px; line-height:26px; color:${brand.colors.foreground};">
      Thank you for shopping with us!<br />
      <strong style="color:${brand.colors.primary};">The ${brand.name} Team</strong>
    </p>
  `;

  return emailLayout(content);
}
