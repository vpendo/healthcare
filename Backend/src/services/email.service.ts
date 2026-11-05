import { BrevoClient, Brevo } from "@getbrevo/brevo";

export interface SendEmailOptions {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
}

let cachedApiKey: string | undefined;
let brevoClient: BrevoClient | undefined;

function getBrevoClient(apiKey: string): BrevoClient {
  if (!brevoClient || cachedApiKey !== apiKey) {
    brevoClient = new BrevoClient({ apiKey });
    cachedApiKey = apiKey;
  }
  return brevoClient;
}

/**
 * Sends a transactional email via Brevo.
 * Skips sending when BREVO_API or BREVO_SENDER_EMAIL is unset (e.g. in test environment).
 */
export async function sendEmail(options: SendEmailOptions): Promise<void> {
  const apiKey = process.env.BREVO_API?.trim();
  const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim();

  if (!apiKey || !senderEmail) {
    if (process.env.NODE_ENV !== "test") {
      console.warn(
        "Email skipped: BREVO_API or BREVO_SENDER_EMAIL is not set in environment."
      );
    }
    return;
  }

  try {
    const result = await getBrevoClient(
      apiKey
    ).transactionalEmails.sendTransacEmail({
      subject: options.subject,
      htmlContent: options.htmlContent,
      sender: {
        name: process.env.BREVO_SENDER_NAME?.trim() || "FamCare",
        email: senderEmail,
      },
      to: options.to,
    });

    console.log("Email sent successfully. Message ID:", result.messageId);
  } catch (err: unknown) {
    if (err instanceof Brevo.UnauthorizedError) {
      console.error(
        "Brevo error: Invalid API key (Unauthorized). Check BREVO_API in .env"
      );
    } else if (err instanceof Brevo.TooManyRequestsError) {
      console.error("Brevo error: Rate limited by Brevo (TooManyRequests).");
    } else if (err instanceof Error) {
      console.error("Error sending email via Brevo:", err.message);
    } else {
      console.error("Error sending email via Brevo:", err);
    }
    throw err;
  }
}

