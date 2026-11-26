import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Sign up free",
  description: "Create a free Emberza account and let AI summarize, score and prioritize your inbound leads.",
  robots: { index: false, follow: true },
};

export default function RegisterPage() {
  return (
    <>
      <h1 className="mb-1 text-xl font-semibold">Create your account</h1>
      <p className="mb-6 text-sm text-slate-600">Start qualifying leads with AI in a minute.</p>
      <AuthForm mode="register" />
    </>
  );
}
