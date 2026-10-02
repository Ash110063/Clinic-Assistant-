"use client";

import * as React from "react";
import { intake, rxSuggestions, type ExamKey } from "@/lib/data";

export type Screen =
  | "home"
  | "intake-welcome"
  | "intake-details"
  | "intake-chat"
  | "intake-done"
  | "queue"
  | "brief"
  | "signed"
  | "insights";

export const patientScreens: Screen[] = ["intake-welcome", "intake-details", "intake-chat", "intake-done"];
export const doctorScreens: Screen[] = ["queue", "brief", "signed", "insights"];

export const screenOrder: { id: Screen; label: string; side: "start" | "patient" | "doctor" }[] = [
  { id: "home", label: "Choose a view", side: "start" },
  { id: "intake-welcome", label: "1 · Welcome & consent", side: "patient" },
  { id: "intake-details", label: "2 · Patient details", side: "patient" },
  { id: "intake-chat", label: "3 · AI intake conversation", side: "patient" },
  { id: "intake-done", label: "4 · Intake complete", side: "patient" },
  { id: "queue", label: "5 · Clinic queue", side: "doctor" },
  { id: "brief", label: "6 · Patient brief (review)", side: "doctor" },
  { id: "signed", label: "7 · Signed · next patient", side: "doctor" },
  { id: "insights", label: "8 · Insights", side: "doctor" },
];

export type RxDecision = {
  status: "pending" | "accepted" | "edited" | "rejected";
  dose: string;
  frequency: string;
  duration: string;
  reason?: string;
};

export type Details = {
  name: string;
  dob: string; // yyyy-mm-dd
  sex: "girl" | "boy" | "";
  weight: string; // kg as typed by the parent
  weightUnknown: boolean;
  guardian: string;
  relation: "mother" | "father" | "other";
  phone: string;
};

type State = {
  screen: Screen;
  details: Details;
  lang: "ar" | "en";
  shownLines: number;
  playing: boolean;
  exam: Partial<Record<ExamKey, string>>;
  noteEdits: Record<string, string>;
  confirmedLow: string[];
  dxAccepted: boolean;
  rx: Record<string, RxDecision>;
  signed: boolean;
  reviewSeconds: number;
};

const initialRx = (): Record<string, RxDecision> =>
  Object.fromEntries(
    rxSuggestions.map((r) => [r.id, { status: "pending", dose: r.dose, frequency: r.frequency, duration: r.duration }])
  );

// Name, date of birth, sex, guardian and phone come pre-filled from the booking
// (the parent confirms or corrects them). Weight is asked fresh every visit.
export const bookingDetails = (): Details => ({
  name: "Layla Hassan",
  dob: "2020-03-14",
  sex: "girl",
  weight: "",
  weightUnknown: false,
  guardian: "Huda Hassan",
  relation: "mother",
  phone: "+974 5512 3456",
});

const initial = (): State => ({
  screen: "home",
  details: bookingDetails(),
  lang: "ar",
  shownLines: 0,
  playing: false,
  exam: {},
  noteEdits: {},
  confirmedLow: [],
  dxAccepted: false,
  rx: initialRx(),
  signed: false,
  reviewSeconds: 0,
});

type Ctx = State & {
  go: (s: Screen) => void;
  set: (patch: Partial<State>) => void;
  setRx: (id: string, patch: Partial<RxDecision>) => void;
  setExam: (k: ExamKey, v: string) => void;
  editNote: (id: string, text: string) => void;
  confirmLow: (id: string) => void;
  reset: () => void;
};

const ProtoContext = React.createContext<Ctx | null>(null);

function setHash(s: string) {
  try {
    history.replaceState(null, "", `#${s}`);
  } catch {}
}

// When jumping ahead (demo menu / link), fill in what earlier steps would have done
function prepare(st: State, s: Screen): State {
  const next: State = { ...st, screen: s };
  if (s === "intake-chat" && st.shownLines === 0) next.playing = true;
  const idx = screenOrder.findIndex((x) => x.id === s);
  const detailsIdx = screenOrder.findIndex((x) => x.id === "intake-details");
  if (idx > detailsIdx && !st.details.weight && !st.details.weightUnknown) {
    next.details = { ...st.details, weight: "22" };
  }
  if (s === "intake-done" || doctorScreens.includes(s)) {
    next.shownLines = intake.length;
    next.playing = false;
  }
  if (s === "signed") next.signed = true;
  return next;
}

export function ProtoProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<State>(initial);

  React.useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.replace("#", "") as Screen;
      if (screenOrder.some((s) => s.id === h)) setState((st) => prepare(st, h));
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const go = React.useCallback((s: Screen) => {
    setState((st) => prepare(st, s));
    setHash(s);
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }, []);

  const set = React.useCallback((patch: Partial<State>) => setState((st) => ({ ...st, ...patch })), []);
  const setRx = React.useCallback(
    (id: string, patch: Partial<RxDecision>) =>
      setState((st) => ({ ...st, rx: { ...st.rx, [id]: { ...st.rx[id], ...patch } } })),
    []
  );
  const setExam = React.useCallback(
    (k: ExamKey, v: string) => setState((st) => ({ ...st, exam: { ...st.exam, [k]: v } })),
    []
  );
  const editNote = React.useCallback(
    (id: string, text: string) => setState((st) => ({ ...st, noteEdits: { ...st.noteEdits, [id]: text } })),
    []
  );
  const confirmLow = React.useCallback(
    (id: string) =>
      setState((st) => ({ ...st, confirmedLow: st.confirmedLow.includes(id) ? st.confirmedLow : [...st.confirmedLow, id] })),
    []
  );
  const reset = React.useCallback(() => {
    setState(initial());
    setHash("home");
  }, []);

  return (
    <ProtoContext.Provider value={{ ...state, go, set, setRx, setExam, editNote, confirmLow, reset }}>
      {children}
    </ProtoContext.Provider>
  );
}

export function useProto() {
  const ctx = React.useContext(ProtoContext);
  if (!ctx) throw new Error("useProto must be used inside ProtoProvider");
  return ctx;
}

export function fmtTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
