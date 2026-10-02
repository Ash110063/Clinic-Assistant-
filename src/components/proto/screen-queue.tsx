"use client";

import { AlertTriangle, ArrowRight, Check, Clock, FileText, Pill, Sparkles, Users, Timer, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { diagnosis, doctor, queue, type QueueStatus } from "@/lib/data";
import { AppShell, PageTitle } from "./shell";
import { useProto } from "./store";

const initials = (n: string) =>
  n
    .split(" ")
    .map((x) => x[0])
    .join("");

export function QueueScreen() {
  const { go, signed } = useProto();

  const rows = queue.map((q) => (q.demo && signed ? { ...q, status: "signed" as QueueStatus } : q));
  const ready = rows.filter((r) => r.status === "ready");
  const inIntake = rows.filter((r) => r.status === "intake" || r.status === "waiting");
  const done = rows.filter((r) => r.status === "signed");

  const stats = [
    { label: "Seen today", value: String(done.length), note: "of 18 booked", icon: Users },
    { label: "Ready for review", value: String(ready.length), note: "AI brief prepared", icon: FileText },
    { label: "Avg. time per patient", value: "4.6 min", note: "was 12 min before AI intake", icon: Timer, highlight: true },
    { label: "Projected today", value: "28", note: "patients · was 16", icon: Clock },
  ];

  return (
    <AppShell active="queue">
      <PageTitle
        eyebrow="Thursday · 1 October"
        title={
          <>
            Good morning, <em>{doctor.name}</em>
          </>
        }
        sub={`${doctor.clinic} · The AI agent has already taken the history for patients marked “Ready”.`}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="gap-3 border-2 border-white bg-mint py-5 shadow-soft-btn">
              <CardContent className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-white">{s.label}</div>
                  <div className={cn("mt-1 text-3xl font-extrabold tracking-tight", s.highlight ? "text-slate" : "text-[#2d3e4d]")}>
                    {s.value}
                  </div>
                  <div className="mt-1 text-xs text-ink">{s.note}</div>
                </div>
                <span className="grid size-10 place-items-center rounded-xl bg-sage-light">
                  <Icon className="size-5 text-white" />
                </span>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          <Card className="gap-0 py-0">
            <CardHeader className="border-b border-border/70 py-4">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-slate-dark" />
                <CardTitle>Ready for review</CardTitle>
              </div>
              <CardDescription>History taken by the AI agent, vitals added, report and prescription drafted</CardDescription>
            </CardHeader>
            {ready.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-ink-soft">No briefs waiting. New ones appear as families finish intake.</div>
            ) : (
              <ul className="divide-y divide-border/70">
                {ready.map((p) => (
                  <li key={p.id}>
                    <div className={cn("flex flex-wrap items-center gap-4 px-5 py-4", p.demo && "bg-mist")}>
                      <span className="w-12 text-sm font-bold text-ink-soft tabular-nums">{p.ticket}</span>
                      <Avatar className="size-9">
                        <AvatarFallback className={cn(p.demo && "bg-feature text-white")}>{initials(p.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[15px] font-bold text-ink">{p.name}</span>
                          <span className="text-sm text-ink-soft">{p.age}</span>
                        </div>
                        <div className="mt-0.5 text-sm text-ink-soft">{p.complaint}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="slate" className="bg-transparent">Brief ready · {p.readyFor}</Badge>
                        {p.demo ? (
                          <Button className="h-10 px-5 text-base" onClick={() => go("brief")}>
                            Review <ArrowRight />
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="gap-0 py-0">
            <CardHeader className="border-b border-border/70 py-4">
              <div className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin text-sage-deep" />
                <CardTitle>In the waiting room</CardTitle>
              </div>
              <CardDescription>Talking to the AI agent or checked in</CardDescription>
            </CardHeader>
            <ul className="divide-y divide-border/70">
              {inIntake.map((p) => (
                <li key={p.id} className={cn("flex flex-wrap items-center gap-4 px-5 py-3.5", p.urgent && "bg-mist")}>
                  <span className="w-12 text-sm font-bold text-ink-soft tabular-nums">{p.ticket}</span>
                  <Avatar className="size-8">
                    <AvatarFallback>{initials(p.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-ink">
                      {p.name} <span className="font-normal text-ink-soft">· {p.age}</span>
                    </div>
                    <div className="text-sm text-ink-soft">{p.complaint}</div>
                  </div>
                  {p.urgent ? (
                    <Badge variant="ink">
                      <AlertTriangle className="text-peach" /> {p.urgent}
                    </Badge>
                  ) : p.status === "intake" ? (
                    <div className="w-44">
                      <div className="mb-1 flex justify-between text-xs font-semibold text-ink-soft">
                        <span>AI intake</span>
                        <span>{p.progress}%</span>
                      </div>
                      <Progress value={p.progress} />
                    </div>
                  ) : (
                    <Badge variant="outline" className="bg-white">Checked in</Badge>
                  )}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="gap-0 py-0">
            <CardHeader className="border-b border-border/70 py-4">
              <CardTitle>Signed today</CardTitle>
            </CardHeader>
            <ul className="divide-y divide-border/70">
              {done.map((p) => (
                <li key={p.id} className="flex items-center gap-4 px-5 py-3">
                  <span className="w-12 text-sm font-bold text-ink-soft tabular-nums">{p.ticket}</span>
                  <span className="flex-1 text-sm font-semibold text-ink">
                    {p.name} <span className="font-normal text-ink-soft">· {p.complaint}</span>
                  </span>
                  <Badge>
                    <Check /> Signed
                  </Badge>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          {!signed ? (
            <Card>
              <CardHeader>
                <div className="text-xs font-bold tracking-[0.12em] text-sage-deep uppercase">Next up · A-14</div>
                <CardTitle className="text-xl">Layla Hassan · 6 y</CardTitle>
                <CardDescription>AI brief ready 4 min ago</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="rounded-xl bg-white p-3.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-sage-deep uppercase">
                    <Sparkles className="size-3.5" /> AI summary
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-ink">
                    Right ear pain 2 days, fever up to 38.6–39 °C after a cold. Likely <b>{diagnosis.text.toLowerCase()}</b>.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="ink">Allergy: Penicillin</Badge>
                  <Badge variant="secondary" className="bg-mist text-slate-dark">
                    <Pill /> Draft prescription ready
                  </Badge>
                </div>
                <Button variant="gradient" size="lg" className="h-12 text-base" onClick={() => go("brief")}>
                  Open brief <ArrowRight />
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="text-xs font-bold tracking-[0.12em] text-slate-deep uppercase">Just signed</div>
                <CardTitle className="text-xl">Layla Hassan</CardTitle>
                <CardDescription>Note, prescription and family summary sent.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={() => go("insights")}>
                  View insights <ArrowRight />
                </Button>
              </CardContent>
            </Card>
          )}

          <Card className="bg-feature border-0 text-white">
            <CardContent className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm font-bold">
                <Sparkles className="size-4" /> How it works
              </div>
              <ol className="flex list-decimal flex-col gap-1 pl-4 text-sm leading-relaxed text-white/90">
                <li>Family answers the AI agent in the waiting room.</li>
                <li>Nurse adds weight and vitals.</li>
                <li>AI drafts the report and prescription.</li>
                <li>You examine, edit and sign.</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
