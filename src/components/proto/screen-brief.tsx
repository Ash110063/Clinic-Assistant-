"use client";

import * as React from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Ban,
  Calculator,
  Check,
  CircleAlert,
  Info,
  Link2,
  MessageSquareText,
  Pencil,
  PenLine,
  Pill,
  Sparkles,
  Stethoscope,
  Timer,
  Undo2,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  blockedRx,
  diagnosis,
  examOptions,
  intake,
  patient,
  plan,
  rxSuggestions,
  subjective,
  triage,
  type ExamKey,
  type NoteLine,
  type Rx,
} from "@/lib/data";
import { AppShell } from "./shell";
import { ageLabel } from "./screen-details";
import { fmtTime, useProto, type RxDecision } from "./store";

/* ---------------- Report line (source-linked, editable) ---------------- */

function ReportLine({
  line,
  selected,
  onSelect,
}: {
  line: NoteLine;
  selected: boolean;
  onSelect: () => void;
}) {
  const { noteEdits, editNote, confirmedLow, confirmLow } = useProto();
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const text = noteEdits[line.id] ?? line.text;
  const needsConfirm = line.lowConfidence && !confirmedLow.includes(line.id) && !noteEdits[line.id];

  if (editing) {
    return (
      <li className="rounded-xl bg-white p-3 shadow-sm">
        <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus className="min-h-16" aria-label="Edit line" />
        <div className="mt-2 flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
            <X /> Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => {
              editNote(line.id, draft);
              setEditing(false);
            }}
          >
            <Check /> Save
          </Button>
        </div>
      </li>
    );
  }

  return (
    <li>
      <div
        className={cn(
          "group flex items-start gap-2 rounded-xl px-3 py-1.5 transition-colors",
          selected ? "bg-mist" : "hover:bg-mist/60",
          needsConfirm && "border border-dashed border-sage/60 bg-white"
        )}
      >
        <button className="min-w-0 flex-1 cursor-pointer py-0.5 text-left text-[15px] leading-relaxed text-ink" onClick={onSelect}>
          {text}
          {noteEdits[line.id] && (
            <Badge variant="outline" className="ml-2 align-middle">
              Edited by you
            </Badge>
          )}
          {line.lowConfidence && confirmedLow.includes(line.id) && !noteEdits[line.id] && (
            <Badge className="ml-2 align-middle">
              <Check /> Reviewed
            </Badge>
          )}
        </button>
        <div className={cn("flex shrink-0 items-center", !selected && "opacity-0 group-hover:opacity-100 focus-within:opacity-100")}>
          {line.sources.length > 0 && (
            <Button size="sm" variant="ghost" aria-label="Show what the parent said" onClick={onSelect}>
              <Link2 />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            aria-label="Edit line"
            onClick={() => {
              setDraft(text);
              setEditing(true);
            }}
          >
            <Pencil />
          </Button>
        </div>
      </div>
      {needsConfirm && (
        <div className="mt-1.5 mb-1 ml-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="flex items-center gap-1.5 font-semibold text-sage-deep">
            <CircleAlert className="size-4" /> {line.lowConfidence}
          </span>
          <Button size="sm" variant="secondary" onClick={() => confirmLow(line.id)}>
            <Check /> Keep as reported
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setDraft(text);
              setEditing(true);
            }}
          >
            Correct
          </Button>
        </div>
      )}
    </li>
  );
}

/* ---------------- Prescription card (compact) ---------------- */

const statusMeta: Record<RxDecision["status"], { label: string; variant: "outline" | "default" | "secondary" | "ink" }> = {
  pending: { label: "AI draft", variant: "outline" },
  accepted: { label: "Approved", variant: "default" },
  edited: { label: "Edited & approved", variant: "default" },
  rejected: { label: "Rejected", variant: "ink" },
};

function RxCard({ rx }: { rx: Rx }) {
  const { rx: decisions, setRx } = useProto();
  const d = decisions[rx.id];
  const [editOpen, setEditOpen] = React.useState(false);
  const [rejectOpen, setRejectOpen] = React.useState(false);
  const [form, setForm] = React.useState({ dose: d.dose, frequency: d.frequency, duration: d.duration });
  const [reason, setReason] = React.useState("");
  const meta = statusMeta[d.status];

  return (
    <div className={cn("rounded-2xl border border-border bg-white p-4", d.status === "rejected" && "opacity-70")}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className={cn("text-lg font-extrabold text-ink", d.status === "rejected" && "line-through")}>{rx.drug}</div>
          <div className="text-xs text-ink-soft">{rx.form}</div>
        </div>
        <Badge variant={meta.variant}>{meta.label}</Badge>
      </div>

      <dl className="mt-3 grid grid-cols-3 gap-2">
        {[
          ["Dose", d.dose],
          ["How often", d.frequency],
          ["Duration", d.duration],
        ].map(([k, v]) => (
          <div key={k} className="rounded-lg bg-mist px-2.5 py-2">
            <dt className="text-[11px] font-bold tracking-wide text-ink-soft uppercase">{k}</dt>
            <dd className="text-sm font-bold text-ink">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-2.5 flex items-start gap-1.5 text-xs text-ink-soft">
        <Calculator className="mt-0.5 size-3.5 shrink-0 text-sage-deep" />
        <span className="font-mono">{rx.calc}</span>
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-ink">{rx.why}</p>

      <ul className="mt-2.5 flex flex-wrap gap-1.5">
        {rx.checks.map((c) => (
          <li
            key={c.label}
            title={c.detail}
            className={cn(
              "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
              c.status === "pass" ? "bg-slate-mist text-slate-deep" : "bg-mist text-sage-deep"
            )}
          >
            {c.status === "pass" ? <Check className="size-3" strokeWidth={3} /> : <Info className="size-3" strokeWidth={3} />}
            {c.label}
          </li>
        ))}
      </ul>
      {rx.checks
        .filter((c) => c.status === "note")
        .map((c) => (
          <p key={c.label} className="mt-1.5 text-xs text-sage-deep">
            {c.label}: {c.detail}
          </p>
        ))}

      <div className="mt-3 flex flex-wrap justify-end gap-2">
        {d.status !== "pending" ? (
          <>
            {d.reason && <span className="mr-auto self-center text-xs text-ink-soft">Reason: {d.reason}</span>}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setRx(rx.id, { status: "pending", reason: undefined, dose: rx.dose, frequency: rx.frequency, duration: rx.duration })}
            >
              <Undo2 /> Undo
            </Button>
          </>
        ) : (
          <>
            <Button size="sm" variant="outline" onClick={() => setRejectOpen(true)}>
              <X /> Reject
            </Button>
            <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil /> Edit
            </Button>
            <Button size="sm" onClick={() => setRx(rx.id, { status: "accepted" })}>
              <Check /> Approve
            </Button>
          </>
        )}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {rx.drug}</DialogTitle>
            <DialogDescription>Your changes replace the AI draft. The original stays in the audit trail.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            {(["dose", "frequency", "duration"] as const).map((f) => (
              <div key={f} className="grid gap-1.5">
                <Label htmlFor={`${rx.id}-${f}`} className="capitalize">
                  {f}
                </Label>
                <Input id={`${rx.id}-${f}`} value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setRx(rx.id, { status: "edited", ...form });
                setEditOpen(false);
              }}
            >
              <Check /> Save &amp; approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject {rx.drug}?</DialogTitle>
            <DialogDescription>Optional: tell the assistant why. This improves future drafts.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap gap-2">
            {["Clinical judgement", "Not on formulary", "Family preference"].map((r) => (
              <Button key={r} size="sm" variant={reason === r ? "secondary" : "outline"} onClick={() => setReason(r)}>
                {r}
              </Button>
            ))}
          </div>
          <Textarea placeholder="Add a note (optional)" value={reason} onChange={(e) => setReason(e.target.value)} aria-label="Reason" />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setRx(rx.id, { status: "rejected", reason: reason || undefined });
                setRejectOpen(false);
              }}
            >
              Reject draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ---------------- The brief ---------------- */

export function BriefScreen() {
  const { go, set, exam, setExam, confirmedLow, noteEdits, rx, dxAccepted, reviewSeconds, details, lang } = useProto();
  const relation = { mother: "Mother", father: "Father", other: "Guardian" }[details.relation];
  const parentWeight = details.weightUnknown ? "Parent didn't know" : details.weight ? `Parent said ${details.weight} kg` : "";
  const vitals = triage.vitals.map((v) =>
    v.label === "Weight" ? { ...v, note: parentWeight ? `Nurse measured · ${parentWeight}` : "Measured by nurse today" } : v
  );
  const [selected, setSelected] = React.useState<string | null>(null);
  const [tab, setTab] = React.useState("rx");
  const [seconds, setSeconds] = React.useState(reviewSeconds);
  const refs = React.useRef<Record<number, HTMLLIElement | null>>({});

  React.useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const allLines = [...subjective, ...plan];
  const sel = allLines.find((l) => l.id === selected);
  const sources = sel?.sources ?? [];

  React.useEffect(() => {
    const first = sources[0];
    if (first) setTimeout(() => refs.current[first]?.scrollIntoView({ behavior: "smooth", block: "center" }), 150);
  }, [selected]); // eslint-disable-line react-hooks/exhaustive-deps

  const select = (id: string) => {
    setSelected(id);
    setTab("talk");
  };

  // Checklist
  const examDone = (Object.keys(examOptions) as ExamKey[]).every((k) => exam[k]);
  const flagsDone = subjective.filter((l) => l.lowConfidence).every((l) => confirmedLow.includes(l.id) || noteEdits[l.id]);
  const rxDone = Object.values(rx).every((d) => d.status !== "pending");
  const examSupports = exam.right === examOptions.right.supports;
  const checklist = [
    { label: "Exam added", ok: examDone },
    { label: "Flag reviewed", ok: flagsDone },
    { label: "Diagnosis confirmed", ok: dxAccepted },
    { label: "Prescription decided", ok: rxDone },
  ];
  const ready = checklist.every((c) => c.ok);

  return (
    <AppShell active="queue">
      {/* Sticky review bar */}
      <div className="glass sticky top-[76px] z-20 mb-6 flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3">
        <Button variant="ghost" size="sm" onClick={() => go("queue")}>
          <ArrowLeft /> Queue
        </Button>
        <div className="flex items-center gap-1.5 text-sm font-semibold text-ink-soft tabular-nums">
          <Timer className="size-4 text-sage-deep" /> Review {fmtTime(seconds)}
        </div>
        <ul className="flex flex-wrap items-center gap-1.5" aria-label="Before you sign">
          {checklist.map((c) => (
            <li
              key={c.label}
              className={cn(
                "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold",
                c.ok ? "bg-mint text-white" : "bg-mist text-ink-soft"
              )}
            >
              {c.ok ? <Check className="size-3" strokeWidth={3} /> : <span className="size-1.5 rounded-full bg-stone" />}
              {c.label}
            </li>
          ))}
        </ul>
        <Button
          variant="gradient"
          className="ml-auto"
          disabled={!ready}
          onClick={() => {
            set({ signed: true, reviewSeconds: seconds });
            go("signed");
          }}
        >
          <PenLine /> Sign &amp; next patient
        </Button>
      </div>

      {/* Patient header */}
      <Card className="mb-6 py-4">
        <CardContent className="flex flex-wrap items-center gap-4">
          <Avatar className="size-14">
            <AvatarFallback className="bg-feature text-lg text-white">{patient.initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h1 className="text-[26px] leading-tight font-extrabold tracking-tight text-night">{details.name || patient.name}</h1>
            <div className="mt-0.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-soft">
              <span>
                {ageLabel(details.dob) || patient.age} · {details.sex === "boy" ? "Male" : "Female"}
              </span>
              <span>MRN {patient.mrn}</span>
              <span>
                {relation} · {details.guardian} · {details.phone}
              </span>
              <span>Ticket {patient.ticket}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="ink" className="h-8 px-3 text-sm">
              <AlertTriangle className="text-peach" /> Penicillin allergy
            </Badge>
            <Badge variant="secondary" className="h-8 bg-mist px-3 text-sm text-slate-dark">
              <MessageSquareText /> AI intake · {lang === "ar" ? "Arabic" : "English"} · 4 min
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Vitals */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {vitals.map((v) => (
          <div key={v.label} className="rounded-2xl border-2 border-white bg-mint px-4 py-3 shadow-soft-btn">
            <div className="text-xs font-bold tracking-wide text-white uppercase">{v.label}</div>
            <div className="text-xl font-extrabold text-[#2d3e4d]">{v.value}</div>
            <div className="text-xs text-ink">{v.note}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_440px]">
        {/* AI report */}
        <Card className="gap-0 py-0">
          <CardHeader className="flex-row items-center justify-between gap-3 border-b border-border/70 py-4">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-sage-deep" />
              <CardTitle>AI-prepared report</CardTitle>
            </div>
            <span className="text-xs text-ink-soft">Draft · nothing is saved until you sign</span>
          </CardHeader>

          <div className="border-b border-border/60 bg-mist px-5 py-4">
            <div className="text-xs font-bold tracking-[0.1em] text-sage-deep uppercase">Summary</div>
            <p className="mt-1 text-[15px] leading-relaxed text-ink">
              6-year-old with right ear pain for 2 days and fever up to 38.6–39 °C after a cold last week. Pain worse lying
              down, no discharge. Temp 37.8 °C today. Penicillin allergy (rash). Picture fits acute otitis media; needs ear
              exam to confirm.
            </p>
          </div>

          {/* S */}
          <section className="grid grid-cols-[44px_1fr] gap-3 border-b border-border/60 px-5 py-5">
            <span className="grid size-10 place-items-center rounded-xl bg-sage-light text-base font-extrabold text-white">S</span>
            <div>
              <h2 className="mb-1.5 text-sm font-bold tracking-[0.08em] text-ink-soft uppercase">
                Subjective <span className="font-semibold tracking-normal normal-case">· from the AI intake</span>
              </h2>
              <ul className="flex flex-col gap-0.5">
                {subjective.map((l) => (
                  <ReportLine key={l.id} line={l} selected={selected === l.id} onSelect={() => select(l.id)} />
                ))}
              </ul>
            </div>
          </section>

          {/* O */}
          <section className="grid grid-cols-[44px_1fr] gap-3 border-b border-border/60 px-5 py-5">
            <span className="grid size-10 place-items-center rounded-xl bg-sage-light text-base font-extrabold text-white">O</span>
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-bold tracking-[0.08em] text-ink-soft uppercase">Objective</h2>
              <p className="px-3 text-[15px] text-ink">
                Weight 22.0 kg · Temp 37.8 °C · HR 104 · SpO₂ 99% <span className="text-ink-soft">({triage.by})</span>
              </p>
              <div className={cn("rounded-2xl p-4", examDone ? "bg-mist" : "bg-white ring-2 ring-mint")}>
                <div className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
                  <Stethoscope className="size-4 text-sage-deep" />
                  Examination
                  {examDone ? (
                    <Badge>
                      <Check /> Added
                    </Badge>
                  ) : (
                    <Badge variant="default">Needs you</Badge>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  {(Object.keys(examOptions) as ExamKey[]).map((k) => (
                    <div key={k} className="flex flex-wrap items-center gap-2">
                      <span className="w-28 text-sm font-semibold text-ink-soft">{examOptions[k].label}</span>
                      <div className="flex flex-wrap gap-1.5" role="group" aria-label={examOptions[k].label}>
                        {examOptions[k].options.map((o) => (
                          <button
                            key={o}
                            onClick={() => setExam(k, o)}
                            aria-pressed={exam[k] === o}
                            className={cn(
                              "h-9 cursor-pointer rounded-lg border px-3 text-sm font-semibold transition-all",
                              exam[k] === o
                                ? "border-mint bg-mint text-white"
                                : "border-border bg-white text-ink-soft hover:border-mint hover:text-ink"
                            )}
                          >
                            {o}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* A */}
          <section className="grid grid-cols-[44px_1fr] gap-3 border-b border-border/60 px-5 py-5">
            <span className="grid size-10 place-items-center rounded-xl bg-sage-light text-base font-extrabold text-white">A</span>
            <div className="flex flex-col gap-2">
              <h2 className="text-sm font-bold tracking-[0.08em] text-ink-soft uppercase">Assessment</h2>
              <div className="rounded-2xl bg-mist p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-lg font-extrabold text-ink">{diagnosis.text}</span>
                  <Badge variant="outline">ICD-10 {diagnosis.icd}</Badge>
                  {!exam.right ? (
                    <Badge variant="secondary">Waiting for your ear exam</Badge>
                  ) : examSupports ? (
                    <Badge>
                      <Check /> Supported by exam
                    </Badge>
                  ) : (
                    <Badge variant="ink">Exam doesn't match — review</Badge>
                  )}
                </div>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{diagnosis.reasoning}</p>
                {exam.right && !examSupports && (
                  <div className="mt-2 flex flex-wrap gap-2 text-sm">
                    <span className="self-center text-ink-soft">Consider:</span>
                    {diagnosis.alternatives.map((a) => (
                      <Badge key={a.icd} variant="outline">
                        {a.text} · {a.icd}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="mt-3 flex gap-2">
                  {dxAccepted ? (
                    <>
                      <Badge className="h-8 px-3 text-sm">
                        <Check /> Confirmed by you
                      </Badge>
                      <Button size="sm" variant="ghost" onClick={() => set({ dxAccepted: false })}>
                        <Undo2 /> Undo
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" disabled={!exam.right} onClick={() => set({ dxAccepted: true })}>
                      <Check /> Confirm diagnosis
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* P */}
          <section className="grid grid-cols-[44px_1fr] gap-3 px-5 py-5">
            <span className="grid size-10 place-items-center rounded-xl bg-sage-light text-base font-extrabold text-white">P</span>
            <div>
              <h2 className="mb-1.5 text-sm font-bold tracking-[0.08em] text-ink-soft uppercase">Plan</h2>
              <ul className="flex flex-col gap-0.5">
                {plan.map((l) => (
                  <ReportLine key={l.id} line={l} selected={selected === l.id} onSelect={() => select(l.id)} />
                ))}
              </ul>
            </div>
          </section>
        </Card>

        {/* Right: prescription + conversation */}
        <Card className="sticky top-[150px] h-fit gap-0 py-0">
          <Tabs value={tab} onValueChange={setTab} className="gap-0">
            <div className="border-b border-border/70 px-4 py-3">
              <TabsList className="w-full">
                <TabsTrigger value="rx">
                  <Pill className="size-4" /> Draft prescription
                </TabsTrigger>
                <TabsTrigger value="talk">
                  <MessageSquareText className="size-4" /> What the parent said
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="rx">
              <ScrollArea className="h-[max(420px,calc(100vh-300px))]">
                <div className="flex flex-col gap-3 p-4">
                  <div className="flex items-start gap-3 rounded-2xl bg-slate-dark p-4 text-white">
                    <Ban className="mt-0.5 size-5 shrink-0 text-peach" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold line-through decoration-peach/80">{blockedRx.drug}</span>
                        <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase">Blocked</span>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-white/85">{blockedRx.reason}</p>
                    </div>
                  </div>
                  {rxSuggestions.map((r) => (
                    <RxCard key={r.id} rx={r} />
                  ))}
                  <p className="px-1 text-xs text-ink-soft">
                    Doses calculated from today's weight ({triage.weightKg.toFixed(1)} kg). Sample clinical content — clinician
                    review required.
                  </p>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="talk">
              <div className="border-b border-border/60 px-4 py-2.5 text-sm text-ink-soft">
                {sel
                  ? sources.length
                    ? `Highlighted: where “${(noteEdits[sel.id] ?? sel.text).slice(0, 40)}…” came from`
                    : "This line comes from the plan, not the conversation."
                  : "Click a report line to see where it came from."}
              </div>
              <ScrollArea className="h-[max(375px,calc(100vh-345px))]">
                <ol className="flex flex-col gap-2 p-4">
                  {intake.map((l) => {
                    const hit = sources.includes(l.id);
                    const isAgent = l.speaker === "agent";
                    return (
                      <li
                        key={l.id}
                        ref={(el) => {
                          refs.current[l.id] = el;
                        }}
                        className={cn(
                          "rounded-xl px-3 py-2.5 text-sm transition-all",
                          hit ? "bg-white shadow-[0_8px_20px_-12px_rgba(54,82,89,0.7)] ring-2 ring-sage" : sel ? "opacity-55" : "bg-white/60"
                        )}
                      >
                        <div className={cn("mb-0.5 text-xs font-bold", isAgent ? "text-sage-deep" : "text-slate-deep")}>
                          {isAgent ? "AI agent" : `${patient.guardianRole} · ${patient.guardian.split(" ")[0]}`}
                        </div>
                        <p className="text-ink">{l.en}</p>
                        <p dir="rtl" className="arabic mt-0.5 text-xs text-ink-soft">
                          {l.ar}
                        </p>
                      </li>
                    );
                  })}
                </ol>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </AppShell>
  );
}
