"use client";

import * as React from "react";
import {
  ArrowRight,
  Check,
  FastForward,
  Mic,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Scale,
  Keyboard,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { consentText, doctor, intake, intakeQuestions, patient } from "@/lib/data";
import { KioskShell } from "./shell";
import { useProto } from "./store";

/* ------------------------------------------------------------------ */
/* 1 · Welcome & consent                                               */
/* ------------------------------------------------------------------ */

export function IntakeWelcomeScreen() {
  const { lang, set, go } = useProto();
  const [agree, setAgree] = React.useState(false);

  return (
    <KioskShell>
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-6 py-6">
        <div className="text-center">
          <Badge variant="outline" className="mb-4 h-8 border-white bg-white px-3 text-sm text-ink">
            Ticket {patient.ticket} · {patient.appointment} with {doctor.short}
          </Badge>
          <h1 className="kiosk-title text-[44px] leading-tight font-extrabold tracking-tight">
            Welcome, {patient.guardian.split(" ")[0]}. <span className="font-bold italic">Let's get {patient.first} ready.</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-lg font-light text-white">
            Answer a few questions while you wait. The doctor will already know what's wrong when you go in.
          </p>
        </div>

        <Card className="gap-6 py-7">
          <CardContent className="flex flex-col gap-6">
            <fieldset>
              <legend className="mb-3 text-sm font-bold tracking-[0.08em] text-white uppercase">Choose a language · اختر اللغة</legend>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    ["ar", "العربية", "Arabic"],
                    ["en", "English", "الإنجليزية"],
                  ] as const
                ).map(([k, main, sub]) => (
                  <button
                    key={k}
                    onClick={() => set({ lang: k })}
                    aria-pressed={lang === k}
                    className={cn(
                      "flex h-20 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 transition-all",
                      lang === k
                        ? "border-mint bg-mint text-white shadow-soft-btn"
                        : "border-white bg-white text-ink hover:border-mint"
                    )}
                  >
                    <span className={cn("text-2xl font-bold", k === "ar" && "arabic")}>{main}</span>
                    <span className={cn("text-xs font-semibold", lang === k ? "text-white/80" : "text-ink-soft")}>{sub}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="rounded-2xl bg-white/75 p-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-bold text-sage-deep">
                <ShieldCheck className="size-4" /> {lang === "ar" ? "قبل أن نبدأ" : "Before we start"}
              </div>
              <p
                dir={lang === "ar" ? "rtl" : "ltr"}
                lang={lang}
                className={cn("text-[17px] leading-relaxed text-ink", lang === "ar" && "arabic leading-loose")}
              >
                {lang === "ar" ? consentText.ar : consentText.en}
              </p>
              {lang === "ar" && <p className="mt-2 text-sm text-ink-soft italic">{consentText.en}</p>}
            </div>

            <div className="flex items-center gap-3">
              <Checkbox id="agree" checked={agree} onCheckedChange={(v) => setAgree(v === true)} className="size-6" />
              <Label htmlFor="agree" className="text-base text-white">
                {lang === "ar" ? <span className="arabic">أوافق</span> : "I agree"}
                <span className="text-white/80">· {lang === "ar" ? "I agree" : "أوافق"}</span>
              </Label>
            </div>

            <Button size="lg" className="bg-cta-long shadow-cta h-14 rounded-[18px] text-lg font-bold text-ink" disabled={!agree} onClick={() => go("intake-details")}>
              <Mic className="size-5" /> {lang === "ar" ? <span className="arabic">ابدأ</span> : "Start"} · {lang === "ar" ? "Start" : "ابدأ"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </KioskShell>
  );
}

/* ------------------------------------------------------------------ */
/* 2 · AI intake conversation                                          */
/* ------------------------------------------------------------------ */

const LINE_MS = 2600;

export function IntakeChatScreen() {
  const { lang, shownLines, playing, set, go } = useProto();
  const [speed, setSpeed] = React.useState(1);
  const viewportRef = React.useRef<HTMLDivElement>(null);

  const done = shownLines >= intake.length;
  const active = playing && !done;
  const next = intake[shownLines];
  const parentTyping = active && next?.speaker === "parent";

  React.useEffect(() => {
    if (!active) return;
    const delay = shownLines === 0 ? 700 : (next?.speaker === "parent" ? LINE_MS * 1.1 : LINE_MS * 0.8) / speed;
    const t = setTimeout(() => set({ shownLines: shownLines + 1 }), delay);
    return () => clearTimeout(t);
  }, [active, shownLines, speed, set, next]);

  React.useEffect(() => {
    const el = viewportRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [shownLines]);

  const visible = intake.slice(0, shownLines);
  const notes = visible.flatMap((l) => l.notes ?? []);
  const asked = visible.filter((l) => l.speaker === "agent" && l.id !== 1 && l.id !== 17).length;
  const lastAgent = [...visible].reverse().find((l) => l.speaker === "agent");

  const primary = (l: (typeof intake)[number]) => (lang === "ar" ? l.ar : l.en);
  const secondary = (l: (typeof intake)[number]) => (lang === "ar" ? l.en : l.ar);

  return (
    <KioskShell>
      <div className="mx-auto grid w-full max-w-6xl flex-1 content-start items-start gap-6 lg:grid-cols-[1fr_340px]">
        <Card className="gap-0 py-0">
          <CardHeader className="flex-row items-center gap-3 border-b border-border/70 py-4">
            <span className="relative grid size-11 place-items-center">
              {active && !parentTyping && <span className="pulse-ring absolute inset-0 rounded-full bg-sage/40" />}
              <span className="orb relative grid size-11 place-items-center rounded-full text-xs font-extrabold text-white">AI</span>
            </span>
            <div className="min-w-0 flex-1">
              <CardTitle>Clinic assistant</CardTitle>
              <CardDescription>
                Talking with {patient.guardian.split(" ")[0]} about {patient.first} · {lang === "ar" ? "Arabic" : "English"}
              </CardDescription>
            </div>
            <div className="hidden w-48 sm:block">
              <div className="mb-1 flex justify-between text-xs font-semibold text-ink-soft">
                <span>Questions</span>
                <span className="tabular-nums">
                  {asked} / {intakeQuestions}
                </span>
              </div>
              <Progress value={(asked / intakeQuestions) * 100} />
            </div>
          </CardHeader>

          <ScrollArea className="h-[480px]" viewportRef={viewportRef}>
            <ol className="flex flex-col gap-4 p-5">
              {visible.map((l) => {
                const isAgent = l.speaker === "agent";
                return (
                  <li
                    key={l.id}
                    className={cn(
                      "animate-in fade-in slide-in-from-bottom-2 flex gap-3 duration-500",
                      !isAgent && "flex-row-reverse"
                    )}
                  >
                    {isAgent ? (
                      <span className="orb mt-1 grid size-8 shrink-0 place-items-center rounded-full text-[10px] font-extrabold text-white">
                        AI
                      </span>
                    ) : (
                      <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-slate-mist text-xs font-bold text-slate-deep">
                        HH
                      </span>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-3",
                        isAgent ? "rounded-tl-sm bg-white" : "rounded-tr-sm bg-mint text-white"
                      )}
                    >
                      <p
                        dir="auto"
                        lang={lang}
                        className={cn("text-[16px] leading-relaxed", lang === "ar" && "arabic text-[17px] leading-loose")}
                      >
                        {primary(l)}
                      </p>
                      <p
                        dir="auto"
                        className={cn(
                          "mt-1 text-sm italic",
                          isAgent ? "text-ink-soft" : "text-white/80",
                          lang === "en" && "arabic not-italic"
                        )}
                      >
                        {secondary(l)}
                      </p>
                    </div>
                  </li>
                );
              })}
              {parentTyping && (
                <li className="flex flex-row-reverse items-center gap-2 pr-1 text-xs font-semibold text-ink-soft">
                  <span className="wave flex h-5 items-center gap-[3px]" aria-hidden>
                    {Array.from({ length: 10 }).map((_, i) => (
                      <span key={i} style={{ height: `${8 + ((i * 37) % 12)}px`, animationDelay: `${(i % 5) * 0.1}s` }} />
                    ))}
                  </span>
                  Listening…
                </li>
              )}
            </ol>
          </ScrollArea>

          {/* Composer */}
          <div className="flex flex-col gap-3 border-t border-border/70 px-5 py-4">
            {!done && lastAgent?.chips && (
              <div className="flex flex-wrap gap-2" aria-label="Quick answers">
                {lastAgent.chips.map((c) => (
                  <span key={c} className="rounded-full border border-white bg-white/70 px-3.5 py-1.5 text-sm font-semibold text-sage-deep">
                    {c}
                  </span>
                ))}
              </div>
            )}
            {done ? (
              <Button size="lg" className="bg-cta-long shadow-cta h-14 rounded-[18px] text-lg font-bold text-ink" onClick={() => go("intake-done")}>
                <Check className="size-5" /> {lang === "ar" ? <span className="arabic">إنهاء</span> : "Finish"} · {lang === "ar" ? "Finish" : "إنهاء"}
              </Button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  aria-label="Hold to speak"
                  className={cn(
                    "relative grid size-14 shrink-0 cursor-pointer place-items-center rounded-full text-white",
                    parentTyping ? "orb" : "bg-mint shadow-soft-btn"
                  )}
                >
                  {parentTyping && <span className="pulse-ring absolute inset-0 rounded-full bg-sage/40" />}
                  <Mic className="relative size-6" />
                </button>
                <div className="flex h-14 flex-1 items-center gap-2 rounded-2xl border border-input bg-white/90 px-4 text-ink-soft">
                  <Keyboard className="size-4" />
                  <span className="text-[15px]">{lang === "ar" ? "تكلّم أو اكتب إجابتك…" : "Speak or type your answer…"}</span>
                </div>
              </div>
            )}
          </div>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-sage" />
                <CardTitle>What I've noted</CardTitle>
              </div>
              <CardDescription>Shared with {doctor.short} when you finish</CardDescription>
            </CardHeader>
            <CardContent>
              {notes.length === 0 ? (
                <div className="rounded-xl border border-dashed border-stone/70 px-4 py-6 text-center text-sm text-ink-soft">
                  Your answers will appear here
                </div>
              ) : (
                <ul className="flex flex-col gap-2">
                  {notes.map((n) => (
                    <li
                      key={n}
                      className="animate-in fade-in zoom-in-95 flex items-start gap-2.5 rounded-xl bg-white/80 px-3 py-2.5 text-sm font-semibold text-ink duration-300"
                    >
                      <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-mint text-white">
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                      {n}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="gap-3 py-4">
            <CardContent className="flex flex-col gap-2">
              <div className="text-xs font-bold tracking-wide text-ink-soft uppercase">Demo controls</div>
              <div className="flex flex-wrap gap-1.5">
                {!done && (
                  <Button size="sm" variant="outline" onClick={() => set({ playing: !playing })}>
                    {playing ? <Pause /> : <Play />} {playing ? "Pause" : "Play"}
                  </Button>
                )}
                {[1, 2].map((s) => (
                  <Button key={s} size="sm" variant={speed === s ? "secondary" : "ghost"} onClick={() => setSpeed(s)}>
                    {s}×
                  </Button>
                ))}
                <Button size="sm" variant="ghost" onClick={() => set({ shownLines: intake.length, playing: false })}>
                  <FastForward /> Skip
                </Button>
                <Button size="sm" variant="ghost" onClick={() => set({ shownLines: 0, playing: true })}>
                  <RotateCcw /> Restart
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </KioskShell>
  );
}

/* ------------------------------------------------------------------ */
/* 3 · Intake complete                                                 */
/* ------------------------------------------------------------------ */

export function IntakeDoneScreen() {
  const { go, lang } = useProto();
  const stepsList = [
    { icon: Scale, title: lang === "ar" ? "فحص الممرضة" : "Nurse check", sub: "Check weight & temperature · now" },
    { icon: Stethoscope, title: lang === "ar" ? "الدكتورة نور" : doctor.name, sub: "About 8 minutes" },
  ];
  return (
    <KioskShell>
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 py-6 text-center">
        <div className="relative grid size-28 place-items-center">
          <span className="absolute inset-0 rounded-full bg-white/25" />
          <span className="bg-feature grid size-24 place-items-center rounded-full shadow-[0_20px_40px_-15px_rgba(54,82,89,0.7)]">
            <Check className="size-12 text-white" strokeWidth={3} />
          </span>
        </div>
        <div>
          <h1 dir="rtl" className="arabic kiosk-title text-[34px] leading-tight font-bold">
            شكرًا هدى! ملخص ليلى عند الدكتورة الآن.
          </h1>
          <p className="mt-2 text-xl font-light text-white">Thank you, Huda. Layla's summary is with the doctor now.</p>
        </div>

        <Card className="w-full gap-4 py-6">
          <CardContent className="flex flex-col items-center gap-5">
            <div>
              <div className="text-xs font-bold tracking-[0.12em] text-ink-soft uppercase">Your ticket</div>
              <div className="text-6xl font-extrabold tracking-tight text-night">{patient.ticket}</div>
            </div>
            <ol className="grid w-full gap-3 sm:grid-cols-2">
              {stepsList.map((s, i) => {
                const Icon = s.icon;
                return (
                  <li key={i} className="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3.5 text-left">
                    <span className={cn("grid size-10 place-items-center rounded-xl", i === 0 ? "bg-mint text-white" : "bg-sage-light text-white")}>
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <div className={cn("font-bold text-ink", lang === "ar" && "arabic")}>{s.title}</div>
                      <div className="text-sm text-ink-soft">{s.sub}</div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>

        <Button size="lg" className="glass-chip rounded-[14px] text-white shadow-none" onClick={() => go("queue")}>
          Demo: switch to doctor view <ArrowRight />
        </Button>
      </div>
    </KioskShell>
  );
}
