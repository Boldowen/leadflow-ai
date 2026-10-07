"use client";

import { SubmitButton } from "@/components/submit-button";

export function DeleteLeadButton({ action }: { action: () => Promise<void> }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("Delete this lead? This cannot be undone.")) e.preventDefault();
      }}
    >
      <SubmitButton variant="danger" pendingText="Deleting…">Delete lead</SubmitButton>
    </form>
  );
}
