/**
 * Canonical public origin. Links in emails and metadata never use the request's Host header,
 * which a client can forge (password-reset poisoning).
 */
export function appUrl() {
  const fromEnv = process.env.APP_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  return process.env.NODE_ENV === "production" ? "https://emberza.dev" : `http://localhost:${process.env.PORT ?? 3100}`;
}
