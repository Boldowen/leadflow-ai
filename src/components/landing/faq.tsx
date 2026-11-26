"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { FAQS } from "@/lib/landing-data";
import { SectionTitle } from "./section-heading";

/**
 * Single-open accordion. Answers stay in the HTML while closed (collapsed to zero height and inert),
 * so search engines and the FAQ structured data see the same text.
 */
export function Faq() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" aria-labelledby="faq-title" className="mx-auto max-w-[820px] scroll-mt-20 px-6 pt-[100px] pb-10">
      <SectionTitle id="faq-title" className="mb-8 text-center">Questions, answered.</SectionTitle>
      <div className="flex flex-col gap-2.5">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <div
              key={f.q}
              className={`overflow-hidden rounded-2xl border bg-white/[.02] transition-colors duration-200 ${isOpen ? "border-[rgba(129,140,248,.5)]" : "border-white/[.08]"}`}
            >
              <h3 className="m-0">
                <button
                  type="button"
                  id={`faq-q-${i}`}
                  aria-expanded={isOpen}
                  aria-controls={`faq-a-${i}`}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="flex min-h-14 w-full cursor-pointer items-center justify-between gap-4 bg-transparent px-5 py-[18px] text-left text-base font-medium text-white hover:bg-white/[.04]"
                >
                  {f.q}
                  <motion.span aria-hidden animate={{ rotate: isOpen ? 45 : 0 }} transition={reduce ? { duration: 0 } : { duration: 0.25 }} className="flex flex-none">
                    <Plus size={20} strokeWidth={2} color="#a5b4fc" />
                  </motion.span>
                </button>
              </h3>
              <motion.div
                id={`faq-a-${i}`}
                role="region"
                aria-labelledby={`faq-q-${i}`}
                inert={!isOpen}
                initial={false}
                animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                transition={reduce ? { duration: 0 } : { duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
                className="overflow-hidden"
              >
                <p className="m-0 px-5 pb-5 leading-[1.65] text-[#a1a1aa]">
                  <Answer text={f.a} link={f.link} />
                </p>
              </motion.div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Answer({ text, link }: { text: string; link?: { text: string; href: string } }) {
  if (!link || !text.includes(link.text)) return <>{text}</>;
  const [before, after] = text.split(link.text);
  return (
    <>
      {before}
      <Link href={link.href} className="text-[#c7d2fe] underline-offset-2 hover:text-white hover:underline">{link.text}</Link>
      {after}
    </>
  );
}
