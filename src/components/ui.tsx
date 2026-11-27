import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

const variants = {
  primary: "bg-[linear-gradient(135deg,#4f46e5,#7c3aed)] text-white hover:shadow-[0_12px_40px_-12px_rgba(99,102,241,.9)]",
  secondary: "border border-white/15 bg-white/[.04] text-zinc-200 hover:bg-white/[.08] hover:text-white",
  danger: "border border-red-500/30 bg-red-500/[.06] text-red-300 hover:bg-red-500/15",
  ghost: "text-zinc-300 hover:bg-white/[.06] hover:text-white",
};

export type ButtonVariant = keyof typeof variants;

export function buttonClass(variant: ButtonVariant = "primary", extra = "") {
  return `inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${extra}`;
}

export function Button({ variant = "primary", className = "", ...props }: ComponentProps<"button"> & { variant?: ButtonVariant }) {
  return <button className={buttonClass(variant, className)} {...props} />;
}

export function ButtonLink({ variant = "primary", className = "", ...props }: ComponentProps<typeof Link> & { variant?: ButtonVariant }) {
  return <Link className={buttonClass(variant, className)} {...props} />;
}

export function Field({ label, name, error, children, hint }: { label: string; name: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="block text-sm font-medium text-zinc-300">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${name}-error`} className="text-sm text-red-400" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-zinc-400">{hint}</p>
      ) : null}
    </div>
  );
}

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`glass ${className}`}>{children}</div>;
}

export function Spinner() {
  return <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden />;
}
