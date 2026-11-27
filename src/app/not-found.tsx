import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { ButtonLink } from "@/components/ui";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <Logo />
      <p className="mt-6 text-sm font-semibold text-indigo-300">404</p>
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="max-w-sm text-zinc-400">The page you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <ButtonLink href="/">Go to the homepage</ButtonLink>
        <ButtonLink href="/dashboard" variant="secondary">Back to dashboard</ButtonLink>
      </div>
      <p className="text-sm text-zinc-400">
        Looking for setup help? Read the <Link href="/docs" className="font-medium text-indigo-300 hover:underline">documentation</Link>.
      </p>
    </main>
  );
}
