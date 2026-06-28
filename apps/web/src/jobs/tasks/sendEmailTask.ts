import type { TaskConfig } from "payload";

export const sendEmailTask: TaskConfig<"sendEmail"> = {
  slug: "sendEmail",

  inputSchema: [
    { name: "to", type: "text", required: true },
    { name: "subject", type: "text", required: true },
    { name: "html", type: "textarea", required: true },
    // { name: "from", type: "text" }, // optional override
  ],

  outputSchema: [{ name: "accepted", type: "checkbox" }],

  // Email providers can be transiently unavailable — retry generously
  retries: 4,

  handler: async ({ input, req: { payload } }) => {
    const { to, subject, html } = input;

    await payload.sendEmail({
      to,
      subject,
      html,
    });

    payload.logger.info({ msg: "Email sent", to, subject });

    return { output: { accepted: true } };
  },
};
