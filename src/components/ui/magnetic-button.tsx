"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";

const MotionLink = motion.create(Link);

/** A link that leans toward the cursor while hovered and springs back on leave. */
export function MagneticButton({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 300, damping: 18 });
  const y = useSpring(useMotionValue(0), { stiffness: 300, damping: 18 });

  function onMouseMove(e: MouseEvent<HTMLAnchorElement>) {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * 0.3);
    y.set((e.clientY - r.top - r.height / 2) * 0.4);
  }
  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <MotionLink href={href} className={className} style={{ x, y }} onMouseMove={onMouseMove} onMouseLeave={reset}>
      {children}
    </MotionLink>
  );
}
