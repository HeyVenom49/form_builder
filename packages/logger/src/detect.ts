const SUSPICIOUS_PATHS = [
  /\.env/i,
  /\.git/i,
  /wp-admin/i,
  /wp-login/i,
  /phpmyadmin/i,
  /xmlrpc\.php/i,
  /\/vendor\//i,
  /\/\.aws/i,
  /\/actuator/i,
  /\/debug\/pprof/i,
  /\/server-status/i,
  /cgi-bin/i,
  /\.\.\//,
  /%2e%2e/i,
];

const SUSPICIOUS_QUERY = [
  /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
  /\b(union\s+select|sleep\s*\(|benchmark\s*\()/i,
  /<script/i,
  /\bonerror\s*=/i,
];

export function detectSuspiciousRequest(input: {
  method: string;
  path: string;
  query?: string;
  userAgent?: string;
  contentLength?: number;
}): { suspicious: boolean; reasons: string[] } {
  const reasons: string[] = [];
  const full = `${input.path}${input.query ? `?${input.query}` : ""}`;

  for (const re of SUSPICIOUS_PATHS) {
    if (re.test(full)) {
      reasons.push(`suspicious_path:${re.source}`);
      break;
    }
  }

  if (input.query) {
    for (const re of SUSPICIOUS_QUERY) {
      if (re.test(input.query)) {
        reasons.push(`suspicious_query:${re.source}`);
        break;
      }
    }
  }

  const ua = input.userAgent?.toLowerCase() ?? "";
  if (
    ua.includes("sqlmap") ||
    ua.includes("nikto") ||
    ua.includes("nmap") ||
    ua.includes("masscan") ||
    ua.includes("zgrab") ||
    ua.includes("dirbuster")
  ) {
    reasons.push("scanner_user_agent");
  }

  if ((input.contentLength ?? 0) > 2_000_000) {
    reasons.push("oversized_body");
  }

  if (input.method === "TRACE" || input.method === "TRACK") {
    reasons.push(`odd_method:${input.method}`);
  }

  return { suspicious: reasons.length > 0, reasons };
}

export function isAuthFailurePath(path: string): boolean {
  return (
    path.includes("auth.login") ||
    path.includes("login-with-email") ||
    path.includes("auth.loginWithEmailAndPassword") ||
    /\/auth\/login/i.test(path)
  );
}
