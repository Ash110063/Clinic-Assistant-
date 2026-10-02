"use client";

import * as React from "react";
import {
  BarChart3,
  ListOrdered,
  Presentation,
  RotateCcw,
  Search,
  Users,
  Bell,
  Tablet,
  Stethoscope,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { doctor } from "@/lib/data";
import { doctorScreens, patientScreens, screenOrder, useProto, type Screen } from "./store";
import { BoltIcon, CplusoftLogo } from "./brand-assets";

/** Animated sage mesh gradient from the Figma Home frame (5 drifting blobs + grain). */
export function MeshBackground({ calm = false, className }: { calm?: boolean; className?: string }) {
  return (
    <div className={cn("mesh", calm && "mesh--calm", className)} aria-hidden>
      <span className="mesh__blob mesh__blob--sand" />
      <span className="mesh__blob mesh__blob--aqua" />
      <span className="mesh__blob mesh__blob--teal" />
      <span className="mesh__blob mesh__blob--sand2" />
      <span className="mesh__blob mesh__blob--mint" />
      <span className="mesh__grain" />
    </div>
  );
}

export function BrandMark({
  className,
  sub = "SIDRA MEDICINE",
  tone = "dark",
}: {
  className?: string;
  sub?: string;
  tone?: "dark" | "light";
}) {
  const light = tone === "light";
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "relative grid size-9 place-items-center rounded-xl",
          light ? "bg-white shadow-[0_8px_18px_-8px_rgba(41,51,58,0.4)]" : "bg-brand-gradient shadow-[0_8px_18px_-6px_rgba(54,82,89,0.7)]"
        )}
      >
        <svg viewBox="0 0 24 24" className={cn("size-5", light ? "text-sage" : "text-white")} fill="none" stroke="currentColor" strokeWidth={2.2} aria-hidden>
          <path d="M4 12h3l2-5 4 10 2-5h5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="leading-tight">
        <div className={cn("text-[15px] font-extrabold tracking-tight", light ? "text-white" : "text-ink")}>Clinical Assistant</div>
        <div className={cn("text-[11px] font-semibold tracking-wide whitespace-nowrap", light ? "text-white/80" : "text-ink-soft")}>{sub}</div>
      </div>
    </div>
  );
}

/** Doctor-side layout: sidebar + top bar */
export function AppShell({ children, active }: { children: React.ReactNode; active: "queue" | "insights" }) {
  const { go } = useProto();
  const nav = [
    { id: "queue" as const, label: "Clinic queue", icon: ListOrdered, clickable: true },
    { id: "patients", label: "Patients", icon: Users, clickable: false },
    { id: "insights" as const, label: "Insights", icon: BarChart3, clickable: true },
  ];
  return (
    <div className="app-ground flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-8 border-r border-white bg-stone px-5 py-6 lg:flex">
        <BrandMark />
        <nav className="flex flex-col gap-1" aria-label="Main">
          {nav.map((n) => {
            const Icon = n.icon;
            const isActive = active === n.id;
            return (
              <button
                key={n.id}
                onClick={() => n.clickable && go(n.id as Screen)}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-white text-sage-deep shadow-[0_8px_20px_-12px_rgba(54,82,89,0.6)]"
                    : "text-ink-soft hover:bg-white/60 hover:text-ink",
                  !n.clickable && "cursor-default opacity-70"
                )}
              >
                <Icon className="size-[18px]" />
                {n.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-5 rounded-2xl bg-white p-4 shadow-[0_10px_30px_-14px_rgba(54,82,89,0.3)]">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-ink">
              <BoltIcon className="size-5 text-ink" />
              Powered By
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">
              All Rights Reserved. Exclusive property of Cplusoft.
            </p>
          </div>
          <CplusoftLogo className="h-[21px] w-[111px] text-ink" />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-white bg-topbar px-6 lg:px-8">
          <div className="lg:hidden">
            <BrandMark />
          </div>
          <div className="relative hidden max-w-sm flex-1 md:block">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-soft" />
            <input
              aria-label="Search patients"
              placeholder="Search patients, MRN…"
              className="h-10 w-full rounded-xl border border-white bg-white pr-3 pl-9 text-sm outline-none placeholder:text-ink-soft/80 focus:ring-[3px] focus:ring-sage-soft/40"
            />
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="size-[18px]" />
            </Button>
            <div className="flex items-center gap-2.5">
              <Avatar>
                <AvatarFallback>{doctor.initials}</AvatarFallback>
              </Avatar>
              <div className="hidden leading-tight sm:block">
                <div className="text-sm font-bold text-ink">{doctor.name}</div>
                <div className="text-xs font-medium text-[#454545]">{doctor.role}</div>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 px-6 pt-7 pb-24 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

/** Patient-side layout: a waiting-room tablet on the animated sage gradient, no navigation */
export function KioskShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="kiosk relative isolate flex min-h-screen flex-col overflow-hidden">
      <MeshBackground calm className="fixed" />
      <header className="relative z-10 flex items-center justify-between px-6 py-5 lg:px-10">
        <BrandMark sub="WAITING ROOM · PEDIATRICS" tone="light" />
        <div className="flex items-center gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-white/40" />
          <span className="size-2.5 rounded-full bg-white/60" />
          <span className="size-2.5 rounded-full bg-white" />
        </div>
      </header>
      <main className="relative z-10 flex flex-1 flex-col px-6 pb-24 lg:px-10">{children}</main>
    </div>
  );
}

/** Small segmented switch shown to the presenter */
export function ViewSwitch() {
  const { screen, go } = useProto();
  const side = patientScreens.includes(screen) ? "patient" : doctorScreens.includes(screen) ? "doctor" : null;
  return (
    <div className="flex h-11 items-center gap-1 rounded-full bg-mist/70 p-1" role="group" aria-label="Switch view">
      <button
        onClick={() => go("intake-welcome")}
        aria-pressed={side === "patient"}
        className={cn(
          "flex h-9 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full px-3 text-sm font-semibold transition-all",
          side === "patient" ? "bg-mint text-white" : "text-ink-soft hover:text-ink"
        )}
      >
        <Tablet className="size-4" /> Patient view
      </button>
      <button
        onClick={() => go("queue")}
        aria-pressed={side === "doctor"}
        className={cn(
          "flex h-9 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full px-3 text-sm font-semibold transition-all",
          side === "doctor" ? "bg-mint text-white" : "text-ink-soft hover:text-ink"
        )}
      >
        <Stethoscope className="size-4" /> Doctor view
      </button>
    </div>
  );
}

export function PresenterMenu() {
  const { go, reset, screen } = useProto();
  if (screen === "home") return null;
  return (
    <div className="fixed right-4 bottom-4 z-40">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            aria-label="Demo menu"
            title="Demo menu"
            className="size-11 rounded-full border-white bg-white/90 shadow-[0_12px_30px_-12px_rgba(54,82,89,0.6)] backdrop-blur"
          >
            <Presentation className="size-[18px] text-sage" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="w-72">
          <div className="p-1.5">
            <ViewSwitch />
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Patient · waiting-room tablet</DropdownMenuLabel>
          {screenOrder
            .filter((s) => s.side === "patient")
            .map((s) => (
              <DropdownMenuItem key={s.id} onSelect={() => go(s.id)} className={cn(screen === s.id && "bg-mist text-sage-deep")}>
                {s.label}
              </DropdownMenuItem>
            ))}
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Doctor · review & sign</DropdownMenuLabel>
          {screenOrder
            .filter((s) => s.side === "doctor")
            .map((s) => (
              <DropdownMenuItem key={s.id} onSelect={() => go(s.id)} className={cn(screen === s.id && "bg-mist text-sage-deep")}>
                {s.label}
              </DropdownMenuItem>
            ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={reset}>
            <RotateCcw /> Restart demo
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function PageTitle({
  eyebrow,
  title,
  sub,
  right,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <div className="mb-1.5 text-xs font-bold tracking-[0.12em] text-sage uppercase">{eyebrow}</div>}
        <h1 className="text-[28px] leading-tight font-extrabold tracking-tight text-sage-deep [&_em]:text-night [&_em]:not-italic">{title}</h1>
        {sub && <p className="mt-1.5 max-w-2xl text-[15px] text-ink-soft">{sub}</p>}
      </div>
      {right}
    </div>
  );
}
