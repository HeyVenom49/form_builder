import { createEmailProvider } from "./create-provider";
import type { EmailProvider } from "./provider";
import {
  buildEmailVerificationMessage,
  buildPasswordResetMessage,
} from "./templates";

class EmailService {
  constructor(private readonly provider: EmailProvider = createEmailProvider()) {}

  async sendEmailVerification(args: {
    to: string;
    name: string;
    token: string;
  }) {
    const message = buildEmailVerificationMessage(args);
    await this.provider.send({
      to: args.to,
      ...message,
    });
  }

  async sendPasswordReset(args: {
    to: string;
    name: string;
    token: string;
  }) {
    const message = buildPasswordResetMessage(args);
    await this.provider.send({
      to: args.to,
      ...message,
    });
  }
}

export default EmailService;
export type { EmailProvider } from "./provider";
export { createEmailProvider } from "./create-provider";
