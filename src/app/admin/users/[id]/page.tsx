import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  deleteUserAction,
  revokeSessionsAction,
  sendResetLinkAction,
  setUserPassword,
  setUserRoleAction,
  updateUserProfile,
} from "@/app/admin/actions";
import { DeleteUserCard, PasswordCard, ProfileForm, RoleCard } from "@/components/admin/user-manager";
import { Card } from "@/components/ui";
import { getUserDetail } from "@/lib/admin";
import { requireAdmin } from "@/lib/dal";

export const metadata: Metadata = { title: "Manage user" };

export default async function AdminUserPage({ params }: PageProps<"/admin/users/[id]">) {
  const admin = await requireAdmin();
  const { id } = await params;
  const user = await getUserDetail(id);
  if (!user) notFound();
  const isSelf = user.id === admin.id;
  const isAdmin = user.role === "ADMIN";

  const facts = [
    ["Joined", user.createdAt.toLocaleDateString("en-US", { dateStyle: "medium" })],
    ["Leads", String(user._count.leads)],
    ["AI calls, 30 d", String(user._count.aiCalls)],
    ["Problem runs, 7 d", String(user._count.automationRuns)],
    ["Integrations", [user.sheetsWebhookUrl && "Google Sheets", user.telegramChatId && "Telegram"].filter(Boolean).join(", ") || "None"],
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin" className="text-sm text-zinc-400 hover:underline">← All users</Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{user.name}</h1>
          <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${isAdmin ? "bg-indigo-500/15 text-indigo-300" : "bg-white/[.06] text-zinc-300"}`}>
            {isAdmin ? "Admin" : "User"}
          </span>
          {isSelf && <span className="text-xs text-zinc-400">(you)</span>}
        </div>
        <p className="text-sm break-all text-zinc-400">{user.email}</p>
      </div>

      <Card className="p-4">
        <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-5">
          {facts.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-medium tracking-wide text-zinc-400 uppercase">{label}</dt>
              <dd className="mt-1 font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileForm action={updateUserProfile.bind(null, user.id)} name={user.name} email={user.email} />
        <PasswordCard
          setPassword={setUserPassword.bind(null, user.id)}
          sendLink={sendResetLinkAction.bind(null, user.id)}
          revoke={revokeSessionsAction.bind(null, user.id)}
        />
        <RoleCard isAdmin={isAdmin} isSelf={isSelf} action={setUserRoleAction.bind(null, user.id, isAdmin ? "USER" : "ADMIN")} />
        <DeleteUserCard action={deleteUserAction.bind(null, user.id)} email={user.email} isSelf={isSelf} />
      </div>
    </div>
  );
}
