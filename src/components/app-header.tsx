import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui";
import type { CurrentUser } from "@/lib/dal";

export function AppHeader({ user }: { user: CurrentUser }) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/[.08] bg-[rgba(10,10,15,.72)] backdrop-blur-[14px]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Logo href="/dashboard" />
        <nav className="order-last flex w-full gap-5 text-sm font-medium text-[#c7d2fe] sm:order-none sm:w-auto sm:flex-1">
          <Link href="/dashboard" className="hover:text-white">Leads</Link>
          <Link href="/dashboard/automation" className="hover:text-white">Automation</Link>
          {user.role === "ADMIN" && <Link href="/admin" className="hover:text-white">Admin</Link>}
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-zinc-400 sm:inline" data-testid="current-user">
            {user.name}
          </span>
          <form action={logout}>
            <Button variant="ghost" type="submit">Log out</Button>
          </form>
        </div>
      </div>
    </header>
  );
}
