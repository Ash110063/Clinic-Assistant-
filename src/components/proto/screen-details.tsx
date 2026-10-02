"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Check, Info, Phone, Scale, User, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { doctor, patient } from "@/lib/data";
import { KioskShell } from "./shell";
import { useProto, type Details } from "./store";

// Demo "today" matches the clinic date shown on the doctor side
const TODAY = new Date("2026-10-01T09:00:00");

export function ageFrom(dob: string): { years: number; months: number } | null {
  const d = new Date(`${dob}T00:00:00`);
  if (Number.isNaN(d.getTime()) || d > TODAY) return null;
  let months = (TODAY.getFullYear() - d.getFullYear()) * 12 + (TODAY.getMonth() - d.getMonth());
  if (TODAY.getDate() < d.getDate()) months -= 1;
  return { years: Math.floor(months / 12), months: months % 12 };
}

export function ageLabel(dob: string) {
  const a = ageFrom(dob);
  if (!a) return "";
  if (a.years === 0) return `${a.months} month${a.months === 1 ? "" : "s"}`;
  return `${a.years} year${a.years === 1 ? "" : "s"}${a.months ? `, ${a.months} month${a.months === 1 ? "" : "s"}` : ""}`;
}

/** Field label: the parent's chosen language first, the other one smaller */
function Bi({ ar, en, htmlFor }: { ar: string; en: string; htmlFor?: string }) {
  const { lang } = useProto();
  return (
    <Label htmlFor={htmlFor} className="flex flex-wrap items-baseline gap-x-2 gap-y-0 text-[15px] font-bold">
      {lang === "ar" ? <span className="arabic">{ar}</span> : <span>{en}</span>}
      <span className={cn("text-xs font-semibold text-ink-soft", lang === "en" && "arabic")}>{lang === "ar" ? en : ar}</span>
    </Label>
  );
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { v: T; ar: string; en: string }[];
  onChange: (v: T) => void;
  label: string;
}) {
  const { lang } = useProto();
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }} role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          onClick={() => onChange(o.v)}
          aria-pressed={value === o.v}
          className={cn(
            "flex h-12 cursor-pointer flex-col items-center justify-center rounded-xl border-2 text-[15px] font-bold transition-all",
            value === o.v ? "border-mint bg-mint text-white shadow-soft-btn" : "border-white bg-white text-ink hover:border-mint"
          )}
        >
          <span className={cn(lang === "ar" && "arabic")}>{lang === "ar" ? o.ar : o.en}</span>
        </button>
      ))}
    </div>
  );
}

export function IntakeDetailsScreen() {
  const { details, set, go, lang } = useProto();
  const [touched, setTouched] = React.useState(false);
  const d = details;
  const update = (patch: Partial<Details>) => set({ details: { ...d, ...patch } });

  const w = parseFloat(d.weight);
  const weightValid = d.weightUnknown || (!Number.isNaN(w) && w >= 1 && w <= 150);
  const age = ageLabel(d.dob);
  const requiredOk = d.name.trim().length > 1 && !!age && !!d.sex && d.guardian.trim().length > 1 && d.phone.trim().length > 6;
  const canContinue = requiredOk && weightValid;
  const first = d.name.trim().split(" ")[0] || (lang === "ar" ? "طفلك" : "your child");
  const firstPlain = d.name.trim().split(" ")[0] || "your child";

  return (
    <KioskShell>
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 py-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-1.5 text-xs font-bold tracking-[0.12em] text-white/85 uppercase">Step 1 of 2 · Details</div>
            <h1 className="kiosk-title text-[34px] leading-tight font-extrabold tracking-tight">
              {lang === "ar" ? <span className="arabic">معلومات عن {first}</span> : <>About {first}</>}
            </h1>
            {lang === "ar" && (
              <p dir="rtl" className="arabic mt-1 text-[17px] text-white">
                تأكّد من بيانات الحجز وأضف وزن الطفل اليوم.
              </p>
            )}
            <p className="mt-1 text-[16px] font-light text-white">Check the details from your booking and add today's weight.</p>
          </div>
          <Badge variant="outline" className="h-8 border-white bg-white px-3 text-sm text-ink">
            Ticket {patient.ticket} · {doctor.short}
          </Badge>
        </div>

        <form
          className="flex flex-col gap-6"
          onSubmit={(e) => {
            e.preventDefault();
            setTouched(true);
            if (canContinue) go("intake-chat");
          }}
        >
          {/* Child */}
          <Card className="gap-5 py-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="size-4 text-sage-deep" />
                <CardTitle>Child</CardTitle>
                <Badge variant="slate">
                  <Check /> From your booking
                </Badge>
              </div>
              <CardDescription>Change anything that isn't right.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <div className="grid gap-2 sm:col-span-2">
                <Bi ar="اسم الطفل الكامل" en="Child's full name" htmlFor="child-name" />
                <Input
                  id="child-name"
                  value={d.name}
                  onChange={(e) => update({ name: e.target.value })}
                  className="h-12 text-base"
                  autoComplete="off"
                  aria-invalid={touched && d.name.trim().length < 2}
                />
              </div>
              <div className="grid gap-2">
                <Bi ar="تاريخ الميلاد" en="Date of birth" htmlFor="child-dob" />
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-soft" />
                  <Input
                    id="child-dob"
                    type="date"
                    max="2026-10-01"
                    value={d.dob}
                    onChange={(e) => update({ dob: e.target.value })}
                    className="h-12 pl-9 text-base"
                    aria-invalid={touched && !age}
                    aria-describedby="child-age"
                  />
                </div>
                <p id="child-age" className="text-sm font-semibold text-sage-deep">
                  {age ? `Age: ${age}` : "Enter a valid date of birth"}
                </p>
              </div>
              <div className="grid content-start gap-2">
                <Bi ar="الجنس" en="Sex" />
                <Segmented
                  label="Sex"
                  value={d.sex}
                  onChange={(v) => update({ sex: v })}
                  options={[
                    { v: "girl", ar: "بنت", en: "Girl" },
                    { v: "boy", ar: "ولد", en: "Boy" },
                  ]}
                />
              </div>
            </CardContent>
          </Card>

          {/* Weight */}
          <Card className={cn("gap-5 py-6", !d.weight && !d.weightUnknown && "ring-2 ring-sage-soft")}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Scale className="size-4 text-sage-deep" />
                <CardTitle>Today's weight</CardTitle>
                <Badge variant="default">Needed</Badge>
              </div>
              <CardDescription>Medicine doses for children depend on weight. A nurse will also weigh {firstPlain} before the doctor sees you.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-wrap items-end gap-4">
                <div className="grid w-48 gap-2">
                  <Bi ar="الوزن (كغ)" en="Weight (kg)" htmlFor="child-weight" />
                  <div className="relative">
                    <Input
                      id="child-weight"
                      inputMode="decimal"
                      placeholder="e.g. 22"
                      value={d.weight}
                      disabled={d.weightUnknown}
                      onChange={(e) => update({ weight: e.target.value.replace(/[^0-9.]/g, "") })}
                      className="h-14 pr-12 text-2xl font-bold"
                      aria-invalid={touched && !weightValid}
                      aria-describedby="weight-help"
                    />
                    <span className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-base font-bold text-ink-soft">kg</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => update({ weightUnknown: !d.weightUnknown, weight: "" })}
                  aria-pressed={d.weightUnknown}
                  className={cn(
                    "flex h-14 cursor-pointer items-center gap-2 rounded-xl border-2 px-4 text-[15px] font-bold transition-all",
                    d.weightUnknown ? "border-mint bg-mint text-white shadow-soft-btn" : "border-white bg-white text-ink hover:border-mint"
                  )}
                >
                  {d.weightUnknown && <Check className="size-4" strokeWidth={3} />}
                  {lang === "ar" ? <span className="arabic">لا أعرف · الممرضة ستزنه</span> : "Not sure · the nurse will weigh"}
                </button>
              </div>
              <p id="weight-help" className={cn("flex items-center gap-1.5 text-sm", touched && !weightValid ? "font-semibold text-ink" : "text-ink-soft")}>
                <Info className="size-4 shrink-0 text-sage-deep" />
                {touched && !weightValid ? "Enter the weight in kg (for example 22), or choose “Not sure”." : "An estimate from your last weighing is fine."}
              </p>
            </CardContent>
          </Card>

          {/* Parent */}
          <Card className="gap-5 py-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="size-4 text-sage-deep" />
                <CardTitle>Parent or guardian</CardTitle>
                <Badge variant="slate">
                  <Check /> From your booking
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <div className="grid gap-2">
                <Bi ar="اسمك" en="Your name" htmlFor="guardian-name" />
                <Input
                  id="guardian-name"
                  value={d.guardian}
                  onChange={(e) => update({ guardian: e.target.value })}
                  className="h-12 text-base"
                  aria-invalid={touched && d.guardian.trim().length < 2}
                />
              </div>
              <div className="grid content-start gap-2">
                <Bi ar="صلة القرابة" en="Relationship" />
                <Segmented
                  label="Relationship"
                  value={d.relation}
                  onChange={(v) => update({ relation: v })}
                  options={[
                    { v: "mother", ar: "الأم", en: "Mother" },
                    { v: "father", ar: "الأب", en: "Father" },
                    { v: "other", ar: "آخر", en: "Other" },
                  ]}
                />
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Bi ar="رقم الجوال" en="Mobile number" htmlFor="guardian-phone" />
                <div className="relative sm:max-w-sm">
                  <Phone className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-soft" />
                  <Input
                    id="guardian-phone"
                    type="tel"
                    value={d.phone}
                    onChange={(e) => update({ phone: e.target.value })}
                    className="h-12 pl-9 text-base"
                    aria-invalid={touched && d.phone.trim().length < 7}
                  />
                </div>
                <p className="text-sm text-ink-soft">We'll send the visit summary here after the doctor signs.</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button type="button" variant="ghost" className="text-white hover:bg-white/20 hover:text-white" onClick={() => go("intake-welcome")}>
              <ArrowLeft /> Back
            </Button>
            <div className="flex items-center gap-3">
              {touched && !canContinue && <span className="text-sm font-semibold text-white">Fill in the highlighted fields to continue.</span>}
              <Button type="submit" size="lg" className="bg-cta-long shadow-cta h-14 rounded-[18px] px-8 text-lg font-bold text-ink">
                {lang === "ar" ? <span className="arabic">التالي · الأسئلة</span> : "Next: a few questions"} <ArrowRight className="size-5" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </KioskShell>
  );
}
