"use client";

import { Button } from "@/components/ui";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 p-6">
      <h2 className="font-semibold text-red-200">Something went wrong</h2>
      <p className="mt-1 text-sm text-red-300">{error.digest ? `Error id: ${error.digest}` : "Please try again."}</p>
      <Button className="mt-4" variant="secondary" onClick={reset}>Try again</Button>
    </div>
  );
}
