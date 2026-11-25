import { AppHeader } from "@/components/app-header";
import { requireAdmin } from "@/lib/dal";

// The page and lib/admin.ts check again: layouts don't re-render on client navigation.
// No loading.tsx here on purpose — it would start streaming before notFound() can set a real 404 status.
export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await requireAdmin();
  return (
    <div className="flex flex-1 flex-col">
      <AppHeader user={user} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
