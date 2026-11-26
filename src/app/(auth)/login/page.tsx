import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { safeNextPath } from "@/lib/validation";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to Emberza to see your AI-qualified leads.",
  robots: { index: false, follow: true },
};

const notices = {
  expired: "Your session ended. Please log in again.",
  reset: "Password updated. Log in with your new password.",
} as const;

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? safeNextPath(sp.next) : undefined;
  const notice = sp.reset === "1" ? notices.reset : sp.expired !== undefined ? notices.expired : undefined;
  return (
    <>
      <h1 className="mb-1 text-xl font-semibold">Welcome back</h1>
      <p className="mb-6 text-sm text-slate-600">Log in to see your leads.</p>
      <AuthForm mode="login" next={next} notice={notice} />
    </>
  );
}
