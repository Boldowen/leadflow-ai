"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { TICKER, TICKER_INTERVAL_MS } from "@/lib/landing-data";

/** Floating notification that cycles through sample events. Decorative, so hidden from assistive tech. */
export function Ticker() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % TICKER.length), TICKER_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);
  const item = TICKER[i];
  return (
    <div
      aria-hidden
      className="lp-float absolute top-[90px] -left-10 hidden w-[210px] rounded-[14px] border bg-[rgba(24,24,32,.9)] px-4 py-3 text-left text-[13px] backdrop-blur-[8px] transition-[border-color] duration-400 min-[761px]:block"
      style={{ borderColor: item.color }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={i}
          initial={reduce ? false : { opacity: 0, y: 10, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={reduce ? undefined : { opacity: 0, y: -8, filter: "blur(4px)" }}
          transition={{ duration: 0.35 }}
        >
          <div className="font-semibold" style={{ color: item.color }}>{item.title}</div>
          <div className="text-[#a1a1aa]">{item.detail}</div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
