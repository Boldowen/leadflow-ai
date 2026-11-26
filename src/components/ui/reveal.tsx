"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Fades, un-blurs and slides content in once it scrolls into view.
 * `data-reveal` lets CSS show the content immediately for reduced motion and when JavaScript is off.
 */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      data-reveal
      className={className}
      initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}
