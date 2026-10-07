import { logout } from "@/app/actions/auth";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui";
import { requireUser } from "@/lib/dal";

export default async function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  const user = await requireUser();
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Logo href="/dashboard" />
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
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
