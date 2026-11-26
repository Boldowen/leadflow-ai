import Link from "next/link";
import type { ReactNode } from "react";

const base =
  "lp-btn lp-shine inline-flex min-h-12 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#4f46e5,#7c3aed)] px-[26px] py-3.5 font-semibold text-white hover:-translate-y-0.5";

/** Gradient call-to-action with a light sweep. Renders a link when `href` is set, otherwise a button. */
export function ShineButton({
  href,
  children,
  className = "",
  ...button
}: { href?: string; children: ReactNode; className?: string } & Omit<React.ComponentProps<"button">, "className" | "children">) {
  if (href) {
    return (
      <Link href={href} className={`${base} ${className}`}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" className={`${base} cursor-pointer disabled:cursor-wait disabled:opacity-80 ${className}`} {...button}>
      {children}
    </button>
  );
}
