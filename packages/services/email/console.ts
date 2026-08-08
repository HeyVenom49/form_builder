import type { EmailProvider, SendEmailInput } from "./provider";

/** Dev fallback when provider credentials are missing — logs instead of sending. */
export class ConsoleEmailProvider implements EmailProvider {
  async send(input: SendEmailInput): Promise<void> {
    console.info("[email:console]", {
      to: input.to,
      subject: input.subject,
      text: input.text,
    });
  }
}
