# Figma ↔ code map

Figma file: https://www.figma.com/design/baxNgImQd6FDlceFMxXM03/Sidra
Page "Prototype screens" (4:2) · Page "Components" (6:2)

| Figma frame | Node | Code |
|---|---|---|
| 0 · Home · choose a view | 13:3 | src/components/proto/screen-home.tsx |
| 1 · Patient · Welcome & consent | 13:122 | screen-intake.tsx → IntakeWelcomeScreen |
| 2 · Patient · Details (name, age, weight) | 15:76 | screen-details.tsx |
| 2b · Details · weight missing (error) | 20:769 | screen-details.tsx (touched && !weightValid) |
| 3 · Patient · AI intake conversation | 16:165 | screen-intake.tsx → IntakeChatScreen |
| 4 · Patient · Intake complete | 16:390 | screen-intake.tsx → IntakeDoneScreen |
| 5 · Doctor · Clinic queue | 17:257 | screen-queue.tsx |
| 6 · Doctor · Patient brief (review) | 18:400 | screen-brief.tsx |
| 6b · Patient brief · ready to sign | 20:944 | screen-brief.tsx (all checklist items done) |
| 6c · Edit prescription (dialog) | 20:1446 | screen-brief.tsx → RxCard edit Dialog |
| 6d · Reject prescription (dialog) | 20:1508 | screen-brief.tsx → RxCard reject Dialog |
| 7 · Doctor · Signed · next patient | 19:594 | screen-doctor-end.tsx → SignedScreen |
| 8 · Doctor · Insights | 19:762 | screen-doctor-end.tsx → InsightsScreen |

Components (page 6:2): Button 8:107, Badge 8:132, Avatar 8:141, Brand mark 8:142, Demo menu button 8:149,
Doctor/Sidebar 10:81, Doctor/Top bar 10:82, Kiosk/Header 10:98, Choice 12:64, Chip 12:69, Checkbox 12:76,
Text field 12:95, Icons board 6:3 (42 Lucide icons).

Tokens: variable collection "Sidra Colors" ↔ src/app/globals.css (:root). Text styles ↔ Tailwind sizes used in screens.
