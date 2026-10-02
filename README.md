# Sidra Clinical Assistant: Clickable Prototype

A clickable Next.js + shadcn/ui prototype of an AI clinical assistant built to **cut the time each patient spends with the doctor**, so a clinic can see more patients.

1. **The AI agent takes the history.** In the waiting room, the parent talks to the assistant on a tablet, in Arabic or English.
2. **The AI structures it.** A nurse adds weight and vitals. The AI drafts a SOAP report, a likely diagnosis and a weight-based prescription, with safety checks already run.
3. **The doctor reviews and signs.** The doctor examines the child, edits anything needed and signs. The next patient's brief is already waiting.

The prototype is a scripted demo. There is no backend or real AI, and all patient data is fictional. Drug choices and doses are placeholders and need a clinician to review them.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
```

To build a static site you can host anywhere:

```bash
npm run export       # output in /out, opens from any sub-path
```

## The demo flow

| # | View | Screen | What it shows |
|---|------|--------|---------------|
| 0 | — | Choose a view | The idea in three steps, with a Patient view / Doctor view entry |
| 1 | Patient (tablet) | Welcome & consent | Arabic/English choice, consent, ticket number |
| 1b | Patient (tablet) | Patient details | Name, date of birth (age calculated), sex, parent/guardian and mobile, pre-filled from the booking; today's weight entered by the parent, or "Not sure" for the nurse to weigh |
| 2 | Patient (tablet) | AI intake conversation | The agent asks the follow-up questions, the parent answers by voice or tap, and a summary builds live |
| 3 | Patient (tablet) | Intake complete | "Summary is with the doctor", next steps |
| 4 | Doctor | Clinic queue | Briefs ready for review, families still in intake, an escalated urgent case, time per patient |
| 5 | Doctor | Patient brief | The main screen, described below |
| 6 | Doctor | Signed · next patient | Review time, what was sent, family summary, next patient's intake progress |
| 7 | Doctor | Insights | Minutes per patient (12 → 4.6), patients per clinic (16 → 28), where the doctor's time goes, quality |

The patient brief (screen 5) holds:

- vitals from triage
- the AI summary
- a SOAP note where every line links to what the parent said, and lines the parent was unsure about are flagged
- one-tap exam findings
- a diagnosis that is only confirmed once the exam supports it
- a draft prescription, with amoxicillin blocked because of the penicillin allergy, weight-based doses, and approve/edit/reject on each drug
- a checklist that has to be complete before **Sign & next patient** unlocks

**Demo menu** (the round button, bottom right) switches between Patient view and Doctor view, jumps to any screen, or restarts. The intake conversation has its own play/pause, speed and skip controls. Each screen has a URL hash (`#intake-chat`, `#brief` and so on).

## Where things live

- `src/lib/data.ts`: all scenario content (intake conversation, triage, report, diagnosis, prescriptions, queue, insights). Edit this to change the story.
- `src/components/proto/`
  - `screen-home.tsx`: the view chooser
  - `screen-intake.tsx`: the patient tablet (welcome, AI conversation, done)
  - `screen-details.tsx`: the patient details form (name, date of birth, sex, weight, guardian, phone)
  - `screen-queue.tsx`: the doctor's clinic queue
  - `screen-brief.tsx`: the doctor's review and sign screen
  - `screen-doctor-end.tsx`: the signed screen and insights
  - `store.tsx`: demo state
  - `shell.tsx`: layouts and the demo menu
- `src/components/ui/`: shadcn/ui components (new-york style)
- `src/components/proto/brand-assets.tsx`: the bolt icon and Cplusoft logo from the Figma sidebar
- `src/app/globals.css`: theme tokens, matching the Figma file (see FIGMA.md). The patient screens sit on an animated sage mesh gradient (`.mesh`, five blurred shapes on a 12 s loop taken from the Figma motion). The doctor screens use a stone sidebar, mint stat cards and buttons, and a peach-to-mint call to action.

## Notes

- There is no red or amber in the reference palette, so alerts use dark slate cards with peach icons. Confirmations use slate.
- Fonts are bundled locally (Plus Jakarta Sans with italics, Tajawal for Arabic, Noto Sans Arabic as fallback), so no network is needed at runtime.
- **Hero video:** the Home screen's circle shows an animated placeholder. To use the real clip, put it at `public/hero.mp4` and set `HERO_VIDEO = "hero.mp4"` in `screen-home.tsx`.
