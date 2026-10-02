"use client";

import { ArrowRight, BarChart3, Check, FileText, Pill, Users, Timer, MessageSquareText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { insights, patient, rxSuggestions } from "@/lib/data";
import { AppShell, PageTitle } from "./shell";
import { fmtTime, useProto } from "./store";

export function SignedScreen() {
  const { go, reviewSeconds, rx, noteEdits } = useProto();
  const review = fmtTime(Math.max(reviewSeconds, 1) + 120); // + ~2 min bedside exam in a real visit
  const approved = rxSuggestions.filter((r) => rx[r.id].status !== "rejected");
  const edits = Object.keys(noteEdits).length + Object.values(rx).filter((d) => d.status === "edited").length;

  const sent = [
    { icon: FileText, label: "Note saved to the medical record" },
    { icon: Pill, label: `Prescription sent to pharmacy (${approved.map((r) => r.drug).join(", ") || "none"})` },
    { icon: Users, label: "Family summary sent in Arabic and English" },
  ];

  return (
    <AppShell active="queue">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.1fr_1fr]">
        <Card className="items-center gap-6 px-6 py-9 text-center">
          <div className="relative grid size-24 place-items-center">
            <span className="absolute inset-0 rounded-full bg-mint/30" />
            <span className="bg-feature grid size-20 place-items-center rounded-full shadow-[0_20px_40px_-15px_rgba(54,82,89,0.7)]">
              <Check className="size-10 text-white" strokeWidth={3} />
            </span>
          </div>
          <div>
            <div className="text-xs font-bold tracking-[0.12em] text-slate-deep uppercase">Signed · {patient.name}</div>
            <h1 className="mt-2 text-[32px] leading-tight font-extrabold tracking-tight text-sage-deep">
              Done in <span className="text-night">{review}</span>
            </h1>
            <p className="mt-1 text-sm text-ink-soft">Review and exam time. The history was already taken by the AI agent.</p>
          </div>

          <div className="grid w-full grid-cols-3 gap-3">
            {[
              ["AI drafted", "Report + 2 Rx"],
              ["You changed", `${edits} item${edits === 1 ? "" : "s"}`],
              ["Typing", "None"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl border-2 border-white bg-mint px-3 py-3 shadow-soft-btn">
                <div className="text-xs font-bold tracking-wide text-white uppercase">{k}</div>
                <div className="mt-0.5 text-lg font-extrabold text-[#2d3e4d]">{v}</div>
              </div>
            ))}
          </div>

          <ul className="flex w-full flex-col gap-2 text-left">
            {sent.map((s) => {
              const Icon = s.icon;
              return (
                <li key={s.label} className="flex items-center gap-3 rounded-xl bg-mist px-4 py-2.5 text-sm font-semibold text-ink">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-mint text-white">
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                  <Icon className="size-4 shrink-0 text-sage-deep" />
                  {s.label}
                </li>
              );
            })}
          </ul>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <div className="text-xs font-bold tracking-[0.12em] text-sage-deep uppercase">Next patient</div>
              <CardTitle className="text-xl">Mariam Saleh · 3 y</CardTitle>
              <CardDescription>Cough for 1 week · AI intake 60% done</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div>
                <div className="mb-1 flex justify-between text-xs font-semibold text-ink-soft">
                  <span>Brief ready in about 2 min</span>
                  <span>60%</span>
                </div>
                <Progress value={60} />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="gradient" onClick={() => go("queue")}>
                  Back to queue <ArrowRight />
                </Button>
                <Button variant="outline" onClick={() => go("insights")}>
                  <BarChart3 /> Insights
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquareText className="size-4 text-sage-deep" />
                <CardTitle>Sent to the family</CardTitle>
              </div>
              <CardDescription>Plain-language summary from the signed note</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div dir="rtl" lang="ar" className="arabic rounded-xl bg-mist/60 p-4 text-[15px] leading-loose text-ink">
                عند ليلى التهاب في الأذن اليمنى. ستأخذ مضادًا حيويًا لمدة ٥ أيام، وإيبوبروفين عند الحاجة للألم والحرارة. إذا
                استمرت الحرارة أكثر من ٤٨–٧٢ ساعة، يرجى مراجعة العيادة.
              </div>
              <div className="rounded-xl border border-border p-4 text-[15px] leading-relaxed text-ink">
                Layla has an infection in her right ear. She will take an antibiotic for 5 days, and ibuprofen when needed for
                pain and fever. If the fever lasts more than 48–72 hours, please come back.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

export function InsightsScreen() {
  const max = Math.max(insights.minutesBefore, ...insights.breakdownBefore.map((b) => b.min));
  const totalBefore = insights.breakdownBefore.reduce((a, b) => a + b.min, 0);
  const totalAfter = insights.breakdownAfter.reduce((a, b) => a + b.min, 0);
  const hourMax = Math.max(...insights.hourly.map((h) => h.seen));
  const segColors = ["bg-slate-dark text-white", "bg-mint text-white", "bg-peach text-ink"];

  return (
    <AppShell active="insights">
      <PageTitle
        eyebrow="Insights"
        title={
          <>
            More patients, <em>same clinic hours.</em>
          </>
        }
        sub="The AI agent takes the history before the consultation, so the doctor's time goes to examining and deciding."
        right={
          <Badge variant="outline" className="h-8 bg-white px-3 text-sm">
            Sample data for the prototype
          </Badge>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[
          { label: "Minutes per patient", value: `${insights.minutesAfter}`, note: `was ${insights.minutesBefore}`, g: true },
          { label: "Patients per clinic", value: `${insights.patientsAfter}`, note: `was ${insights.patientsBefore}`, g: true },
          { label: "Intakes completed by families", value: `${insights.intakeCompletion}%`, note: "rest done by nurse" },
          { label: "AI drafts signed unchanged", value: `${insights.acceptedUnchanged}%`, note: "others edited by doctor" },
        ].map((t) => (
          <Card key={t.label} className="gap-2 border-2 border-white bg-mint py-5 shadow-soft-btn">
            <CardContent>
              <div className="text-sm font-semibold text-white">{t.label}</div>
              <div className={cn("mt-1 text-3xl font-extrabold tracking-tight", t.g ? "text-slate" : "text-[#2d3e4d]")}>{t.value}</div>
              <div className="mt-0.5 text-xs text-ink">{t.note}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-6 grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Where the doctor's time goes</CardTitle>
            <CardDescription>Average minutes per consultation</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {[
              { label: "Before AI intake", parts: insights.breakdownBefore, total: totalBefore },
              { label: "With AI intake", parts: insights.breakdownAfter, total: totalAfter },
            ].map((row) => (
              <div key={row.label}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-semibold text-ink">{row.label}</span>
                  <span className="font-bold text-ink tabular-nums">{row.total.toFixed(1)} min</span>
                </div>
                <div className="flex h-9 w-full gap-1 overflow-hidden rounded-xl bg-mist/60">
                  {row.parts.map((p, i) => (
                    <div
                      key={p.label}
                      className={cn("flex items-center justify-center text-xs font-bold", segColors[i])}
                      style={{ width: `${(p.min / max / (totalBefore / max)) * 100}%` }}
                      title={`${p.label}: ${p.min} min`}
                    >
                      {p.min >= 1.5 ? `${p.min}` : ""}
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft">
                  {row.parts.map((p, i) => (
                    <span key={p.label} className="flex items-center gap-1.5">
                      <span className={cn("size-2.5 rounded-sm", segColors[i])} />
                      {p.label} · {p.min} min
                    </span>
                  ))}
                </div>
              </div>
            ))}
            <div className="rounded-xl bg-mist p-4">
              <span className="text-3xl font-extrabold text-night">
                −{Math.round((1 - insights.minutesAfter / insights.minutesBefore) * 100)}%
              </span>
              <span className="ml-2 text-sm text-ink-soft">time per patient · history-taking moved to the AI agent</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Timer className="size-4 text-sage-deep" />
              <CardTitle>Patients seen per hour · today</CardTitle>
            </div>
            <CardDescription>Before AI intake: about 4 per hour</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="relative flex h-52 items-end gap-5 border-b border-border pb-2"
              role="img"
              aria-label={insights.hourly.map((h) => `${h.hour}:00 ${h.seen} patients`).join(", ")}
            >
              <div
                className="pointer-events-none absolute right-0 left-0 border-t border-dashed border-ink-soft/50"
                style={{ bottom: `${(4 / hourMax) * 170 + 8}px` }}
              >
                <span className="absolute -top-5 left-0 rounded bg-white/80 px-1 text-[11px] font-semibold text-ink-soft">before: 4 / hour</span>
              </div>
              {insights.hourly.map((h, i) => (
                <div key={h.hour} className="flex flex-1 flex-col items-center justify-end gap-2">
                  <span className={cn("text-sm font-bold tabular-nums", i === insights.hourly.length - 1 ? "text-night" : "text-ink-soft")}>
                    {h.seen}
                  </span>
                  <div
                    className={cn("w-full max-w-14 rounded-t-xl", i === insights.hourly.length - 1 ? "bg-feature" : "bg-mint/50")}
                    style={{ height: `${(h.seen / hourMax) * 170}px` }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-5">
              {insights.hourly.map((h) => (
                <div key={h.hour} className="flex-1 text-center text-xs font-semibold text-ink-soft">
                  {h.hour}:00
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader>
            <CardTitle>Quality and trust</CardTitle>
            <CardDescription>How often doctors change the AI drafts</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {[
              { label: "Drafts signed unchanged", v: insights.acceptedUnchanged },
              { label: "Prescriptions changed or rejected", v: insights.rxOverride },
              { label: "Intakes completed by families", v: insights.intakeCompletion },
            ].map((m) => (
              <div key={m.label}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-semibold text-ink">{m.label}</span>
                  <span className="font-bold text-ink tabular-nums">{m.v}%</span>
                </div>
                <Progress value={m.v} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="gap-0 py-0">
          <CardHeader className="border-b border-border/70 py-4">
            <CardTitle>Corrections flagged by doctors</CardTitle>
            <CardDescription>Each one is reviewed and used to improve the AI agent</CardDescription>
          </CardHeader>
          <ul className="divide-y divide-border/70">
            {insights.flagged.map((f) => (
              <li key={f.when} className="grid grid-cols-[90px_100px_1fr] items-center gap-4 px-5 py-3.5 text-sm md:grid-cols-[90px_100px_1fr_auto]">
                <span className="font-semibold text-ink-soft tabular-nums">{f.when}</span>
                <Badge variant="secondary">{f.what}</Badge>
                <span className="text-ink">{f.detail}</span>
                <span className="hidden text-xs font-semibold text-sage-deep md:block">{f.status}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </AppShell>
  );
}
