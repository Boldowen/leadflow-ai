"use client";

import { animate, AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Loader } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LEVELS, PRESETS, THINKING_MS, type Level } from "@/lib/landing-data";
import { ShineButton } from "@/components/ui/shine-button";
import { Eyebrow, SectionTitle } from "./section-heading";

type Phase = "idle" | "thinking" | "done";
const RING = 2 * Math.PI * 52; // circumference of the r=52 score ring

export function ScoringDemo() {
  const reduce = useReducedMotion();
  const [preset, setPreset] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [score, setScore] = useState(0);
  const [tab, setTab] = useState<Level>("hot");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const counter = useRef<{ stop: () => void }>(undefined);

  const stop = () => {
    clearTimeout(timer.current);
    counter.current?.stop();
  };
  useEffect(() => stop, []);

  function pick(i: number) {
    stop();
    setPreset(i);
    setPhase("idle");
    setScore(0);
  }

  function analyze() {
    stop();
    setPhase("thinking");
    setScore(0);
    // TODO: call the real scoring API (POST /api/leads/:id/analyze, or a public demo endpoint with its own
    // rate limit) instead of these canned results. The real analysis returns Hot/Warm/Cold, summary and next
    // action — it has no 0–100 score yet, so the ring would need a score field added to the AI output.
    const target = PRESETS[preset].score;
    timer.current = setTimeout(() => {
      setPhase("done");
      if (reduce) return setScore(target);
      counter.current = animate(0, target, { duration: 0.75, ease: "easeOut", onUpdate: (v) => setScore(Math.round(v)) });
    }, THINKING_MS);
  }

  const p = PRESETS[preset];
  const lv = LEVELS[p.level];

  return (
    <section id="demo" aria-labelledby="demo-title" className="mx-auto max-w-[1200px] scroll-mt-20 px-6 pt-[100px] pb-10">
      <Eyebrow>AI lead scoring · live demo</Eyebrow>
      <SectionTitle id="demo-title" className="mb-3">Pick a lead. Watch it get scored.</SectionTitle>
      <p className="mb-9 text-base text-[#a1a1aa]">
        Demo with sample messages. In the product, scores come from Claude and you can add notes, re-run analysis or change status.
      </p>

      <div className="flex flex-wrap gap-5">
        <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-4 rounded-[22px] border border-white/[.08] bg-white/[.03] p-7">
          <span id="demo-messages" className="text-[13px] text-[#a1a1aa]">Incoming lead message</span>
          <div role="radiogroup" aria-labelledby="demo-messages" className="flex flex-col gap-2.5">
            {PRESETS.map((x, i) => {
              const active = i === preset;
              return (
                <button
                  key={x.text}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => pick(i)}
                  className={`cursor-pointer rounded-[14px] border px-4 py-3.5 text-left text-[15px] leading-[1.5] text-[#e4e4e7] transition-colors hover:border-[rgba(129,140,248,.7)] ${
                    active ? "border-[rgba(129,140,248,.7)] bg-[rgba(79,70,229,.16)]" : "border-white/[.08] bg-white/[.02]"
                  }`}
                >
                  {x.text}
                </button>
              );
            })}
          </div>
          <ShineButton onClick={analyze} disabled={phase === "thinking"} className="self-start border-0 px-[22px] text-[15px]">
            {phase === "done" ? "Re-run analysis" : "Analyze lead"}
          </ShineButton>
        </div>

        <div aria-live="polite" className="flex min-h-[340px] min-w-0 flex-[1_1_420px] flex-col gap-[18px] rounded-[22px] border border-white/[.08] bg-[#111118] p-7">
          {phase === "idle" && <div className="flex flex-1 items-center justify-center p-10 text-center text-[#a1a1aa]">Choose a message and press Analyze.</div>}
          {phase === "thinking" && (
            <div className="flex flex-1 flex-col items-center justify-center gap-3.5 text-[#a5b4fc]">
              <Loader aria-hidden size={40} strokeWidth={2} color="#818cf8" className="lp-spin" />
              <span>
                Claude is reading the lead<span className="lp-dot">…</span>
              </span>
            </div>
          )}
          {phase === "done" && (
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col gap-[18px]"
            >
              <div className="flex flex-wrap items-center gap-6">
                <div className="relative size-32">
                  <svg width="128" height="128" viewBox="0 0 128 128" aria-hidden>
                    <circle cx="64" cy="64" r="52" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="10" />
                    <circle
                      cx="64" cy="64" r="52" fill="none" stroke={lv.color} strokeWidth="10" strokeLinecap="round"
                      strokeDasharray={RING} strokeDashoffset={RING * (1 - score / 100)} transform="rotate(-90 64 64)"
                    />
                  </svg>
                  <span className="lp-display absolute inset-0 flex items-center justify-center text-4xl font-bold text-white">{score}</span>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="self-start rounded-full border px-3.5 py-1.5 text-sm font-bold" style={{ color: lv.color, borderColor: lv.color }}>{lv.name}</span>
                  <span className="text-[13px] text-[#a1a1aa]">Lead score out of 100</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-xs tracking-[.08em] text-[#a1a1aa] uppercase">AI summary</span>
                <span className="leading-[1.6] text-[#e4e4e7]">{p.summary}</span>
              </div>
              <div className="flex flex-col gap-1.5 rounded-[14px] border border-[rgba(129,140,248,.3)] bg-[rgba(79,70,229,.12)] px-4 py-3.5">
                <span className="text-xs tracking-[.08em] text-[#a5b4fc] uppercase">Recommended next action</span>
                <span className="font-medium text-white">{p.action}</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="mt-7 rounded-[22px] border border-white/[.08] bg-white/[.02] p-6">
        <div role="tablist" aria-label="Lead temperatures" className="inline-flex gap-1 rounded-xl bg-white/[.05] p-1">
          {(Object.keys(LEVELS) as Level[]).map((k) => {
            const active = k === tab;
            return (
              <button
                key={k}
                type="button"
                role="tab"
                id={`temp-tab-${k}`}
                aria-selected={active}
                aria-controls="temp-panel"
                onClick={() => setTab(k)}
                className="relative min-h-11 cursor-pointer rounded-[9px] px-[18px] py-2.5 text-sm font-semibold"
                style={{ color: active ? "#0a0a0f" : "#d4d4d8" }}
              >
                {active && (
                  <motion.span
                    layoutId="temp-tab-indicator"
                    aria-hidden
                    className="absolute inset-0 rounded-[9px]"
                    style={{ background: LEVELS[k].color }}
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative">{LEVELS[k].name}</span>
              </button>
            );
          })}
        </div>
        <div id="temp-panel" role="tabpanel" aria-labelledby={`temp-tab-${tab}`}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={tab}
              initial={reduce ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="mx-1 mt-4 mb-0 text-base leading-[1.6] text-[#d4d4d8]"
            >
              {LEVELS[tab].text}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
