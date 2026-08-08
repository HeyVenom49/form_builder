import { env } from "../env";
import { ConsoleEmailProvider } from "./console";
import type { EmailProvider } from "./provider";
import { ResendEmailProvider } from "./resend";

export function createEmailProvider(): EmailProvider {
  switch (env.EMAIL_PROVIDER) {
    case "resend": {
      if (!env.RESEND_API_KEY) {
        console.warn(
          "[email] RESEND_API_KEY missing — using console provider (dev).",
        );
        return new ConsoleEmailProvider();
      }
      return new ResendEmailProvider(env.RESEND_API_KEY);
    }
    default: {
      const exhaustive: never = env.EMAIL_PROVIDER;
      throw new Error(`Unsupported EMAIL_PROVIDER: ${exhaustive}`);
    }
  }
}
