import { Resend } from "resend";
import { env } from "../env";
import type { EmailProvider, SendEmailInput } from "./provider";

export class ResendEmailProvider implements EmailProvider {
  private readonly client: Resend;

  constructor(apiKey = env.RESEND_API_KEY) {
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is required when EMAIL_PROVIDER=resend");
    }
    this.client = new Resend(apiKey);
  }

  async send(input: SendEmailInput): Promise<void> {
    const { error } = await this.client.emails.send({
      from: env.EMAIL_FROM,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });

    if (error) {
      throw new Error(`Resend failed: ${error.message}`);
    }
  }
}
