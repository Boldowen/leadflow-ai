import type { ReactNode } from "react";

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="mb-2.5 text-sm font-semibold tracking-[.08em] text-[#a5b4fc] uppercase">{children}</p>;
}

export function SectionTitle({ id, children, className = "" }: { id?: string; children: ReactNode; className?: string }) {
  return (
    <h2 id={id} className={`lp-display m-0 text-[34px] leading-tight tracking-[-0.02em] text-white min-[761px]:text-[44px] ${className}`}>
      {children}
    </h2>
  );
}
