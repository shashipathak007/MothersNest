import { createContext, useReducer } from "react";

const SEED = [
  {
    id: "MN-003",
    // Personal
    name: "Priya Sharma", age: 28, phone: "9876543210",
    address: "Dhangadhi 5, Kailalis",
    bloodGroup: "B−", religion: "Hindu", ethnicity: "Brahmin",
    education: "Graduate", occupation: "Teacher",
    weight: "58", height: "158",
    // Partner
    partner: { name: "Rahul Sharma", age: 32, phone: "9876500000", occupation: "Engineer", education: "Post Graduate" },
    // Basic medical (registration)
    basicMedical: { prevCS: true, diabetes: false, highBP: false, thyroid: false },
    allergies: "Penicillin",
    // Pregnancy
    gravida: 2, para: 1, lmp: "2024-09-07", edd: "2025-06-14", ga: "28+4",
    // Risk
    tags: ["Rh Negative"],
    riskLevel: "high",
    registeredOn: "2025-01-10",
    // First visit (completed)
    firstVisit: {
      completed: true,
      completedOn: "2025-01-10",
      presentingComplaints: "Routine ANC booking. No active complaints.",
      historyOfComplaints: "First pregnancy ended by LSCS in 2022 due to failure to progress. GDM diagnosed at 26 weeks managed with diet. No complications postpartum.",
      reviewOfSystems: { pvBleeding: false, pvDischarge: false, pelvicPain: false, dysmenorrhea: false, dyspareunia: false, fetalMovements: false, contractions: false, headache: false, visualDisturbance: false, epigastricPain: false, oedema: false },
      menstrualHistory: { cycleNature: "Regular 28-day cycles, 5 days flow", lmp: "2024-09-07", regularCycles: true },
      obstetricHistory: {
        prevCS: true, prevPPH: false, prevPreterm: false, prevStillbirth: false,
        prevEclampsia: false, prevGDM: true, prevNeonatalDeath: false,
        prevCongenitalAnomaly: false, prevForceps: false, prevAbortion2Plus: false, prevSevereAnaemia: false,
        detailedHistory: "G2P1L1 | 1st delivery: LSCS 2022 (Failure to Progress) | Baby 3.1 kg, healthy | No PPH | GDM diagnosed at 26 wks, managed with diet",
        previousPregnancies: [
          { year: "2022", ancAttended: true, placeOfDelivery: "Hospital", ga: "39 weeks", typeOfLabour: "Induced", modeOfDelivery: "LSCS", indication: "Failure to Progress", complications: "GDM", babyWeight: "3.1 kg", apgar: "8/9", babySex: "Male", babyComplications: "None" }
        ],
      },
      medicalHistory: {
        asthma: false, epilepsy: false, hypertension: false, heartDisease: false,
        diabetes: true, diabetesType: "GDM", sle: false, sickleCell: false,
        hiv: false, hepatitisB: false, hepatitisC: false, tb: false,
        thyroid: false, kidneyLiver: false, cysticFibrosis: false, other: "",
      },
      treatmentHistory: { prevAdmission: "LSCS 2022", bloodTransfusion: false, drugAllergy: "Penicillin", tetanusImmunised: true, rhImmunoglobulin: false, currentMedications: "" },
      surgicalHistory: "LSCS 2022",
      familyHistory: { diabetes: true, hypertension: true, geneticDisorder: false, cancers: false, chronicInfections: false, psychiatricIllness: false, details: "Mother — Type 2 DM. Father — Hypertension." },
      socialHistory: { employment: "Teacher", homeCircumstances: "Stable", financialCondition: "Good", domesticViolence: false, maritalStatus: "Married" },
      personalHistory: { smoking: false, alcohol: false, drugs: false, prenatalCare: true },
      contraceptiveHistory: "OCP used for 1 year before conception",
      nutritionalHistory: { dietType: "Non-vegetarian", foodTaboos: "None" },
      gynaecologicalHistory: "No previous gynaecological problems",
      stiHistory: "No known STI. HIV negative.",
      gbvScreening: "No concerns disclosed. Counselled.",
      examination: { generalCondition: "Good", bp: "118/76", pulse: "78", weight: "58", height: "158", bmi: "23.2", breastExam: "Normal", abdominalExam: "Uterus 20 weeks size", fundalHeight: "20", pelvicExam: "Not done" },
      summary: "Priya Sharma, 28 years, G2P1L1, 18+6 weeks gestation. Previous LSCS 2022 (failure to progress). GDM in previous pregnancy. Rh negative. Penicillin allergy. High risk pregnancy.",
      autoRisk: "high",
    },
    visits: [
      { id: "v1a", date: "2025-03-07", type: "ANC 4th Visit (28 wks)", ancContact: 4, ga: "28+4", bp: "144/94", weight: "63.5", height: "", fetalHR: "144", fundal: "28", findings: "BP elevated. Hb 9.6. FBS 134 mg/dL. Pedal oedema +.", plan: "Iron IV started. OGTT ordered. Review in 2 weeks.", bpFlag: "high", fhrFlag: null },
      { id: "v1b", date: "2025-01-10", type: "ANC 1st Visit (≤12 weeks)", ancContact: 1, ga: "18+6", bp: "118/76", weight: "58.0", height: "158", fetalHR: "148", fundal: "20", findings: "Booked. All baseline investigations sent.", plan: "Folic acid started. GDM counselling done.", bpFlag: null, fhrFlag: null },
    ],
    labs: [
      { id: "l1a", test: "Haemoglobin", date: "2025-03-07", value: "9.6", unit: "g/dL", status: "abnormal" },
      { id: "l1b", test: "Fasting Blood Sugar", date: "2025-03-07", value: "134", unit: "mg/dL", status: "abnormal" },
      { id: "l1d", test: "Blood Group & Rh", date: "2025-01-10", value: "B Rh−", unit: "", status: "normal" },
      { id: "l1e", test: "TSH", date: "2025-01-10", value: "2.4", unit: "mIU/L", status: "normal" },
      { id: "l1f", test: "OGTT 75g (Fasting)", date: "", value: "", unit: "mg/dL", status: "pending" },
      { id: "l1g", test: "HIV (1 & 2)", date: "2025-01-10", value: "Non-reactive", unit: "", status: "normal" },
    ],
  },
  {
    id: "MN-002",
    name: "Meena Khadka", age: 32, phone: "9123456789",
    address: "Dhangadhi 2, Kailali",
    bloodGroup: "A+", religion: "Hindu", ethnicity: "Chettri",
    education: "Higher Secondary (11–12)", occupation: "Homemaker",
    weight: "64", height: "160",
    partner: { name: "Arun Khadka", age: 35, phone: "9123400000", occupation: "Business", education: "Graduate" },
    basicMedical: {},
    allergies: "",
    gravida: 1, para: 0, lmp: "2024-07-13", edd: "2025-04-20", ga: "34+2",
    tags: ["PIH"], riskLevel: "moderate", registeredOn: "2025-01-01",
    firstVisit: {
      completed: true,
      completedOn: "2025-01-01",
      presentingComplaints: "Routine booking ANC. No complaints.",
      historyOfComplaints: "",
      reviewOfSystems: { pvBleeding: false, pvDischarge: false, pelvicPain: false, dysmenorrhea: false, dyspareunia: false, fetalMovements: false, contractions: false, headache: false, visualDisturbance: false, epigastricPain: false, oedema: false },
      menstrualHistory: { cycleNature: "Regular 30-day cycles", lmp: "2024-07-13", regularCycles: true },
      obstetricHistory: {
        prevCS: false, prevPPH: false, prevPreterm: false, prevStillbirth: false,
        prevEclampsia: false, prevGDM: false, prevNeonatalDeath: false,
        prevCongenitalAnomaly: false, prevForceps: false, prevAbortion2Plus: false, prevSevereAnaemia: false,
        detailedHistory: "G1P0 — Primigravida. No prior obstetric history.",
        previousPregnancies: [],
      },
      medicalHistory: {
        asthma: false, epilepsy: false, hypertension: false, heartDisease: false,
        diabetes: false, sle: false, sickleCell: false,
        hiv: false, hepatitisB: false, hepatitisC: false, tb: false,
        thyroid: false, kidneyLiver: false, cysticFibrosis: false, other: "",
      },
      treatmentHistory: { prevAdmission: "", bloodTransfusion: false, drugAllergy: "", tetanusImmunised: false, rhImmunoglobulin: false, currentMedications: "" },
      surgicalHistory: "Nil",
      familyHistory: { diabetes: false, hypertension: true, geneticDisorder: false, cancers: false, chronicInfections: false, psychiatricIllness: false, details: "Father — Hypertension." },
      socialHistory: { employment: "Homemaker", homeCircumstances: "Stable", financialCondition: "Moderate", domesticViolence: false, maritalStatus: "Married" },
      personalHistory: { smoking: false, alcohol: false, drugs: false, prenatalCare: true },
      contraceptiveHistory: "None",
      nutritionalHistory: { dietType: "Non-vegetarian", foodTaboos: "None" },
      gynaecologicalHistory: "No previous problems",
      stiHistory: "HIV negative.",
      gbvScreening: "No concerns.",
      examination: { generalCondition: "Good", bp: "120/78", pulse: "76", weight: "64", height: "160", bmi: "25.0", breastExam: "Normal", abdominalExam: "Normal", fundalHeight: "", pelvicExam: "Not done" },
      summary: "Meena Khadka, 32 years, G1P0, 18+0 weeks gestation. Primigravida. Family history of hypertension. Low risk pregnancy.",
      autoRisk: "low",
    },
    visits: [
      { id: "v2a", date: "2025-03-01", type: "ANC 5th Visit (32 wks)", ancContact: 5, ga: "34+2", bp: "142/90", weight: "70.2", height: "", fetalHR: "148", fundal: "34", findings: "BP elevated. Uric acid raised. Growth on track.", plan: "Labetalol increased. Growth scan ordered.", bpFlag: "high", fhrFlag: null },
      { id: "v2b", date: "2025-01-01", type: "ANC 1st Visit (≤12 weeks)", ancContact: 1, ga: "18+0", bp: "120/78", weight: "64.0", height: "160", fetalHR: "144", fundal: "", findings: "Booked. Baseline investigations normal.", plan: "Routine supplementation started.", bpFlag: null, fhrFlag: null },
    ],
    labs: [
      { id: "l2a", test: "Haemoglobin", date: "2025-03-01", value: "10.6", unit: "g/dL", status: "abnormal" },
      { id: "l2b", test: "Blood Group & Rh", date: "2025-01-01", value: "A+", unit: "", status: "normal" },
      { id: "l2c", test: "Growth Scan", date: "", value: "", unit: "", status: "pending" },
    ],
  },
  {
    id: "MN-001",
    name: "Lakshmi Chaudhary", age: 24, phone: "9988776655",
    address: "Dhangadhi 1, Kailali",
    bloodGroup: "O+", religion: "Hindu", ethnicity: "Janajati",
    education: "Secondary (9–10)", occupation: "Farmer",
    weight: "52", height: "155",
    partner: { name: "Suresh Kumar", age: 26, phone: "9988700000", occupation: "Farmer", education: "Secondary (9–10)" },
    basicMedical: {},
    allergies: "",
    gravida: 1, para: 0, lmp: "2024-11-23", edd: "2025-08-30", ga: "16+0",
    tags: [], riskLevel: "low", registeredOn: "2025-01-15",
    firstVisit: null,
    visits: [
      { id: "v3a", date: "2025-01-15", type: "ANC 1st Visit (≤12 weeks)", ancContact: 1, ga: "11+2", bp: "112/72", weight: "52.0", height: "155", fetalHR: "156", fundal: "", findings: "Booked. Baseline investigations sent.", plan: "Routine supplementation.", bpFlag: null, fhrFlag: null },
    ],
    labs: [
      { id: "l3a", test: "Haemoglobin", date: "2025-01-15", value: "11.8", unit: "g/dL", status: "normal" },
      { id: "l3b", test: "Blood Group & Rh", date: "2025-01-15", value: "O+", unit: "", status: "normal" },
      { id: "l3c", test: "OGTT 75g (Fasting)", date: "", value: "", unit: "mg/dL", status: "pending" },
    ],
  },
];

function reducer(state, action) {
  switch (action.type) {
    case "ADD_PATIENT":
      return { ...state, patients: [action.payload, ...state.patients] };
    case "ADD_VISIT":
      return {
        ...state, patients: state.patients.map(p =>
          p.id === action.patientId ? { ...p, visits: [action.payload, ...p.visits] } : p
        )
      };
    case "ADD_LAB":
      return {
        ...state, patients: state.patients.map(p =>
          p.id === action.patientId ? { ...p, labs: [action.payload, ...p.labs] } : p
        )
      };
    case "SAVE_FIRST_VISIT":
      return {
        ...state, patients: state.patients.map(p =>
          p.id === action.patientId ? { ...p, firstVisit: action.payload, riskLevel: action.payload.autoRisk || p.riskLevel } : p
        )
      };
    default: return state;
  }
}

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, { patients: SEED });
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}
