/**
 * DTLEA Email Templates
 *
 * Brand-consistent HTML email templates using theme colors from globals.css.
 * Colors are converted from oklch to hex for email client compatibility.
 *
 * Theme Color Mapping (Light Mode):
 *   --background   oklch(0.9099 0.0112 89.728)   → #E8E1D5 (warm beige)
 *   --foreground   oklch(0.2435 0 0)              → #2D2D2D (charcoal)
 *   --card         oklch(0.9911 0 0)              → #FDFDFD (white)
 *   --primary      oklch(0.4341 0.0392 41.9938)   → #6B4E3A (warm brown)
 *   --primary-fg   oklch(0.9099 0.0112 89.728)    → #E8E1D5 (warm beige)
 *   --secondary    oklch(0.92 0.0651 74.3695)     → #F0DEB6 (golden amber)
 *   --secondary-fg oklch(0.3499 0.0685 40.8288)   → #5B381B (dark brown)
 *   --muted-fg     oklch(0.5032 0 0)              → #757575 (gray)
 *   --border       oklch(0.8822 0 0)              → #DBDBDB (light gray)
 */

// ─── Brand Tokens ──────────────────────────────────────────────────────────────

const brand = {
  name: "DTLEA",
  colors: {
    background: "#E8E1D5",
    foreground: "#2D2D2D",
    card: "#FDFDFD",
    primary: "#6B4E3A",
    primaryForeground: "#E8E1D5",
    secondary: "#F0DEB6",
    secondaryForeground: "#5B381B",
    muted: "#F0F0F0",
    mutedForeground: "#757575",
    border: "#DBDBDB",
    destructive: "#C44536",
  },
  fonts: {
    sans: "'DM Sans', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif:
      "'Cormorant Garamond', 'Georgia', 'Times New Roman', Times, serif",
  },
} as const;

// ─── Layout Wrapper ────────────────────────────────────────────────────────────

function emailLayout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${brand.name}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    /* Reset */
    body, table, td, p, a, li { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; }
    a { color: ${brand.colors.primary}; }
    a:hover { opacity: 0.85; }
  </style>
</head>
<body style="margin:0; padding:0; background-color:${brand.colors.background}; font-family:${brand.fonts.sans};">

  <!-- Preheader (hidden text for email preview) -->
  <div style="display:none; font-size:1px; color:${brand.colors.background}; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">
    ${brand.name} – Your trusted marketplace
  </div>

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${brand.colors.background};">
    <tr>
      <td align="center" style="padding: 40px 16px;">

        <!-- Inner card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
          style="max-width:560px; background-color:${brand.colors.card}; border:1px solid ${brand.colors.border}; overflow:hidden;">

          <!-- Logo Header -->
          <tr>
            <td align="center" style="padding: 36px 40px 24px; background-color:${brand.colors.primary};">
              <span style="font-family:${brand.fonts.serif}; font-size:32px; font-weight:600; font-style:italic; color:${brand.colors.primaryForeground}; letter-spacing:2px;">
                ${brand.name}
              </span>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px 40px 32px;">
              ${content}
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 40px;">
              <hr style="border:none; border-top:1px solid ${brand.colors.border}; margin:0;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px 32px;">
              <p style="margin:0; font-size:12px; line-height:18px; color:${brand.colors.mutedForeground}; text-align:center;">
                This email was sent by <strong style="color:${brand.colors.secondaryForeground};">${brand.name}</strong>. If you didn't request this, you can safely ignore it.
              </p>
              <p style="margin:12px 0 0; font-size:12px; line-height:18px; color:${brand.colors.mutedForeground}; text-align:center;">
                &copy; ${new Date().getFullYear()} ${brand.name}. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
        <!-- /Inner card -->

      </td>
    </tr>
  </table>
  <!-- /Outer wrapper -->

</body>
</html>`.trim();
}

// ─── Template: Verify Email ────────────────────────────────────────────────────

interface VerifyEmailParams {
  /** The user's first name or display name */
  userName?: string;
  /** The full verification URL (including token) */
  verificationUrl: string;
}

export function verifyEmailHTML({
  userName,
  verificationUrl,
}: VerifyEmailParams): string {
  const greeting = userName ? `Hi ${userName},` : "Hi there,";

  const content = `
    <p style="margin:0 0 16px; font-size:16px; line-height:26px; color:${brand.colors.foreground};">
      ${greeting}
    </p>
    <p style="margin:0 0 16px; font-size:16px; line-height:26px; color:${brand.colors.foreground};">
      Welcome to <strong style="color:${brand.colors.primary};">${brand.name}</strong>! We're thrilled to have you join our community of curated artisans and discerning shoppers.
    </p>
    <p style="margin:0 0 28px; font-size:16px; line-height:26px; color:${brand.colors.foreground};">
      To get started, please verify your email address by clicking the button below:
    </p>

    <!-- CTA Button -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td align="center" style="padding: 0 0 28px;">
          <a href="${verificationUrl}"
            target="_blank"
            style="display:inline-block; padding:14px 40px; background-color:${brand.colors.primary}; color:${brand.colors.primaryForeground}; font-family:${brand.fonts.sans}; font-size:14px; font-weight:600; text-decoration:none; letter-spacing:1.2px; text-transform:uppercase;">
            Verify My Email
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 16px; font-size:14px; line-height:22px; color:${brand.colors.mutedForeground};">
      If the button above doesn't work, copy and paste this link into your browser:
    </p>
    <p style="margin:0 0 24px; font-size:13px; line-height:20px; word-break:break-all;">
      <a href="${verificationUrl}" style="color:${brand.colors.primary}; text-decoration:underline;">${verificationUrl}</a>
    </p>

    <p style="margin:0; font-size:16px; line-height:26px; color:${brand.colors.foreground};">
      We can't wait for you to explore what ${brand.name} has to offer. Happy browsing!
    </p>
    <p style="margin:16px 0 0; font-size:16px; line-height:26px; color:${brand.colors.foreground};">
      Warm regards,<br />
      <strong style="color:${brand.colors.primary};">The ${brand.name} Team</strong>
    </p>
  `;

  return emailLayout(content);
}

// ─── Template: Forgot Password ─────────────────────────────────────────────────

interface ForgotPasswordParams {
  /** The user's first name or display name */
  userName?: string;
  /** The full password reset URL (including token) */
  resetUrl: string;
}

export function forgotPasswordHTML({
  userName,
  resetUrl,
}: ForgotPasswordParams): string {
  const greeting = userName ? `Hi ${userName},` : "Hi there,";

  const content = `
    <p style="margin:0 0 16px; font-size:16px; line-height:26px; color:${brand.colors.foreground};">
      ${greeting}
    </p>
    <p style="margin:0 0 16px; font-size:16px; line-height:26px; color:${brand.colors.foreground};">
      We received a request to reset the password for your <strong style="color:${brand.colors.primary};">${brand.name}</strong> account. No worries — it happens to the best of us!
    </p>
    <p style="margin:0 0 28px; font-size:16px; line-height:26px; color:${brand.colors.foreground};">
      Click the button below to choose a new password:
    </p>

    <!-- CTA Button -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td align="center" style="padding: 0 0 28px;">
          <a href="${resetUrl}"
            target="_blank"
            style="display:inline-block; padding:14px 40px; background-color:${brand.colors.primary}; color:${brand.colors.primaryForeground}; font-family:${brand.fonts.sans}; font-size:14px; font-weight:600; text-decoration:none; letter-spacing:1.2px; text-transform:uppercase;">
            Reset Password
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 16px; font-size:14px; line-height:22px; color:${brand.colors.mutedForeground};">
      If the button above doesn't work, copy and paste this link into your browser:
    </p>
    <p style="margin:0 0 24px; font-size:13px; line-height:20px; word-break:break-all;">
      <a href="${resetUrl}" style="color:${brand.colors.primary}; text-decoration:underline;">${resetUrl}</a>
    </p>

    <!-- Security notice -->
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td style="padding:16px 20px; background-color:${brand.colors.secondary}; border-left:4px solid ${brand.colors.primary};">
          <p style="margin:0; font-size:13px; line-height:20px; color:${brand.colors.secondaryForeground};">
            <strong>🔒 Security Tip:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email — your account is safe.
          </p>
        </td>
      </tr>
    </table>

    <p style="margin:24px 0 0; font-size:16px; line-height:26px; color:${brand.colors.foreground};">
      Stay safe,<br />
      <strong style="color:${brand.colors.primary};">The ${brand.name} Team</strong>
    </p>
  `;

  return emailLayout(content);
}
