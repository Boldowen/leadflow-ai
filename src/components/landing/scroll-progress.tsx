"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/** Thin gradient bar at the top that fills as the page scrolls (works in every browser, unlike CSS scroll timelines). */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden
      className="fixed top-0 left-0 z-30 h-[3px] w-full origin-left bg-[linear-gradient(90deg,#4f46e5,#c084fc)]"
      style={{ scaleX }}
    />
  );
}
