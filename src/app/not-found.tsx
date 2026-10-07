import { ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <p className="text-sm font-semibold text-indigo-600">404</p>
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <ButtonLink href="/dashboard" variant="secondary">Back to dashboard</ButtonLink>
    </main>
  );
}
