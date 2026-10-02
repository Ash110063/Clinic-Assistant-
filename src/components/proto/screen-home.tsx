"use client";

import {
  ArrowRight,
  AudioLines,
  FileText,
  Pill,
  ShieldCheck,
  PenLine,
  Tablet,
  Stethoscope,
  ClipboardCheck,
} from "lucide-react";
import { BrandMark, MeshBackground } from "./shell";
import { useProto } from "./store";

// Positions (px) inside the 520 × 520 "Orb illustration" frame in Figma 13:3
const ring = [
  { icon: AudioLines, label: "Patient talks to AI", x: 167, y: 40 },
  { icon: FileText, label: "AI writes the report", x: 321, y: 125 },
  { icon: Pill, label: "AI drafts prescription", x: 307, y: 352 },
  { icon: PenLine, label: "Doctor signs", x: 144, y: 426 },
  { icon: ClipboardCheck, label: "Doctor reviews", x: 0, y: 352 },
  { icon: ShieldCheck, label: "Safety checks", x: 0, y: 125 },
];

const steps = [
  {
    n: "1",
    title: "AI agent takes the history",
    body: "On a waiting-room tablet the parent confirms the child's details and weight, then answers the assistant in Arabic or English.",
  },
  {
    n: "2",
    title: "AI drafts report + prescription",
    body: "Structured note, likely diagnosis and a weight-based prescription with safety checks.",
  },
  {
    n: "3",
    title: "Doctor reviews and signs",
    body: "Examines the child, edits anything needed and signs in about 4 minutes.",
  },
];

/** Hero clip. Drop the exported video at public/hero.mp4 and set HERO_VIDEO to "hero.mp4". */
const HERO_VIDEO: string | null = null;

export function HomeScreen() {
  const { go } = useProto();
  return (
    <div className="relative isolate min-h-screen overflow-hidden">
      <MeshBackground />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 lg:px-8">
        <div className="flex items-center justify-between">
          <BrandMark tone="light" />
          <div className="flex items-center gap-1.5" aria-hidden>
            <span className="size-2.5 rounded-full bg-white/40" />
            <span className="size-2.5 rounded-full bg-white/60" />
            <span className="size-2.5 rounded-full bg-[#365259]" />
          </div>
        </div>

        <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1fr_520px]">
          <div className="flex min-w-0 flex-col gap-7">
            <h1 className="text-[36px] leading-[1.08] sm:text-[52px] tracking-tight text-white">
              <span className="font-extrabold xl:whitespace-nowrap">
                The history is taken
              </span>
              <br />
              <span className="font-bold italic xl:whitespace-nowrap">
                before the doctor walks in.
              </span>
            </h1>
            <p className="max-w-[600px] text-lg leading-relaxed font-light text-white">
              An AI agent interviews the family in the waiting room, then drafts
              the report and the prescription. The doctor reviews, adjusts and
              signs, so every consultation is shorter and the clinic sees more
              patients.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => go("intake-welcome")}
                className="bg-cta shadow-cta flex h-12 cursor-pointer items-center gap-2 rounded-[14px] px-5 text-sm font-bold text-slate-dark transition hover:brightness-105"
              >
                <Tablet className="size-4" /> Patient view
                <ArrowRight className="size-4" />
              </button>
              <button
                onClick={() => go("queue")}
                className="glass-chip flex h-12 cursor-pointer items-center gap-2 rounded-[14px] px-5 text-sm font-bold text-white transition hover:bg-white/25"
              >
                <Stethoscope className="size-4" /> Doctor view
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>

          <div
            className="relative h-[330px] w-full min-w-0 overflow-visible sm:h-[520px]"
            aria-hidden
          >
            <div className="absolute top-1/2 left-1/2 size-[520px] -translate-x-1/2 -translate-y-1/2 scale-[0.62] sm:scale-100">
              <div
                className="hero-video"
                style={{ left: 134, top: 158, width: 217, height: 210 }}
              >
                {HERO_VIDEO ? (
                  <video
                    src={HERO_VIDEO}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="hero-video__placeholder" />
                )}
              </div>
              {ring.map((r) => {
                const Icon = r.icon;
                return (
                  <div
                    key={r.label}
                    className="glass-chip absolute flex items-center gap-2 rounded-2xl px-3 py-2.5"
                    style={{ left: r.x, top: r.y }}
                  >
                    <span className="grid size-8 place-items-center rounded-lg bg-mint">
                      <Icon className="size-4 text-white" />
                    </span>
                    <span className="text-sm font-semibold whitespace-nowrap text-white">
                      {r.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="glass-panel grid gap-6 rounded-2xl border border-white/60 p-6 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="flex gap-4">
              <span className="bg-feature grid size-10 shrink-0 place-items-center rounded-xl text-lg font-extrabold text-white">
                {s.n}
              </span>
              <div>
                <div className="font-bold text-ink">{s.title}</div>
                <div className="mt-0.5 text-sm leading-relaxed text-ink-soft">
                  {s.body}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
