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

export function calcGA(lmp, targetDate) {
  if (!lmp) return "";
  const lmpDate = new Date(lmp + "T00:00:00");
  const now = targetDate ? new Date(targetDate + "T00:00:00") : new Date();
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

/* ── Previous pregnancy dropdown options with risk levels ──────── */
export const PREV_PREG_OPTIONS = {
  outcome: [
    { label: "Live Birth", risk: "low" },
    { label: "Abortion (1–2)", risk: "moderate" },
    { label: "Recurrent abortion (3+)", risk: "high" },
    { label: "Stillbirth", risk: "high" },
    { label: "Neonatal Death", risk: "high" },
  ],
  modeOfDelivery: [
    { label: "SVD (Normal)", risk: "low" },
    { label: "Forceps / Vacuum", risk: "moderate" },
    { label: "LSCS (1st time)", risk: "moderate" },
    { label: "LSCS (2nd or more)", risk: "High" },
  ],
  complications: [
    { label: "None", risk: "low" },
    { label: "GDM (diet controlled)", risk: "moderate" },
    { label: "Anaemia", risk: "moderate" },
    { label: "Pre-eclampsia (mild)", risk: "moderate" },
    { label: "PPH (no transfusion)", risk: "moderate" },
    { label: "GDM (insulin)", risk: "high" },
    { label: "Severe PPH (transfusion)", risk: "high" },
    { label: "Eclampsia", risk: "high" },
    { label: "Sepsis", risk: "high" },
    { label: "Uterine rupture", risk: "high" },
  ],
  gaAtDelivery: [
    { label: "37–42 weeks (Term)", risk: "low" },
    { label: "34–37 weeks", risk: "moderate" },
    { label: "Less than 34 weeks", risk: "high" },
  ],
  birthWeight: [
    { label: "2.5 kg and above", risk: "low" },
    { label: "1.5–2.5 kg", risk: "moderate" },
    { label: "Less than 1.5 kg", risk: "high" },
  ],
  babyComplications: [
    { label: "None", risk: "low" },
    { label: "Jaundice", risk: "moderate" },
    { label: "NICU admission", risk: "moderate" },
    { label: "Birth asphyxia", risk: "high" },
    { label: "Congenital anomaly", risk: "high" },
    { label: "Respiratory distress", risk: "high" },
  ],
  congenitalAnomalies: [
    { label: "None", risk: "low" },
    { label: "Present", risk: "high" },
  ],
  interventions: [
    { label: "None", risk: "low" },
    { label: "Episiotomy / ARM / Oxytocin", risk: "moderate" },
    { label: "Blood transfusion", risk: "high" },
  ],
  anaesthesia: [
    { label: "None / Local", risk: "low" },
    { label: "Epidural / Spinal", risk: "moderate" },
    { label: "General Anaesthesia", risk: "high" },
  ],
  interpregnancyInterval: [
    { label: "18 months or more", risk: "low" },
    { label: "12–18 months", risk: "moderate" },
    { label: "Less than 12 months", risk: "high" },
  ],
  ancAttended: [
    { label: "Yes", risk: "low" },
    { label: "No", risk: "moderate" },
  ],
};

export function getPrevPregRisk(field, value) {
  const options = PREV_PREG_OPTIONS[field];
  if (!options || !value) return null;
  const match = options.find(o => o.label === value);
  return match ? match.risk : null;
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

    // GBV / Domestic Violence — HIGH RISK
    if (fv.socialHistory?.domesticViolence) promote("high");

    // Also scan previousPregnancies for delivery complications
    // (important for returning patients who completed a new first visit)
    const prevPregsFromFv = ob.previousPregnancies || [];
    prevPregsFromFv.forEach(preg => {
      const mode = preg.modeOfDelivery || "";
      if (mode === "LSCS (Emergency)") promote("high");
      else if (mode.includes("LSCS") || mode === "Forceps Delivery" || mode === "Vacuum Delivery" || mode === "Assisted Breech Delivery") promote("moderate");

      const comp = preg.complications || "";
      if (["PPH (Postpartum Hemorrhage)", "Eclampsia", "Sepsis"].includes(comp)) promote("high");
      else if (["Retained Placenta", "Perineal Tear (3rd/4th Degree)"].includes(comp)) promote("moderate");

      const baby = preg.babyComplications || preg.outcome || preg.babyStatus || "";
      if (["Stillbirth", "Neonatal Death"].includes(baby)) promote("high");
      else if (["NICU Admitted", "NICU admitted", "Referred", "Congenital Anomaly"].includes(baby)) promote("moderate");
    });
  } else if (patient.prevFirstVisit || (patient.firstVisit && !patient.firstVisit.completed)) {
    // Returning patient — check complications from previous pregnancy record
    const src = patient.prevFirstVisit || patient.firstVisit;
    const ob = src.obstetricHistory || {};
    const prevPregs = ob.previousPregnancies || [];

    prevPregs.forEach(preg => {
      // 1. Mode of Delivery Risk
      const mode = preg.modeOfDelivery || "";
      if (mode === "LSCS (Emergency)") {
        promote("high");
      } else if (
        mode === "Cesarean Section (LSCS – Elective)" ||
        mode === "Forceps Delivery" ||
        mode === "Vacuum Delivery" ||
        mode === "Assisted Breech Delivery" ||
        mode === "Cesarean Section (LSCS)" ||
        mode.includes("LSCS")
      ) {
        promote("moderate");
      }

      // 2. Maternal Complications Risk
      const comp = preg.complications || "";
      if (["PPH (Postpartum Hemorrhage)", "Eclampsia", "Sepsis"].includes(comp) || comp.includes("PPH (Postpartum Hemorrhage)")) {
        promote("high");
      } else if (["Retained Placenta", "Perineal Tear (3rd/4th Degree)"].includes(comp)) {
        promote("moderate");
      } else if (comp && comp !== "None") {
        // Fallback for other complications listed moderately
        promote("moderate");
      }

      // 3. Baby Status Risk
      const baby = preg.babyComplications || preg.outcome || preg.babyStatus || "";
      if (["Stillbirth", "Neonatal Death"].includes(baby)) {
        promote("high");
      } else if (["NICU Admitted", "NICU admitted", "Referred", "Congenital Anomaly"].includes(baby)) {
        promote("moderate");
      }

      // Check standard boolean flags from first visit history
      OB_RISK_FLAGS.forEach(f => {
        if (preg[f.key]) promote(f.risk);
      });
    });

    const fromOb = autoRiskFromObHistory(src.obstetricHistory);
    promote(fromOb);
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

      if (v.gbvRisk) promote("high");

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
        if (["HIV (1 & 2)", "HIV Status", "HBsAg", "Hepatitis B (HBsAg)", "VDRL/RPR (Syphilis)", "HCV", "HPV Test",
          "Fasting Blood Sugar", "Blood Glucose (RBS)", "OGTT 75g (Fasting)", "OGTT 75g (1 hr)", "OGTT 75g (2 hr)",
          "Rhesus Factor", "Urine — Leucocytes",
        ].includes(testName)) {
          promote("high");
        }

        // Haemoglobin checks
        if (testName === "Haemoglobin") {
          const hb = parseFloat(l.value);
          if (!isNaN(hb)) {
            if (hb < 8.0) promote("high");
            else if (hb < 11.0) promote("moderate");
          } else {
            promote("moderate");
          }
        }

        // Any other abnormal lab → at least moderate
        promote("moderate");
      }

      // Handle moderate lab status
      if (l.status === "moderate") {
        promote("moderate");
      }
    }
  }

  // ── 6. Delivery-based risk (postnatal) ──
  if (patient.patientType === "postnatal") {
    // Mode of Delivery
    const dt = (DELIVERY_TYPES || []).find(t => t.label === patient.deliveryMode);
    if (dt?.risk === "high") promote("high");
    else if (dt?.risk === "moderate") promote("moderate");

    // Maternal Complications
    const comp = patient.maternalComplications || "";
    if (["PPH (Postpartum Hemorrhage)", "Eclampsia", "Sepsis", "Postpartum hemorrhage"].some(c => comp.includes(c))) promote("high");
    else if (["Retained Placenta", "Perineal Tear (3rd/4th Degree)"].some(c => comp.includes(c))) promote("moderate");

    // Baby Birth Weight (ELBW/VLBW = High, LBW/Macrosomia = Moderate)
    const w = parseFloat(patient.birthWeight);
    if (!isNaN(w)) {
      if (w < 1.5) promote("high");
      else if (w < 2.5 || w > 4.0) promote("moderate");
    }

    // APGAR Score
    const a1 = parseInt(patient.apgar1);
    const a5 = parseInt(patient.apgar5);
    const ad = parseInt(patient.apgarDischarge);
    [a1, a5, ad].forEach(score => {
      if (!isNaN(score)) {
        if (score <= 3) promote("high");
        else if (score <= 6) promote("moderate");
      }
    });

    // Check stored risks (flags computed during recording)
    if (patient._risks) {
      Object.values(patient._risks).forEach(r => {
        if (typeof r === 'object' && r?.level) promote(r.level);
      });
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
  moderate: { label: "Moderate Risk", dot: "bg-yellow-400", pill: "bg-yellow-50 text-yellow-800 ring-1 ring-yellow-200" },
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

    if (fv.socialHistory?.domesticViolence) add("GBV Risk", "high");
  } else if (patient.prevFirstVisit) {
    // If no active first visit, pull conditions from previous pregnancies context
    const ob = patient.prevFirstVisit.obstetricHistory || {};
    const prevPregs = ob.previousPregnancies || [];

    prevPregs.forEach(preg => {
      // 1. Mode of Delivery Risk
      const mode = preg.modeOfDelivery || "";
      if (mode === "LSCS (Emergency)") add(mode, "high");
      else if (
        mode === "Cesarean Section (LSCS – Elective)" ||
        mode === "Forceps Delivery" ||
        mode === "Vacuum Delivery" ||
        mode === "Assisted Breech Delivery" ||
        mode === "Cesarean Section (LSCS)" ||
        mode.includes("LSCS")
      ) {
        add(mode, "moderate");
      }

      // 2. Maternal Complications Risk
      const comp = preg.complications || "";
      if (["PPH (Postpartum Hemorrhage)", "Eclampsia", "Sepsis"].includes(comp) || comp.includes("PPH (Postpartum Hemorrhage)")) {
        add(comp, "high");
      } else if (["Retained Placenta", "Perineal Tear (3rd/4th Degree)"].includes(comp)) {
        add(comp, "moderate");
      } else if (comp && comp !== "None") {
        add(comp, "moderate");
      }

      // 3. Baby Status Risk
      const baby = preg.babyComplications || preg.outcome || preg.babyStatus || "";
      if (["Stillbirth", "Neonatal Death"].includes(baby)) {
        add(`Prev ${baby}`, "high");
      } else if (["NICU Admitted", "NICU admitted", "Referred", "Congenital Anomaly"].includes(baby)) {
        add(`Prev ${baby}`, "moderate");
      }

      // Standard flags
      OB_RISK_FLAGS.forEach((f) => {
        if (preg[f.key]) add(f.label.replace("Previous ", "Prev "), f.risk);
      });
    });
  }

  // Support for generic obstetricFlags if firstVisit not used
  if (patient.obstetricFlags) {
    OB_RISK_FLAGS.forEach((f) => {
      if (patient.obstetricFlags[f.key]) add(f.label.replace("Previous ", "Prev "), f.risk);
    });
  }

  // 4. Visit risks
  (patient.visits || []).forEach(v => {
    if (v.gbvRisk) add("GBV Risk", "high");
  });

  // Sort by risk: high -> moderate -> low
  const riskOrder = { high: 0, moderate: 1, low: 2 };
  items.sort((a, b) => riskOrder[a.risk] - riskOrder[b.risk]);

  return items;
}

export const STATUS_PILL = {
  normal: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  moderate: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  abnormal: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  pending: "bg-stone-50 text-stone-500 ring-1 ring-stone-200",
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
export const ETHNICITIES = ["Brahmin","Thakuri", "Chhetri", "Janajati", "Madhesi", "Dalit", "Muslim", "Other"];

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

export const CONTRACEPTIVE_METHODS = [
  { label: "None", risk: "normal" },
  { label: "Oral Pills", risk: "low" },
  { label: "Implant", risk: "low" },
  { label: "Copper IUD", risk: "low" },
  { label: "Hormonal IUD", risk: "low" },
  { label: "Emergency Pill", risk: "low" },
  { label: "Injectable (DMPA)", risk: "moderate" },
];

export const DELIVERY_TYPES = [
  { label: "SVD (Spontaneous Vaginal Delivery)", risk: "low" },
  { label: "Normal Vaginal Delivery (SVD)", risk: "low" },
  { label: "Cesarean Section (LSCS)", risk: "moderate" },
  { label: "LSCS (Emergency)", risk: "high" },
  { label: "Forceps Delivery", risk: "moderate" },
  { label: "Vacuum Delivery", risk: "moderate" },
  { label: "Assisted Breech Delivery", risk: "high" },
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
    "Haemoglobin", "Blood Group", "Rhesus Factor",
    "HIV Status", "VDRL/RPR (Syphilis)", "Hepatitis B (HBsAg)",
    "Blood Glucose (RBS)",
    "Urine — Protein", "Urine — Glucose", "Urine — Leucocytes",
    "Early U/S (<24wks)",
  ],
  2: [
    "Haemoglobin", "Urine Protein", "Urine Sugar",
    "HIV Status", "VDRL/RPR (Syphilis)",
  ],
  3: [
    "Haemoglobin", "Urine Protein", "Urine Sugar", "Anomaly Scan",
    "HIV Status", "VDRL/RPR (Syphilis)",
  ],
  4: [
    "Haemoglobin", "Urine Protein", "Urine Sugar",
    "OGTT 75g (Fasting)", "OGTT 75g (1 hr)", "OGTT 75g (2 hr)",
    "HIV Status", "VDRL/RPR (Syphilis)",
  ],
  5: [
    "Urine Protein", "Urine Sugar",
    "HIV Status", "VDRL/RPR (Syphilis)",
  ],
  6: [
    "Haemoglobin", "Urine Protein", "Urine Sugar",
    "HIV Status", "VDRL/RPR (Syphilis)",
  ],
  7: [
    "Urine Protein", "Urine Sugar",
    "HIV Status", "VDRL/RPR (Syphilis)",
  ],
  8: [
    "Haemoglobin", "Urine Protein", "Urine Sugar", "Growth Scan",
    "HIV Status", "VDRL/RPR (Syphilis)",
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
  { name: "Blood Group", unit: "", category: "Haematology", text: true },
  { name: "Rhesus Factor", unit: "", category: "Haematology", text: true },
  { name: "Blood Group & Rh", unit: "", category: "Haematology", text: true },
  { name: "Packed Cell Volume (PCV)", unit: "%", category: "Haematology", low: 33, high: 44 },
  { name: "Platelet Count", unit: "×10³/µL", category: "Haematology", low: 150, high: 400 },
  { name: "WBC Count", unit: "×10³/µL", category: "Haematology", low: 4.5, high: 11 },

  // Blood Sugar
  { name: "Fasting Blood Sugar", unit: "mg/dL", category: "Blood Sugar", low: 70, high: 99 },
  { name: "Post-prandial Sugar", unit: "mg/dL", category: "Blood Sugar", low: 70, high: 139 },
  { name: "Blood Glucose (RBS)", unit: "mmol/L", category: "Blood Sugar", low: 3.9, high: 6.9 },
  { name: "OGTT 75g (Fasting)", unit: "mg/dL", category: "Blood Sugar", low: 70, high: 92 },
  { name: "OGTT 75g (1 hr)", unit: "mg/dL", category: "Blood Sugar", low: 70, high: 180 },
  { name: "OGTT 75g (2 hr)", unit: "mg/dL", category: "Blood Sugar", low: 70, high: 153 },
  { name: "HbA1c", unit: "%", category: "Blood Sugar", low: 4.0, high: 5.6 },

  // Urine (text based)
  { name: "Urine Protein", unit: "", category: "Urine", text: true },
  { name: "Urine Sugar", unit: "", category: "Urine", text: true },
  { name: "Urine — Protein", unit: "", category: "Urine", text: true },
  { name: "Urine — Glucose", unit: "", category: "Urine", text: true },
  { name: "Urine — Leucocytes", unit: "", category: "Urine", text: true },
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
  { name: "HIV Status", unit: "", category: "Infectious", text: true },
  { name: "HBsAg", unit: "", category: "Infectious", text: true },
  { name: "Hepatitis B (HBsAg)", unit: "", category: "Infectious", text: true },
  { name: "VDRL/RPR (Syphilis)", unit: "", category: "Infectious", text: true },
  { name: "HCV", unit: "", category: "Infectious", text: true },
  { name: "HPV Test", unit: "", category: "Infectious", text: true },

  // Imaging
  { name: "Early U/S (<24wks)", unit: "", category: "Imaging", text: true },
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
  // Urine — Protein (Nil / Trace / +1 / +2 / +3)
  if (name === "Urine Protein" || name === "Urine — Protein") return [
    "Nil", "Trace", "+1", "+2", "+3",
  ];
  // Urine — Glucose (Nil / Trace / + / ++)
  if (name === "Urine Sugar" || name === "Urine — Glucose") return [
    "Nil", "Trace", "+", "++",
  ];
  // Urine — Leucocytes (Neg / Pos)
  if (name === "Urine — Leucocytes") return ["Negative", "Positive"];

  // Blood Group — A/B/AB/O
  if (name === "Blood Group") return ["A", "B", "AB", "O"];
  if (name === "Blood Group & Rh") return BLOOD_GROUPS;

  // Rhesus Factor — Pos/Neg
  if (name === "Rhesus Factor") return ["Rh+", "Rh−"];

  // HIV Status — Neg/Pos/Unknown
  if (name === "HIV Status" || name === "HIV (1 & 2)") return ["Negative", "Positive", "Unknown"];

  // VDRL/RPR — Reactive/Non-Reactive
  if (name === "VDRL/RPR (Syphilis)") return ["Non-Reactive", "Reactive"];

  // Hepatitis B — Pos/Neg
  if (name === "Hepatitis B (HBsAg)" || name === "HBsAg") return ["Negative", "Positive"];

  // HPV Test — Pos/Neg/Not done
  if (name === "HPV Test") return ["Negative", "Positive", "Not done"];

  // HCV
  if (name === "HCV") return ["Negative", "Positive"];

  // Early U/S (<24wks)
  if (name === "Early U/S (<24wks)") return ["Normal singleton", "Anomaly", "Multiple", "Not yet done"];
  if (["Ultrasound (Dating)", "Anomaly Scan", "Growth Scan", "Doppler Study"].includes(name)) return ["Normal", "Abnormal Findings"];

  return null;
}

/**
 * Returns three-tier risk status: "normal" | "moderate" | "abnormal" | "pending"
 * Per the ANC Visit 1 specification:
 *   normal   = green (no concern)
 *   moderate = amber (needs monitoring)
 *   abnormal = red   (high risk, needs action)
 */
export function autoLabStatus(name, value) {
  const meta = getLabMeta(name);

  // No value entered
  if (value === undefined || value === null || value === "") return "pending";
  if (!meta) return "pending";

  const v = String(value).toLowerCase().trim();

  // ─── Per-test CUSTOM three-tier rules ──────────────────────────

  // Haemoglobin: Normal ≥11.0, Moderate 8.0–10.9, High Risk <8.0
  if (name === "Haemoglobin") {
    const num = parseFloat(value);
    if (isNaN(num)) return "pending";
    if (num < 8.0) return "abnormal";
    if (num < 11.0) return "moderate";
    return "normal";
  }

  // Blood Group: Always Normal
  if (name === "Blood Group" || name === "Blood Group & Rh") return "normal";

  // Rhesus Factor: Normal Rh+, High Risk Rh−
  if (name === "Rhesus Factor") {
    if (v.includes("rh−") || v.includes("rh-") || v === "negative" || v === "neg") return "abnormal";
    return "normal";
  }

  // HIV Status: Normal Negative, Moderate Unknown, High Risk Positive
  if (name === "HIV Status" || name === "HIV (1 & 2)") {
    if (v === "positive" || v.includes("positive")) return "abnormal";
    if (v === "unknown") return "moderate";
    return "normal";
  }

  // VDRL/RPR: Normal Non-Reactive, High Risk Reactive
  if (name === "VDRL/RPR (Syphilis)") {
    if (v === "reactive" || v.includes("reactive") && !v.includes("non")) return "abnormal";
    return "normal";
  }

  // Hepatitis B: Normal Negative, High Risk Positive
  if (name === "Hepatitis B (HBsAg)" || name === "HBsAg") {
    if (v === "positive" || v.includes("positive")) return "abnormal";
    return "normal";
  }

  // HPV Test: Normal Negative, Moderate Not done, High Risk Positive
  if (name === "HPV Test") {
    if (v === "positive" || v.includes("positive")) return "abnormal";
    if (v === "not done" || v.includes("not done")) return "moderate";
    return "normal";
  }

  // Blood Glucose (RBS) mmol/L: Normal 3.9–6.9, Moderate 7.0–7.7, High Risk ≥7.8
  if (name === "Blood Glucose (RBS)") {
    const num = parseFloat(value);
    if (isNaN(num)) return "pending";
    if (num >= 7.8) return "abnormal";
    if (num >= 7.0) return "moderate";
    if (num < 3.9) return "abnormal";
    return "normal";
  }

  // Urine — Protein: Normal Nil, Moderate Trace/+1, High Risk +2/+3
  if (name === "Urine — Protein" || name === "Urine Protein") {
    if (v === "nil" || v === "negative") return "normal";
    if (v === "trace" || v === "+1") return "moderate";
    if (v === "+2" || v === "+3" || v.includes("+++") || v.includes("++")) return "abnormal";
    return "normal";
  }

  // Urine — Glucose: Normal Nil, Moderate Trace, High Risk + or ++
  if (name === "Urine — Glucose" || name === "Urine Sugar") {
    if (v === "nil" || v === "negative") return "normal";
    if (v === "trace") return "moderate";
    if (v === "+" || v === "++" || v.includes("+")) return "abnormal";
    return "normal";
  }

  // Urine — Leucocytes: Normal Negative, High Risk Positive
  if (name === "Urine — Leucocytes") {
    if (v === "positive" || v.includes("positive")) return "abnormal";
    return "normal";
  }

  // Early U/S (<24wks): Normal singleton, Moderate Not yet done, High Risk Anomaly/Multiple
  if (name === "Early U/S (<24wks)") {
    if (v.includes("anomaly") || v.includes("multiple") || v.includes("abnormal")) return "abnormal";
    if (v.includes("not yet done") || v.includes("not done")) return "moderate";
    return "normal";
  }

  // HCV
  if (name === "HCV") {
    if (v === "positive" || v.includes("positive")) return "abnormal";
    return "normal";
  }

  // ─── Generic TEXT tests fallback ──────────────────────────────
  if (meta.text) {
    if (v.includes("positive") || v.includes("reactive") || v.includes("detected") || v.includes("abnormal")) return "abnormal";
    if (v.includes("negative") || v.includes("normal") || v.includes("non-reactive") || v === "none" || v === "nil") return "normal";
    return "normal";
  }

  // ─── Generic NUMERIC tests fallback ───────────────────────────
  const num = parseFloat(value);
  if (isNaN(num)) return "pending";
  if (meta.low !== null && num < meta.low) return "abnormal";
  if (meta.high !== null && num > meta.high) return "abnormal";
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

/* ─── Delivery risk assessment helpers ───────────────────────────── */

/**
 * Baby birth weight risk classification.
 * Returns { level: 'high'|'moderate'|'normal', label: string }
 */
export function birthWeightRisk(weightKg) {
  const w = parseFloat(weightKg);
  if (isNaN(w) || w <= 0) return null;
  if (w < 1)   return { level: "high",     label: "Extremely Low Birth Weight (< 1 kg)" };
  if (w < 1.5) return { level: "high",     label: "Very Low Birth Weight (1 – 1.5 kg)" };
  if (w < 2.5) return { level: "moderate", label: "Low Birth Weight (1.5 – 2.5 kg)" };
  if (w <= 4)  return { level: "normal",   label: "Normal Birth Weight (2.5 – 4 kg)" };
  return { level: "moderate", label: "Macrosomia / High Birth Weight (> 4 kg)" };
}

/**
 * APGAR score risk classification (for 1 min, 5 min, or discharge).
 * Returns { level: 'high'|'moderate'|'normal', label: string }
 */
export function apgarRisk(score) {
  const s = parseInt(score, 10);
  if (isNaN(s) || s < 0 || s > 10) return null;
  if (s <= 3) return { level: "high",     label: "Severe distress (0 – 3)" };
  if (s <= 6) return { level: "moderate", label: "Moderate distress (4 – 6)" };
  return { level: "normal", label: "Healthy (7 – 10)" };
}

/**
 * Labour duration risk by stage, considering primigravida vs multigravida.
 * @param {number} stage - 1, 2, or 3
 * @param {number|string} duration - for stage 1 (hours), for stage 2/3 (minutes)
 * @param {boolean} isPrimigravida - true if no previous births (para === 0)
 * Returns { level: 'high'|'moderate'|'normal', label: string } or null
 */
export function labourDurationRisk(stage, duration, isPrimigravida) {
  const val = parseFloat(duration);
  if (isNaN(val) || val < 0) return null;

  if (stage === 1) {
    // Stage 1 – Cervical Dilatation (input is in hours)
    const hrs = val;
    if (isPrimigravida) {
      if (hrs > 20) return { level: "high",     label: `Stage 1: ${hrs.toFixed(1)}h — Prolonged (> 20h, Primigravida)` };
      if (hrs > 12) return { level: "moderate", label: `Stage 1: ${hrs.toFixed(1)}h — Extended (12–20h, Primigravida)` };
      if (hrs >= 8) return { level: "normal",   label: `Stage 1: ${hrs.toFixed(1)}h — Normal (8–12h, Primigravida)` };
      return { level: "normal", label: `Stage 1: ${hrs.toFixed(1)}h — Within range (Primigravida)` };
    } else {
      if (hrs > 14) return { level: "high",     label: `Stage 1: ${hrs.toFixed(1)}h — Prolonged (> 14h, Multigravida)` };
      if (hrs > 8)  return { level: "moderate", label: `Stage 1: ${hrs.toFixed(1)}h — Extended (8–14h, Multigravida)` };
      if (hrs >= 5) return { level: "normal",   label: `Stage 1: ${hrs.toFixed(1)}h — Normal (5–8h, Multigravida)` };
      return { level: "normal", label: `Stage 1: ${hrs.toFixed(1)}h — Within range (Multigravida)` };
    }
  }

  const mins = val;
  if (stage === 2) {
    // Stage 2 – Baby Delivery
    if (isPrimigravida) {
      if (mins > 180) return { level: "high",     label: `Stage 2: ${mins} min — Prolonged (> 3h, Primigravida)` };
      if (mins > 120) return { level: "moderate", label: `Stage 2: ${mins} min — Extended (2–3h, Primigravida)` };
      if (mins >= 30) return { level: "normal",   label: `Stage 2: ${mins} min — Normal (30min–2h, Primigravida)` };
      return { level: "normal", label: `Stage 2: ${mins} min — Within range (Primigravida)` };
    } else {
      if (mins > 120) return { level: "high",     label: `Stage 2: ${mins} min — Prolonged (> 2h, Multigravida)` };
      if (mins > 60)  return { level: "moderate", label: `Stage 2: ${mins} min — Extended (1–2h, Multigravida)` };
      if (mins >= 5)  return { level: "normal",   label: `Stage 2: ${mins} min — Normal (5–60min, Multigravida)` };
      return { level: "normal", label: `Stage 2: ${mins} min — Within range (Multigravida)` };
    }
  }

  if (stage === 3) {
    // Stage 3 – Placenta Delivery (same for both)
    if (mins > 60) return { level: "high",     label: `Stage 3: ${mins} min — Prolonged (> 60 min)` };
    if (mins > 30) return { level: "moderate", label: `Stage 3: ${mins} min — Extended (30–60 min)` };
    if (mins >= 5) return { level: "normal",   label: `Stage 3: ${mins} min — Normal (5–30 min)` };
    return { level: "normal", label: `Stage 3: ${mins} min — Within range` };
  }

  return null;
}

