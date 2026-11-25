import "server-only";
import { headers } from "next/headers";

/**
 * Client IP for rate limiting. On Vercel these headers are set by the edge and can't be spoofed;
 * self-hosted, put the app behind a proxy that overwrites them.
 */
export function ipFrom(h: Headers) {
  return h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
}

export async function requestIp() {
  return ipFrom(await headers());
}
