import "dotenv/config";
import { sendEmail } from "../services/email.service.js";

async function main() {
  console.log("Testing Brevo Email integration for FamCare...");

  const apiKey = process.env.BREVO_API?.trim();
  const senderEmail = process.env.BREVO_SENDER_EMAIL?.trim();
  const targetEmail = process.argv[2] || process.env.TEST_EMAIL || senderEmail;

  if (!apiKey) {
    console.error("Error: BREVO_API is not set in Backend/.env");
    process.exit(1);
  }

  if (!senderEmail) {
    console.error("Error: BREVO_SENDER_EMAIL is not set in Backend/.env");
    process.exit(1);
  }

  if (!targetEmail) {
    console.error(
      "Error: No recipient email provided. Usage: npm run test:email <recipient-email>"
    );
    process.exit(1);
  }

  console.log(`Sender: ${senderEmail}`);
  console.log(`Recipient: ${targetEmail}`);

  try {
    await sendEmail({
      to: [{ email: targetEmail, name: "FamCare Tester" }],
      subject: "FamCare Brevo Test Email",
      htmlContent:
        "<h1>Brevo Integration Successful</h1><p>Your FamCare email service is working properly.</p>",
    });
    console.log("Success! Test email sent successfully.");
  } catch (error) {
    console.error("Test email failed:", error);
    process.exit(1);
  }
}

main();
