import EmailProvider from "next-auth/providers/email";
import { Resend } from "resend";
import { ratelimit } from "@/utils/ratelimit";

const resend = new Resend(process.env.RESEND_API_KEY!);

// 2️⃣ Customer: Email Magic Link
export const customerMagicLink = EmailProvider({
  from: process.env.EMAIL_FROM!,
  maxAge: 15 * 60, // 15 minutes expiry
  async sendVerificationRequest({ identifier, url }) {
    const { success } = await ratelimit.limit(`email:${identifier}`);
    if (!success) throw new Error("Too many requests");

    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: [identifier],
      subject: "Sign in to your account",
      html: `<p>Click <a href="${url}">${url}</a> to sign in.</p>`,
    });
  },
});
