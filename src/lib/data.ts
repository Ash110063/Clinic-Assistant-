// ---------------------------------------------------------------------------
// Demo scenario data. All people are fictional. Drug choices and doses are
// placeholders for the prototype and must be reviewed by a clinician.
//
// Flow: the parent talks to the AI intake agent in the waiting room → a nurse
// adds vitals → the AI drafts the report, diagnosis and prescription → the
// doctor reviews, adds exam findings, edits if needed and signs.
// ---------------------------------------------------------------------------

export const doctor = {
  name: "Dr. Noor Rahman",
  short: "Dr. Noor",
  initials: "NR",
  role: "Consultant, General Pediatrics",
  clinic: "Outpatient Clinic B · Pediatrics",
};

export type QueueStatus = "signed" | "ready" | "intake" | "waiting";

export const queue: {
  id: string;
  ticket: string;
  name: string;
  age: string;
  complaint: string;
  status: QueueStatus;
  readyFor?: string; // how long the brief has been ready
  progress?: number; // intake progress %
  urgent?: string;
  demo?: boolean;
}[] = [
  {
    id: "noora",
    ticket: "A-15",
    name: "Noora Tamer",
    age: "2 y",
    complaint: "AI flagged during intake: fever 39.8 °C, very sleepy · nurse called",
    status: "waiting",
    urgent: "Escalated",
  },
  { id: "layla", ticket: "A-14", name: "Layla Hassan", age: "6 y", complaint: "Right ear pain, fever", status: "ready", readyFor: "4 min", demo: true },
  { id: "mariam", ticket: "A-16", name: "Mariam Saleh", age: "3 y", complaint: "Cough for 1 week", status: "intake", progress: 60 },
  { id: "hamad", ticket: "A-17", name: "Hamad Al-Rashid", age: "8 y", complaint: "Checked in", status: "waiting" },
  { id: "omar", ticket: "A-11", name: "Omar Khalid", age: "4 y", complaint: "Asthma follow-up", status: "signed" },
  { id: "fatima", ticket: "A-12", name: "Fatima Al-Kuwari", age: "9 m", complaint: "Growth review", status: "signed" },
  { id: "yousef", ticket: "A-13", name: "Yousef Mahmoud", age: "11 y", complaint: "Skin rash", status: "signed" },
];

export const patient = {
  name: "Layla Hassan",
  first: "Layla",
  initials: "LH",
  age: "6 years",
  sex: "Female",
  mrn: "SDR-204871",
  guardian: "Huda Hassan",
  guardianRole: "Mother",
  ticket: "A-14",
  appointment: "09:30",
  allergies: [{ name: "Penicillin", reaction: "Skin rash", severity: "Non-severe" }],
};

export const triage = {
  by: "Nurse Sara · 09:26",
  vitals: [
    { label: "Weight", value: "22.0 kg", note: "Measured today" },
    { label: "Temp", value: "37.8 °C", note: "Tympanic" },
    { label: "Heart rate", value: "104 bpm", note: "Normal for age" },
    { label: "SpO₂", value: "99%", note: "Room air" },
  ],
  weightKg: 22.0,
};

// ---------------- AI intake conversation (waiting-room tablet) ----------------

export type IntakeSpeaker = "agent" | "parent";

export type IntakeLine = {
  id: number;
  speaker: IntakeSpeaker;
  ar: string; // spoken / shown in Arabic
  en: string; // English (translation for the parent's Arabic, or the agent's question)
  chips?: string[]; // quick replies offered by the agent
  notes?: string[]; // summary items captured by this answer (patient-facing words)
};

export const intake: IntakeLine[] = [
  {
    id: 1,
    speaker: "agent",
    ar: "مرحبًا هدى! أنا مساعد العيادة. ما الذي جاءت ليلى من أجله اليوم؟",
    en: "Hello Huda! I'm the clinic assistant. What brings Layla in today?",
  },
  {
    id: 2,
    speaker: "parent",
    ar: "ليلى تشتكي من ألم في أذنها اليمنى من يومين.",
    en: "Layla has had pain in her right ear for two days.",
    notes: ["Pain in right ear", "Started 2 days ago"],
  },
  {
    id: 3,
    speaker: "agent",
    ar: "هل عندها حرارة؟ وكم كانت أعلى درجة؟",
    en: "Has she had a fever? What was the highest reading?",
    chips: ["نعم · Yes", "لا · No", "لم أقِسها · Didn't measure"],
  },
  {
    id: 4,
    speaker: "parent",
    ar: "نعم، أمس بالليل ٣٨.٦ أو ٣٩، مو متأكدة. وعطيتها بنادول.",
    en: "Yes, last night 38.6 or 39, I'm not sure. I gave her paracetamol.",
    notes: ["Fever last night (38.6–39 °C)", "Paracetamol given at home"],
  },
  {
    id: 5,
    speaker: "agent",
    ar: "هل يزيد الألم في وقت معيّن، مثلًا عند الاستلقاء؟",
    en: "Is the pain worse at certain times, for example when lying down?",
  },
  {
    id: 6,
    speaker: "parent",
    ar: "نعم، بالليل لما تنام يزيد.",
    en: "Yes, it gets worse at night when she lies down.",
    notes: ["Worse when lying down"],
  },
  {
    id: 7,
    speaker: "agent",
    ar: "هل كان عندها زكام أو كحة قبل هذا؟",
    en: "Did she have a cold or cough before this started?",
    chips: ["نعم · Yes", "لا · No"],
  },
  {
    id: 8,
    speaker: "parent",
    ar: "نعم، كان عندها زكام الأسبوع الماضي.",
    en: "Yes, she had a cold last week.",
    notes: ["Cold last week"],
  },
  {
    id: 9,
    speaker: "agent",
    ar: "هل يخرج أي سائل من الأذن، أو تغيّر في السمع؟",
    en: "Is there any fluid coming from the ear, or any change in hearing?",
    chips: ["لا · No", "سائل · Fluid", "السمع · Hearing"],
  },
  {
    id: 10,
    speaker: "parent",
    ar: "لا، ما في إفرازات، والسمع طبيعي.",
    en: "No discharge, and her hearing seems normal.",
    notes: ["No ear discharge", "Hearing normal"],
  },
  {
    id: 11,
    speaker: "agent",
    ar: "هل تأكل وتشرب بشكل طبيعي؟",
    en: "Is she eating and drinking normally?",
  },
  {
    id: 12,
    speaker: "parent",
    ar: "تاكل أقل من العادة، بس تشرب زين.",
    en: "She's eating less than usual, but drinking well.",
    notes: ["Eating less, drinking well"],
  },
  {
    id: 13,
    speaker: "agent",
    ar: "في ملفها حساسية من البنسلين. هل هذا صحيح؟ وماذا حدث وقتها؟",
    en: "Her file shows a penicillin allergy. Is that right, and what happened?",
  },
  {
    id: 14,
    speaker: "parent",
    ar: "نعم صحيح، طلع لها طفح جلدي بس.",
    en: "Yes, that's right. She only got a rash.",
    notes: ["Penicillin allergy: rash only"],
  },
  {
    id: 15,
    speaker: "agent",
    ar: "هل تأخذ أي أدوية بشكل منتظم؟",
    en: "Does she take any medicines regularly?",
    chips: ["لا · No", "نعم · Yes"],
  },
  {
    id: 16,
    speaker: "parent",
    ar: "لا، بس البنادول هالأيام.",
    en: "No, only the paracetamol these past days.",
    notes: ["No regular medicines"],
  },
  {
    id: 17,
    speaker: "agent",
    ar: "شكرًا هدى. جهّزت ملخصًا للدكتورة نور. الممرضة ستقيس وزن ليلى وحرارتها الآن.",
    en: "Thank you, Huda. I've prepared a summary for Dr. Noor. A nurse will check Layla's weight and temperature now.",
  },
];

export const intakeQuestions = intake.filter((l) => l.speaker === "agent" && l.id !== 1 && l.id !== 17).length;

export const consentText = {
  ar: "سأطرح عليك بعض الأسئلة عن حالة ليلى وأجهّز ملخصًا للطبيبة. الطبيبة تراجع كل شيء وتتخذ القرار. يتم حفظ إجاباتك في ملف ليلى.",
  en: "I'll ask a few questions about Layla and prepare a summary for the doctor. The doctor reviews everything and makes every decision. Your answers are saved to Layla's file.",
};

// ---------------- AI-drafted report ----------------

export type NoteLine = {
  id: string;
  text: string;
  sources: number[]; // intake line ids
  from?: "intake" | "triage" | "record";
  lowConfidence?: string;
};

export const subjective: NoteLine[] = [
  { id: "s1", text: "6-year-old girl with right ear pain for 2 days.", sources: [2] },
  {
    id: "s2",
    text: "Fever last night, highest 38.6–39 °C; paracetamol given at home.",
    sources: [4],
    lowConfidence: "Parent unsure of the exact reading.",
  },
  { id: "s3", text: "Pain worse when lying down.", sources: [6] },
  { id: "s4", text: "Upper respiratory infection last week.", sources: [8] },
  { id: "s5", text: "No ear discharge; hearing reported normal.", sources: [10] },
  { id: "s6", text: "Reduced appetite; drinking well.", sources: [12] },
  { id: "s7", text: "Penicillin allergy (rash only), confirmed by mother.", sources: [13, 14] },
  { id: "s8", text: "No regular medicines.", sources: [15, 16] },
];

export type ExamKey = "right" | "left" | "throat";
export const examOptions: Record<ExamKey, { label: string; options: string[]; supports: string }> = {
  right: { label: "Right eardrum", options: ["Normal", "Red", "Red & bulging", "Perforated"], supports: "Red & bulging" },
  left: { label: "Left eardrum", options: ["Normal", "Red", "Red & bulging", "Perforated"], supports: "Normal" },
  throat: { label: "Throat", options: ["Normal", "Mildly red", "Exudate"], supports: "Mildly red" },
};

export const diagnosis = {
  text: "Acute otitis media, right ear",
  icd: "H66.001",
  icdLabel: "Acute suppurative otitis media without rupture of eardrum, right ear",
  reasoning: "Ear pain with fever after a cold, worse lying down, no discharge. Needs a bulging right eardrum on exam to confirm.",
  alternatives: [
    { text: "Otitis media with effusion", icd: "H65.91" },
    { text: "Viral upper respiratory infection", icd: "J06.9" },
  ],
};

export const plan: NoteLine[] = [
  { id: "p1", text: "Oral non-penicillin antibiotic for 5 days.", sources: [14] },
  { id: "p2", text: "Ibuprofen as needed for pain and fever.", sources: [4] },
  { id: "p3", text: "Return if fever persists beyond 48–72 hours.", sources: [] },
  { id: "p4", text: "Visit summary for family in Arabic and English.", sources: [] },
];

// ---------------- AI-drafted prescription ----------------

export type Rx = {
  id: string;
  drug: string;
  form: string;
  dose: string;
  frequency: string;
  duration: string;
  calc: string;
  why: string;
  checks: { label: string; status: "pass" | "note"; detail: string }[];
};

export const blockedRx = {
  drug: "Amoxicillin",
  reason: "Usual first choice. Blocked: penicillin allergy on file and confirmed by the mother during intake.",
};

export const rxSuggestions: Rx[] = [
  {
    id: "rx1",
    drug: "Cefdinir",
    form: "Oral suspension 250 mg / 5 mL",
    dose: "150 mg (3 mL)",
    frequency: "Twice daily",
    duration: "5 days",
    calc: "14 mg/kg/day × 22.0 kg = 308 mg/day ÷ 2 ≈ 150 mg",
    why: "Alternative for otitis media when the penicillin allergy is non-severe (rash only).",
    checks: [
      { label: "Allergy", status: "note", detail: "Low cross-reactivity with rash-only penicillin allergy" },
      { label: "Interactions", status: "pass", detail: "None with current medicines" },
      { label: "Dose range", status: "pass", detail: "Within range for 22.0 kg" },
    ],
  },
  {
    id: "rx2",
    drug: "Ibuprofen",
    form: "Oral suspension 100 mg / 5 mL",
    dose: "220 mg (11 mL)",
    frequency: "Every 6–8 h as needed",
    duration: "Up to 3 days",
    calc: "10 mg/kg × 22.0 kg = 220 mg per dose · max 4 doses / 24 h",
    why: "Pain and fever relief. Drinking well, so no hydration concern.",
    checks: [
      { label: "Allergy", status: "pass", detail: "No NSAID allergy" },
      { label: "Interactions", status: "pass", detail: "None with current medicines" },
      { label: "Dose range", status: "pass", detail: "Within range for 22.0 kg" },
    ],
  },
];

// ---------------- Insights (sample) ----------------

export const insights = {
  minutesBefore: 12,
  minutesAfter: 4.6,
  patientsBefore: 16,
  patientsAfter: 28,
  breakdownBefore: [
    { label: "History taking", min: 5 },
    { label: "Exam", min: 2 },
    { label: "Notes & prescribing", min: 5 },
  ],
  breakdownAfter: [
    { label: "Review AI brief", min: 1.5 },
    { label: "Exam", min: 2 },
    { label: "Edit & sign", min: 1.1 },
  ],
  intakeCompletion: 91,
  acceptedUnchanged: 78,
  rxOverride: 9,
  hourly: [
    { hour: "08", seen: 6 },
    { hour: "09", seen: 7 },
    { hour: "10", seen: 7 },
    { hour: "11", seen: 8 },
  ],
  flagged: [
    { when: "Wed 11:20", what: "Report", detail: "Parent said 'left' then 'right' ear; AI picked left", status: "Fixed by doctor" },
    { when: "Tue 09:05", what: "Prescription", detail: "Suggested syrup not on hospital formulary", status: "Sent to pharmacy team" },
    { when: "Mon 14:40", what: "Intake", detail: "Gulf Arabic phrase for 'dizzy' misread", status: "Used to improve intake" },
  ],
};
