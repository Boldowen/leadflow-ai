import Link from "next/link";
import { Logo } from "@/components/logo";
import { ButtonLink } from "@/components/ui";

const nav = [
  { href: "/#features", label: "Features" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#faq", label: "FAQ" },
  { href: "/docs", label: "Docs" },
];

export function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
      <Logo />
      <nav aria-label="Main" className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
        {nav.map((item) => (
          <Link key={item.href} href={item.href} className="hover:text-slate-900">
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-2">
        <ButtonLink href="/login" variant="ghost">Log in</ButtonLink>
        <ButtonLink href="/register">Get started</ButtonLink>
      </div>
    </header>
  );
}
