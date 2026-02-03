import { render } from "@react-email/render";
import VerifyEmail from "./template/VerifyEmails";
import { logger } from "@/utils/logger";
import { sendEmail } from "./resendEmail";

export async function sendVerificationRequest({
  identifier,
  url,
}: {
  identifier: string;
  url: string;
}) {
  const emailHtml = await render(
    <VerifyEmail verificationUrl={url} productName="Creation Temple" />
  );

  try {
    await sendEmail({
      to: identifier,
      subject: `verify your email address for ${process.env.NEXT_PUBLIC_SITE_NAME}`,
      html: emailHtml,
    });
  } catch (error) {
    logger.error("Failed to send verification email", {
      error,
      email: identifier,
    });
    throw error;
  }
}
