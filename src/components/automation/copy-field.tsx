"use client";

import { useState } from "react";

export function CopyField({ label, value, multiline = false }: { label: string; value: string; multiline?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-300">{label}</span>
        <button
          type="button"
          className="text-xs font-medium text-indigo-300 hover:underline"
          onClick={async () => {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>
      {multiline ? (
        <pre className="max-h-56 overflow-auto rounded-xl border border-white/[.08] bg-black/40 p-3 text-xs leading-5 text-zinc-100">{value}</pre>
      ) : (
        <code aria-label={label} className="block truncate rounded-lg bg-white/[.06] px-3 py-2 text-xs text-zinc-100">{value}</code>
      )}
    </div>
  );
}
