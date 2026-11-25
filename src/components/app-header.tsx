import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui";
import type { CurrentUser } from "@/lib/dal";

export function AppHeader({ user }: { user: CurrentUser }) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Logo href="/dashboard" />
        <nav className="order-last flex w-full gap-4 text-sm font-medium text-slate-600 sm:order-none sm:w-auto sm:flex-1">
          <Link href="/dashboard" className="hover:text-slate-900">Leads</Link>
          <Link href="/dashboard/automation" className="hover:text-slate-900">Automation</Link>
          {user.role === "ADMIN" && <Link href="/admin" className="hover:text-slate-900">Admin</Link>}
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-slate-600 sm:inline" data-testid="current-user">
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
