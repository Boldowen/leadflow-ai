"use client";

import { motion, useMotionTemplate, useMotionValue, useReducedMotion } from "framer-motion";
import type { ComponentProps, MouseEvent } from "react";

/** A section with a soft glow that follows the mouse. The position lives in motion values, so moving doesn't re-render. */
export function SpotlightSection({ children, className = "", color = "rgba(99,102,241,.16)", ...rest }: ComponentProps<"section"> & { color?: string }) {
  const reduce = useReducedMotion();
  const x = useMotionValue(700);
  const y = useMotionValue(260);
  const background = useMotionTemplate`radial-gradient(640px circle at ${x}px ${y}px, ${color}, transparent 60%)`;

  function onMouseMove(e: MouseEvent<HTMLElement>) {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - r.left);
    y.set(e.clientY - r.top);
  }

  return (
    <section className={`relative ${className}`} onMouseMove={onMouseMove} {...rest}>
      <motion.div aria-hidden className="pointer-events-none absolute inset-0" style={{ background }} />
      {children}
    </section>
  );
}
