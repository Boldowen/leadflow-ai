"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import type { MouseEvent, ReactNode } from "react";

/** Tilts its content in 3D toward the mouse (up to ±5° vertically, ±4° horizontally). */
export function TiltCard({ children, className = "", innerClassName = "" }: { children: ReactNode; className?: string; innerClassName?: string }) {
  const reduce = useReducedMotion();
  const rx = useSpring(useMotionValue(0), { stiffness: 220, damping: 22 });
  const ry = useSpring(useMotionValue(0), { stiffness: 220, damping: 22 });

  function onMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * 10);
    rx.set(-py * 8);
  }
  function reset() {
    rx.set(0);
    ry.set(0);
  }

  return (
    <div className={className} style={{ perspective: 1200 }} onMouseMove={onMouseMove} onMouseLeave={reset}>
      <motion.div className={innerClassName} style={{ rotateX: rx, rotateY: ry }}>
        {children}
      </motion.div>
    </div>
  );
}
