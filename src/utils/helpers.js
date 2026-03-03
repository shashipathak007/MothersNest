/* ─── Date / ID helpers ─────────────────────────────────────────── */
export const today = () => new Date().toISOString().slice(0, 10);

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 5);

export function nextId(patients) {
  const nums = patients
    .map((p) => parseInt(p.id.replace("MN-", ""), 10))
    .filter((n) => !isNaN(n));
  return `MN-${String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, "0")}`;
}

export function fmtDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch { return iso; }
}

/* ─── Pregnancy calculations ─────────────────────────────────────── */
export function calcEDD(lmp) {
  if (!lmp) return "";
  const d = new Date(lmp + "T00:00:00");
  d.setMonth(d.getMonth() + 9);
  d.setDate(d.getDate() + 7);
  return d.toISOString().slice(0, 10);
}

export function calcGA(lmp) {
  if (!lmp) return "";
  const lmpDate = new Date(lmp + "T00:00:00");
  const now = new Date();
  const diffDays = Math.floor((now - lmpDate) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "";
  const weeks = Math.floor(diffDays / 7);
  const days = diffDays % 7;
  return `${weeks}+${days}`;
}

export function calcBMI(weight, height) {
  if (!weight || !height) return "";
  const h = parseFloat(height) / 100;
  const w = parseFloat(weight);
  if (!h || !w) return "";
  return (w / (h * h)).toFixed(1);
}

/* ─── Obstetric history risk flags ──────────────────────────────── */
export const OB_RISK_FLAGS = [
  { key: "prevPPH", label: "Previous PPH", risk: "high" },
  { key: "prevPreterm", label: "Previous Preterm Birth", risk: "high" },
  { key: "prevStillbirth", label: "Previous Stillbirth", risk: "high" },
  { key: "prevEclampsia", label: "Previous Eclampsia / PIH", risk: "high" },
  { key: "prevNeonatalDeath", label: "Previous Neonatal Death", risk: "high" },
  { key: "prevCongenitalAnomaly", label: "Previous Congenital Anomaly", risk: "high" },
  { key: "prevAbortion2Plus", label: "Previous Abortion (≥2)", risk: "high" },
  { key: "prevSevereAnaemia", label: "Severe Anaemia in prev. preg.", risk: "high" },
  { key: "prevCS", label: "Previous Caesarean Section", risk: "moderate" },
  { key: "prevForceps", label: "Previous Forceps/Vacuum", risk: "moderate" },
  { key: "prevGDM", label: "Previous GDM", risk: "moderate" },
]

export function autoRiskFromObHistory(flags = {}) {
  const priority = ["high", "moderate", "low"];

  for (const level of priority) {
    const keys = OB_RISK_FLAGS
      .filter(f => f.risk === level)
      .map(f => f.key);

    if (keys.some(k => flags[k])) {
      return level;
    }
  }

  return "low";
}

export function autoRisk(tags = [], obFlags = {}) {
  const fromOb = autoRiskFromObHistory(obFlags);
  if (fromOb === "high") return "high";
  if (HIGH_RISK_TAGS.some(t => tags.includes(t))) return "high";
  if (fromOb === "moderate") return "moderate";
  if (MOD_RISK_TAGS.some(t => tags.includes(t))) return "moderate";
  return "low";
}

export function computeOverallRisk(patient) {
  if (!patient) return "low";

  let risk = "low";
  const promote = (lvl) => {
    const order = { low: 0, moderate: 1, high: 2 };
    if (order[lvl] > order[risk]) risk = lvl;
  };

  // ── 1. First Visit assessment (ROS + Medical + Obstetric) ──
  if (patient.firstVisit?.completed) {
    const fv = patient.firstVisit;
    const ros = fv.reviewOfSystems || {};
    const med = fv.medicalHistory || {};
    const ob = fv.obstetricHistory || {};

    // HIGH RISK — Current Danger Symptoms from ROS
    if (ros.pvBleeding) promote("high");
    if (ros.fetalMovements) promote("high"); // reduced/absent
    if (ros.contractions) promote("high"); // preterm contractions
    if (ros.headache && ros.visualDisturbance) promote("high"); // pre-eclampsia signs
    if (ros.headache && ros.epigastricPain) promote("high");
    if (ros.oedema && med.hypertension) promote("high"); // severe oedema with HTN

    // MODERATE RISK — Symptoms from ROS
    if (ros.pvDischarge) promote("moderate");
    if (ros.pelvicPain) promote("moderate");
    if (ros.dyspareunia) promote("moderate");
    if (ros.oedema && !med.hypertension) promote("moderate"); // mild oedema without HTN

    // HIGH RISK — Bad Obstetric History (BOH)
    if (ob.prevPPH) promote("high");
    if (ob.prevPreterm) promote("high");
    if (ob.prevStillbirth) promote("high");
    if (ob.prevEclampsia) promote("high");
    if (ob.prevNeonatalDeath) promote("high");
    if (ob.prevCongenitalAnomaly) promote("high");
    if (ob.prevAbortion2Plus) promote("high");
    if (ob.prevSevereAnaemia) promote("high");

    // MODERATE RISK — Past Obstetric History
    if (ob.prevCS) promote("moderate");
    if (ob.prevForceps) promote("moderate");
    if (ob.prevGDM) promote("moderate");

    // HIGH RISK — Serious Maternal Medical Disorders
    if (med.hypertension) promote("high");
    if (med.diabetes) promote("high");
    if (med.heartDisease) promote("high");
    if (med.sle) promote("high");
    if (med.sickleCell) promote("high");
    if (med.hiv) promote("high");
    if (med.hepatitisB) promote("high");
    if (med.hepatitisC) promote("high");
    if (med.tb) promote("high");
    if (med.kidneyLiver) promote("high");
    if (med.cysticFibrosis) promote("high");
    if (med.epilepsy) promote("high");

    // MODERATE RISK — Chronic but Controlled Diseases
    if (med.asthma) promote("moderate");
    if (med.thyroid) promote("moderate");
  } else {
    // No first visit yet — fallback to tags + basicMedical from registration
    const tagsRisk = autoRisk(patient.tags || [], patient.basicMedical || {});
    promote(tagsRisk);
  }

  // ── 2. Registration basic medical flags ──
  const bm = patient.basicMedical || {};
  if (bm.highBP) promote("high");
  if (bm.diabetes) promote("high");
  if (bm.prevCS) promote("moderate");
  if (bm.thyroid) promote("moderate");

  // ── 3. Tag-based risk (existing patient tags) ──
  if (HIGH_RISK_TAGS.some(t => (patient.tags || []).includes(t))) promote("high");
  if (MOD_RISK_TAGS.some(t => (patient.tags || []).includes(t))) promote("moderate");

  // ── 4. Visit-based vitals & notes ──
  if (patient.visits) {
    for (const v of patient.visits) {
      if (v.bpFlag === "severe") promote("high");
      if (v.bpFlag === "high") promote("moderate");

      if (v.oedema === "Moderate (++)" || v.oedema === "Severe (+++)") {
        promote("high");
      } else if (v.oedema === "Mild (+)") {
        promote("moderate");
      }

      const text = `${v.findings || ""} ${v.plan || ""} ${v.examNotes || ""}`.toLowerCase();

      if (
        text.includes("pv bleeding") ||
        text.includes("severe headache") ||
        text.includes("epigastric pain") ||
        text.includes("visual changes") ||
        text.includes("eclampsia") ||
        text.includes("absent fetal movement") ||
        text.includes("reduced fetal movement") ||
        text.includes("severe hypertension")
      ) {
        promote("high");
      } else if (
        text.includes("pv discharge") ||
        text.includes("pelvic pain") ||
        text.includes("mild oedema") ||
        text.includes("contractions")
      ) {
        promote("moderate");
      }
    }
  }

  // ── 5. Lab-based risk ──
  if (patient.labs) {
    for (const l of patient.labs) {
      if (l.status === "abnormal") {
        const testName = l.test;

        // High Risk Tests — infectious / metabolic
        if (["HIV (1 & 2)", "HBsAg", "VDRL/RPR (Syphilis)", "HCV",
          "Fasting Blood Sugar", "OGTT 75g (Fasting)", "OGTT 75g (1 hr)", "OGTT 75g (2 hr)"
        ].includes(testName)) {
          promote("high");
        }

        // Haemoglobin checks
        if (testName === "Haemoglobin") {
          const hb = parseFloat(l.value);
          if (!isNaN(hb)) {
            if (hb < 7.0) promote("high");
            else if (hb < 11.0) promote("moderate");
          } else {
            promote("moderate");
          }
        }

        // Any other abnormal lab → at least moderate
        promote("moderate");
      }
    }
  }

  return risk;
}

/* ─── Risk config ────────────────────────────────────────────────── */
export const HIGH_RISK_TAGS = [
  "GDM", "PIH", "Rh Negative", "Severe Anaemia", "Twin Pregnancy", "Placenta Previa",
];
export const MOD_RISK_TAGS = ["Thyroid", "Elderly Gravida"];
export const ALL_TAGS = [...HIGH_RISK_TAGS, ...MOD_RISK_TAGS];

export const RISK_CONFIG = {
  high: { label: "High Risk", dot: "bg-red-500", pill: "bg-red-50 text-rose-700 ring-1 ring-rose-200" },
  moderate: { label: "Moderate Risk", dot: "bg-amber-500", pill: "bg-amber-50 text-amber-700 ring-1 ring-amber-200" },
  low: { label: "Low Risk", dot: "bg-emerald-500", pill: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" },
};

export const TAG_PILL = {
  "GDM": "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
  "PIH": "bg-red-50 text-red-700 ring-1 ring-red-200",
  "Rh Negative": "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
  "Severe Anaemia": "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  "Twin Pregnancy": "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",
  "Placenta Previa": "bg-red-50 text-red-700 ring-1 ring-red-200",
  "Thyroid": "bg-teal-50 text-teal-700 ring-1 ring-teal-200",
  "Elderly Gravida": "bg-purple-50 text-purple-700 ring-1 ring-purple-200",
};

/**
 * Consolidates tags, medical history, and obstetric risks into a single array of items.
 * Each item has { label: string, risk: 'high' | 'moderate' | 'low' }.
 */
export function getPatientConditions(patient) {
  if (!patient) return [];
  const items = [];
  const seen = new Set();

  const add = (label, risk) => {
    if (!label) return;
    const l = label.trim();
    if (!seen.has(l)) {
      items.push({ label: l, risk });
      seen.add(l);
    }
  };

  // 1. Tags
  (patient.tags || []).forEach((t) => {
    let risk = "low";
    if (HIGH_RISK_TAGS.includes(t)) risk = "high";
    else if (MOD_RISK_TAGS.includes(t)) risk = "moderate";
    add(t, risk);
  });

  // 2. Registration/Basic Medical flags
  const bm = patient.basicMedical || {};
  if (bm.highBP) add("High BP", "high");
  if (bm.diabetes) add("Diabetes", "high");
  if (bm.thyroid) add("Thyroid", "moderate");
  if (bm.prevCS) add("Prev CS", "moderate");

  // 3. Maternal health evaluation (First Visit)
  if (patient.firstVisit?.completed) {
    const fv = patient.firstVisit;
    const med = fv.medicalHistory || {};
    const ob = fv.obstetricHistory || {};
    const ros = fv.reviewOfSystems || {};

    // Medical
    if (med.hypertension) add("HTN", "high");
    if (med.diabetes) add("DM", "high");
    if (med.heartDisease) add("Heart Disease", "high");
    if (med.hiv) add("HIV", "high");
    if (med.hbLevel && parseFloat(med.hbLevel) < 7) add("Severe Anaemia", "high");

    // Obstetric flags
    OB_RISK_FLAGS.forEach((f) => {
      if (ob[f.key]) add(f.label.replace("Previous ", "Prev "), f.risk);
    });

    // ROS Danger Symptoms
    if (ros.pvBleeding) add("PV Bleeding", "high");
    if (ros.fetalMovements) add("Reduced Fetal Movement", "high");
    if (ros.contractions) add("Preterm Contractions", "high");
  }

  // Support for generic obstetricFlags if firstVisit not used
  if (patient.obstetricFlags) {
    OB_RISK_FLAGS.forEach((f) => {
      if (patient.obstetricFlags[f.key]) add(f.label.replace("Previous ", "Prev "), f.risk);
    });
  }

  // Sort by risk: high -> moderate -> low
  const riskOrder = { high: 0, moderate: 1, low: 2 };
  items.sort((a, b) => riskOrder[a.risk] - riskOrder[b.risk]);

  return items;
}

export const STATUS_PILL = {
  normal: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  abnormal: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
};

/* ─── Dropdown options ───────────────────────────────────────────── */
export const BLOOD_GROUPS = ["A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−"];
export const EDUCATION_LEVELS = [
  "Illiterate", "Primary (1–5)", "Lower Secondary (6–8)",
  "Secondary (9–10)", "Higher Secondary (11–12)", "Graduate", "Post Graduate",
];
export const OCCUPATIONS = [
  "Homemaker", "Farmer", "Teacher", "Healthcare Worker",
  "Business", "Government Employee", "Labourer", "Other",
];
export const RELIGIONS = ["Hindu", "Buddhist", "Muslim", "Christian", "Kirat", "Other"];
export const ETHNICITIES = ["Brahmin", "Chhetri", "Janajati", "Madhesi", "Dalit", "Muslim", "Other"];

/* ─── Visit types ────────────────────────────────────────────────── */
export const VISIT_TYPES = [
  "ANC 1st Visit (≤12 weeks)",
  "ANC 2nd Visit (16 weeks)",
  "ANC 3rd Visit (20–24 weeks)",
  "ANC 4th Visit (28 weeks)",
  "ANC 5th Visit (32 weeks)",
  "ANC 6th Visit (34 weeks)",
  "ANC 7th Visit (36 weeks)",
  "ANC 8th Visit (38–40 weeks)",
  "Emergency Visit",
  "Unscheduled ANC Visit",
  "Normal Visit",
];

export const VISIT_BADGE = {
  "ANC 1st Visit (≤12 weeks)": "bg-sky-100 text-sky-700",
  "ANC 2nd Visit (16 weeks)": "bg-blue-100 text-blue-700",
  "ANC 3rd Visit (20–24 weeks)": "bg-indigo-100 text-indigo-700",
  "ANC 4th Visit (28 weeks)": "bg-violet-100 text-violet-700",
  "ANC 5th Visit (32 weeks)": "bg-purple-100 text-purple-700",
  "ANC 6th Visit (34 weeks)": "bg-fuchsia-100 text-fuchsia-700",
  "ANC 7th Visit (36 weeks)": "bg-pink-100 text-pink-700",
  "ANC 8th Visit (38–40 weeks)": "bg-rose-100 text-rose-700",
  "Emergency Visit": "bg-red-100 text-red-700",
  "Unscheduled ANC Visit": "bg-stone-100 text-stone-600",
};

/* ─── ANC 8-contact schedule ─────────────────────────────────────── */
export const ANC_SCHEDULE = [
  { contact: 1, label: "1st Visit", timing: "≤12 weeks", maxWeeks: 12, visitType: "ANC 1st Visit (≤12 weeks)" },
  { contact: 2, label: "2nd Visit", timing: "16 weeks", maxWeeks: 17, visitType: "ANC 2nd Visit (16 weeks)" },
  { contact: 3, label: "3rd Visit", timing: "20–24 weeks", maxWeeks: 24, visitType: "ANC 3rd Visit (20–24 weeks)" },
  { contact: 4, label: "4th Visit", timing: "28 weeks", maxWeeks: 29, visitType: "ANC 4th Visit (28 weeks)" },
  { contact: 5, label: "5th Visit", timing: "32 weeks", maxWeeks: 33, visitType: "ANC 5th Visit (32 weeks)" },
  { contact: 6, label: "6th Visit", timing: "34 weeks", maxWeeks: 35, visitType: "ANC 6th Visit (34 weeks)" },
  { contact: 7, label: "7th Visit", timing: "36 weeks", maxWeeks: 37, visitType: "ANC 7th Visit (36 weeks)" },
  { contact: 8, label: "8th Visit", timing: "38–40 weeks", maxWeeks: 42, visitType: "ANC 8th Visit (38–40 weeks)" },
];

export function getMissedContacts(lmp, visits = []) {
  if (!lmp) return [];
  const gaStr = calcGA(lmp);
  if (!gaStr) return [];
  const gaWeeks = parseInt(gaStr.split("+")[0], 10);
  return ANC_SCHEDULE.filter(c => {
    const pastDue = gaWeeks > c.maxWeeks;
    const done = visits.some(v => v.type === c.visitType || v.ancContact === c.contact);
    return pastDue && !done;
  });
}

export function getCurrentANCContact(lmp) {
  if (!lmp) return null;
  const gaStr = calcGA(lmp);
  if (!gaStr) return null;
  const gaWeeks = parseInt(gaStr.split("+")[0], 10);
  if (gaWeeks <= 12) return 1;
  if (gaWeeks <= 17) return 2;
  if (gaWeeks <= 24) return 3;
  if (gaWeeks <= 29) return 4;
  if (gaWeeks <= 33) return 5;
  if (gaWeeks <= 35) return 6;
  if (gaWeeks <= 37) return 7;
  return 8;
}

/* ─── Suggested tests per ANC contact ────────────────────────────── */
export const ANC_VISIT_TESTS = {
  1: [
    "Haemoglobin", "Blood Group & Rh", "Urine Protein", "Urine Sugar",
    "HIV (1 & 2)", "HBsAg", "VDRL/RPR (Syphilis)", "TSH",
    "Fasting Blood Sugar", "Ultrasound (Dating)",
  ],
  2: [
    "Haemoglobin", "Urine Protein", "Urine Sugar",
  ],
  3: [
    "Haemoglobin", "Urine Protein", "Urine Sugar", "Anomaly Scan",
  ],
  4: [
    "Haemoglobin", "Urine Protein", "Urine Sugar",
    "OGTT 75g (Fasting)", "OGTT 75g (1 hr)", "OGTT 75g (2 hr)",
  ],
  5: [
    "Urine Protein", "Urine Sugar",
  ],
  6: [
    "Haemoglobin", "Urine Protein", "Urine Sugar",
  ],
  7: [
    "Urine Protein", "Urine Sugar",
  ],
  8: [
    "Haemoglobin", "Urine Protein", "Urine Sugar", "Growth Scan",
  ],
};

/* ─── Basic medical flags (registration) ─────────────────────────── */
export const BASIC_MEDICAL_FLAGS = [
  { key: "highBP", label: "High Blood Pressure" },
  { key: "diabetes", label: "Diabetes" },
  { key: "thyroid", label: "Thyroid Problems" },
  { key: "prevCS", label: "Previous Cesarean Section" },
];

/* ─── Auto-risk from first visit history ─────────────────────────── */
export function autoRiskFromFirstVisit(firstVisit = {}) {
  if (!firstVisit || !firstVisit.completed) return null;
  const ros = firstVisit.reviewOfSystems || {};
  const med = firstVisit.medicalHistory || {};
  const ob = firstVisit.obstetricHistory || {};

  // HIGH RISK conditions
  const highConditions = [
    // Danger symptoms from ROS
    ros.pvBleeding, ros.fetalMovements, ros.contractions,
    ros.headache && ros.visualDisturbance,
    ros.headache && ros.epigastricPain,
    ros.oedema && med.hypertension,
    // Bad Obstetric History
    ob.prevPPH, ob.prevPreterm, ob.prevStillbirth, ob.prevEclampsia,
    ob.prevNeonatalDeath, ob.prevCongenitalAnomaly,
    ob.prevAbortion2Plus, ob.prevSevereAnaemia,
    // Serious Medical Disorders
    med.hypertension, med.diabetes, med.heartDisease,
    med.sle, med.sickleCell, med.hiv, med.hepatitisB, med.hepatitisC,
    med.tb, med.kidneyLiver, med.cysticFibrosis, med.epilepsy,
  ];

  // MODERATE RISK conditions
  const modConditions = [
    // Symptoms from ROS
    ros.pvDischarge, ros.pelvicPain, ros.dyspareunia,
    ros.oedema && !med.hypertension,
    // Past obstetric
    ob.prevCS, ob.prevForceps, ob.prevGDM,
    // Controlled diseases
    med.asthma, med.thyroid,
  ];

  if (highConditions.some(Boolean)) return "high";
  if (modConditions.some(Boolean)) return "moderate";
  return "low";
}

/* ─── Lab tests catalogue ────────────────────────────────────────── */
export const LAB_TESTS = [
  // Haematology
  { name: "Haemoglobin", unit: "g/dL", category: "Haematology", low: 11.0, high: 15.0 },
  { name: "Blood Group & Rh", unit: "", category: "Haematology", text: true },
  { name: "Packed Cell Volume (PCV)", unit: "%", category: "Haematology", low: 33, high: 44 },
  { name: "Platelet Count", unit: "×10³/µL", category: "Haematology", low: 150, high: 400 },
  { name: "WBC Count", unit: "×10³/µL", category: "Haematology", low: 4.5, high: 11 },

  // Blood Sugar
  { name: "Fasting Blood Sugar", unit: "mg/dL", category: "Blood Sugar", low: 70, high: 99 },
  { name: "Post-prandial Sugar", unit: "mg/dL", category: "Blood Sugar", low: 70, high: 139 },
  { name: "OGTT 75g (Fasting)", unit: "mg/dL", category: "Blood Sugar", low: 70, high: 92 },
  { name: "OGTT 75g (1 hr)", unit: "mg/dL", category: "Blood Sugar", low: 70, high: 180 },
  { name: "OGTT 75g (2 hr)", unit: "mg/dL", category: "Blood Sugar", low: 70, high: 153 },
  { name: "HbA1c", unit: "%", category: "Blood Sugar", low: 4.0, high: 5.6 },

  // Urine (text based)
  { name: "Urine Protein", unit: "", category: "Urine", text: true },
  { name: "Urine Sugar", unit: "", category: "Urine", text: true },
  { name: "Urine R/M/E", unit: "", category: "Urine", text: true },

  // Renal
  { name: "Serum Creatinine", unit: "mg/dL", category: "Renal", low: 0.5, high: 1.1 },
  { name: "Serum Uric Acid", unit: "mg/dL", category: "Renal", low: 2.5, high: 6.0 },
  { name: "BUN", unit: "mg/dL", category: "Renal", low: 7, high: 20 },

  // Thyroid
  { name: "TSH", unit: "mIU/L", category: "Thyroid", low: 0.4, high: 4.0 },
  { name: "T4 (Free)", unit: "ng/dL", category: "Thyroid", low: 0.7, high: 1.8 },

  // Infectious (text based)
  { name: "HIV (1 & 2)", unit: "", category: "Infectious", text: true },
  { name: "HBsAg", unit: "", category: "Infectious", text: true },
  { name: "VDRL/RPR (Syphilis)", unit: "", category: "Infectious", text: true },
  { name: "HCV", unit: "", category: "Infectious", text: true },

  // Imaging
  { name: "Ultrasound (Dating)", unit: "", category: "Imaging", text: true },
  { name: "Anomaly Scan", unit: "", category: "Imaging", text: true },
  { name: "Growth Scan", unit: "", category: "Imaging", text: true },
  { name: "Doppler Study", unit: "", category: "Imaging", text: true },

  // Other
  { name: "Vitamin D (25-OH)", unit: "ng/mL", category: "Other", low: 30, high: 100 },
  { name: "Iron Studies (Ferritin)", unit: "ng/mL", category: "Other", low: 15, high: 150 },
  { name: "Indirect Coombs Test", unit: "", category: "Other", text: true },
];

export const LAB_CATEGORIES = [...new Set(LAB_TESTS.map(t => t.category))];

export function getLabMeta(name) {
  return LAB_TESTS.find(t => t.name === name) || null;
}

export function getLabUnit(name) {
  return getLabMeta(name)?.unit ?? "";
}

export function getLabOptions(name) {
  if (name === "Urine Protein") return [
    "Negative (0 mg/dL)",
    "Trace (10–20 mg/dL)",
    "+ (~30 mg/dL)",
    "++ (~100 mg/dL)",
    "+++ (~300 mg/dL)",
    "++++ (≥1000 mg/dL)"
  ];
  if (name === "Urine Sugar") return [
    "Negative (0 mg/dL)",
    "Trace (~100 mg/dL)",
    "+ (~250 mg/dL)",
    "++ (~500 mg/dL)",
    "+++ (~1000 mg/dL)"
  ];
  if (["HIV (1 & 2)", "HBsAg", "VDRL/RPR (Syphilis)", "HCV"].includes(name)) return ["Negative", "Positive"];
  if (["Ultrasound (Dating)", "Anomaly Scan", "Growth Scan", "Doppler Study"].includes(name)) return ["Normal", "Abnormal Findings"];
  return null;
}

export function autoLabStatus(name, value) {
  const meta = getLabMeta(name);

  // No value entered
  if (value === undefined || value === null || value === "") {
    return "pending";
  }

  if (!meta) return "pending";

  // TEXT BASED TESTS
  if (meta.text) {
    const v = String(value).toLowerCase().trim();

    if (
      v.includes("positive") ||
      v.includes("reactive") ||
      v.includes("detected") ||
      v.includes("+") ||
      v.includes("trace") ||
      v.includes("abnormal")
    ) {
      if (name === "Urine Protein" && v.includes("trace")) {
        return "normal"; // Trace is usually normal for Urine Protein
      }
      return "abnormal";
    }

    if (v.includes("negative") || v.includes("normal") || v.includes("non-reactive") || v === "none") {
      return "normal";
    }

    return "normal";
  }

  // NUMERIC TESTS
  const num = parseFloat(value);
  if (isNaN(num)) return "pending";

  if (meta.low !== null && num < meta.low) {
    return "abnormal";
  }

  if (meta.high !== null && num > meta.high) {
    return "abnormal";
  }

  return "normal";
}

/* ─── Vital sign auto-flags ──────────────────────────────────────── */
export function bpFlag(bp) {
  if (!bp) return null;
  const [sys, dia] = bp.split("/").map(Number);
  if (!sys || !dia) return null;
  if (sys >= 160 || dia >= 110) return "severe";
  if (sys >= 140 || dia >= 90) return "high";
  if (sys < 90 || dia < 60) return "low";
  return "normal";
}

export function pulseFlag(pulse) {
  if (!pulse) return null;
  const p = parseInt(pulse, 10);
  if (p < 60) return "low";
  if (p > 100) return "high";
  return "normal";
}

export function fetalHRFlag(fhr) {
  if (!fhr) return null;
  const n = parseInt(fhr, 10);
  if (n < 110) return "bradycardia";
  if (n > 160) return "tachycardia";
  return "normal";
}

