import { Resend } from "resend";
import { logger } from "@/utils/logger";

const resend = new Resend(process.env.RESEND_API_KEY);
interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  headers?: Record<string, string>;
}

export async function sendEmail({
  to,
  subject,
  html,
  headers = {},
}: SendEmailParams) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set");
  }

  try {
    const startTime = Date.now();
    logger.info("Sending email", { to, subject });

    const data = await resend.emails.send({
      from: `${process.env.NEXT_PUBLIC_SITE_NAME} <${process.env.EMAIL_FROM}>`,
      to,
      replyTo: process.env.EMAIL_REPLY_TO,
      subject,
      html,
      headers: {
        "X-Entity-Ref-ID": crypto.randomUUID(),
        ...headers,
      },
    });
    const duration = Date.now() - startTime;
    if (data.error) {
      logger.error("Email failed to send", {
        error: data.error,
        to,
        subject,
        durationMs: duration,
      });
      throw new Error(data.error.message);
    }

    logger.info("Email sent successfully", {
      emailId: data.data?.id,
      to,
      subject,
      durationMs: duration,
    });

    return data.data;
  } catch (error) {
    logger.error("Email sending failed", {
      error: error instanceof Error ? error.message : "Unknown error",
      to,
      subject,
    });
    throw error;
  }
}
