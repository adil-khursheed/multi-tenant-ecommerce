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
    destructive: "#C44536",
    destructiveBg: "#FDE8E4",
  },
  fonts: {
    sans: "'DM Sans', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "'Cormorant Garamond', 'Georgia', 'Times New Roman', Times, serif",
  },
} as const;

interface OrderFailedParams {
  customerName?: string;
  transactionId: string;
  paymentMethod: "razorpay" | "cod";
  amount: number;
  retryUrl: string;
  failureReason?: string;
}

function formatAmount(amount: number): string {
  return `\u20B9${(amount / 100).toFixed(2)}`;
}

export function orderFailedHTML({
  customerName,
  transactionId,
  paymentMethod,
  amount,
  retryUrl,
  failureReason,
}: OrderFailedParams): string {
  const greeting = customerName ? `Hi ${customerName},` : "Hi there,";
  const reason =
    failureReason || "The payment could not be processed by your bank.";

  const content = `
    <p style="margin:0 0 16px; font-size:16px; line-height:26px; color:${brand.colors.foreground};">
      ${greeting}
    </p>
    <p style="margin:0 0 24px; font-size:16px; line-height:26px; color:${brand.colors.foreground};">
      We were unable to process your payment for your recent order attempt. Don't worry \u2014 no amount has been deducted from your account.
    </p>

    <!-- Error Badge -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:28px;">
      <tr>
        <td style="padding:16px 20px; background-color:${brand.colors.destructiveBg}; border-left:4px solid ${brand.colors.destructive};">
          <p style="margin:0 0 4px; font-size:14px; font-weight:600; line-height:22px; color:${brand.colors.destructive};">
            Payment Failed
          </p>
          <p style="margin:0; font-size:13px; line-height:20px; color:${brand.colors.mutedForeground};">
            ${reason}
          </p>
        </td>
      </tr>
    </table>

    <!-- Details -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:28px;">
      <tr>
        <td style="padding:10px 0; border-bottom:1px solid ${brand.colors.border}; font-size:14px; color:${brand.colors.mutedForeground}; width:140px;">Amount</td>
        <td style="padding:10px 0; border-bottom:1px solid ${brand.colors.border}; font-size:14px; color:${brand.colors.foreground};">${formatAmount(amount)}</td>
      </tr>
      <tr>
        <td style="padding:10px 0; border-bottom:1px solid ${brand.colors.border}; font-size:14px; color:${brand.colors.mutedForeground};">Payment</td>
        <td style="padding:10px 0; border-bottom:1px solid ${brand.colors.border}; font-size:14px; color:${brand.colors.foreground};">${paymentMethod === "cod" ? "Cash on Delivery" : "Razorpay"}</td>
      </tr>
      <tr>
        <td style="padding:10px 0; font-size:14px; color:${brand.colors.mutedForeground};">Reference</td>
        <td style="padding:10px 0; font-size:14px; color:${brand.colors.foreground}; font-family:monospace;">${transactionId}</td>
      </tr>
    </table>

    <!-- CTA Button -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td align="center" style="padding: 0 0 28px;">
          <a href="${retryUrl}"
            target="_blank"
            style="display:inline-block; padding:14px 40px; background-color:${brand.colors.primary}; color:${brand.colors.primaryForeground}; font-family:${brand.fonts.sans}; font-size:14px; font-weight:600; text-decoration:none; letter-spacing:1.2px; text-transform:uppercase;">
            Try Again
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 16px; font-size:14px; line-height:22px; color:${brand.colors.mutedForeground};">
      If this issue persists, please contact your bank or reach out to us at <a href="mailto:support@${brand.name.toLowerCase()}.com" style="color:${brand.colors.primary}; text-decoration:underline;">support@${brand.name.toLowerCase()}.com</a>.
    </p>

    <p style="margin:16px 0 0; font-size:16px; line-height:26px; color:${brand.colors.foreground};">
      We're here to help,<br />
      <strong style="color:${brand.colors.primary};">The ${brand.name} Team</strong>
    </p>
  `;

  return emailLayout(content);
}
