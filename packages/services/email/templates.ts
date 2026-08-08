import { env } from "../env";

function appLink(path: string) {
  return new URL(path, env.APP_URL).toString();
}

export function buildEmailVerificationMessage(args: {
  name: string;
  token: string;
}) {
  const verifyUrl = appLink(
    `/auth/verify-email?token=${encodeURIComponent(args.token)}`,
  );

  const subject = "Verify your email";
  const text = [
    `Hi ${args.name},`,
    "",
    "Thanks for signing up. Verify your email with this link:",
    verifyUrl,
    "",
    "If you did not create an account, you can ignore this email.",
  ].join("\n");

  const html = `
    <p>Hi ${escapeHtml(args.name)},</p>
    <p>Thanks for signing up. Verify your email:</p>
    <p><a href="${verifyUrl}">Verify email</a></p>
    <p>Or open: ${verifyUrl}</p>
    <p>If you did not create an account, you can ignore this email.</p>
  `.trim();

  return { subject, text, html };
}

export function buildPasswordResetMessage(args: {
  name: string;
  token: string;
}) {
  const resetUrl = appLink(
    `/auth/reset-password?token=${encodeURIComponent(args.token)}`,
  );

  const subject = "Reset your password";
  const text = [
    `Hi ${args.name},`,
    "",
    "We received a request to reset your password. Use this link:",
    resetUrl,
    "",
    "If you did not request a reset, you can ignore this email.",
  ].join("\n");

  const html = `
    <p>Hi ${escapeHtml(args.name)},</p>
    <p>We received a request to reset your password:</p>
    <p><a href="${resetUrl}">Reset password</a></p>
    <p>Or open: ${resetUrl}</p>
    <p>If you did not request a reset, you can ignore this email.</p>
  `.trim();

  return { subject, text, html };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
