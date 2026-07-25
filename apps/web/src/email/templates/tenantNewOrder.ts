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

interface TenantNewOrderParams {
  tenantName: string;
  orderId: string;
  tenantTotal: number;
  itemCount: number;
  orderAdminUrl: string;
}

function formatAmount(amount: number): string {
  return `\u20B9${(amount / 100).toFixed(2)}`;
}

export function tenantNewOrderHTML({
  tenantName,
  orderId,
  tenantTotal,
  itemCount,
  orderAdminUrl,
}: TenantNewOrderParams): string {
  const content = `
    <p style="margin:0 0 16px; font-size:16px; line-height:26px; color:${brand.colors.foreground};">
      Dear ${tenantName},
    </p>
    <p style="margin:0 0 24px; font-size:16px; line-height:26px; color:${brand.colors.foreground};">
      You have received a new order on <strong style="color:${brand.colors.primary};">${brand.name}</strong>. Please review and prepare it for dispatch.
    </p>

    <!-- Success Badge -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:28px;">
      <tr>
        <td style="padding:16px 20px; background-color:${brand.colors.successBg}; border-left:4px solid ${brand.colors.success};">
          <p style="margin:0 0 4px; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; color:${brand.colors.success};">
            New Order Received
          </p>
          <p style="margin:0; font-size:14px; line-height:22px; color:${brand.colors.foreground};">
            Order #${orderId} &mdash; ${itemCount} item${itemCount !== 1 ? "s" : ""}
          </p>
        </td>
      </tr>
    </table>

    <!-- Order Total -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-bottom:28px;">
      <tr>
        <td style="padding:12px 16px; background-color:${brand.colors.secondary}; border-left:4px solid ${brand.colors.primary};">
          <p style="margin:0 0 4px; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; color:${brand.colors.secondaryForeground};">Order Total (Your Items)</p>
          <p style="margin:0; font-size:20px; font-weight:600; color:${brand.colors.foreground};">${formatAmount(tenantTotal)}</p>
        </td>
      </tr>
    </table>

    <!-- CTA Button -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td align="center" style="padding: 0 0 28px;">
          <a href="${orderAdminUrl}"
            target="_blank"
            style="display:inline-block; padding:14px 40px; background-color:${brand.colors.primary}; color:${brand.colors.primaryForeground}; font-family:${brand.fonts.sans}; font-size:14px; font-weight:600; text-decoration:none; letter-spacing:1.2px; text-transform:uppercase;">
            View in Dashboard
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0; font-size:16px; line-height:26px; color:${brand.colors.foreground};">
      Best regards,<br />
      <strong style="color:${brand.colors.primary};">The ${brand.name} Team</strong>
    </p>
  `;

  return emailLayout(content);
}
