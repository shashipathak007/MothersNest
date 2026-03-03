import { createContext, useReducer } from "react";
import { computeOverallRisk } from "../utils/helpers.js";


const SEED = [
  {
    id: "MN-007",
    name: "Sita Thapa", age: 38, phone: "9812344556",
    address: "Dhangadhi 3, Kailali",
    bloodGroup: "AB+", religion: "Hindu", ethnicity: "Magar",
    education: "Post Graduate", occupation: "Banker",
    weight: "74", height: "162",
    partner: { name: "Bishal Thapa", age: 41, occupation: "Government Official" },
    basicMedical: { thyroid: true, highBP: true, diabetes: true, prevCS: true },
    allergies: "Dust, Pollen",
    gravida: 3, para: 0,
    lmp: "2025-08-24", edd: "2026-05-31", ga: "27+0",
    // Matches MOD_RISK_TAGS
    tags: ["Thyroid", "Elderly Gravida"],
    riskLevel: "moderate",
    registeredOn: "2025-11-15",
    firstVisit: {
      completed: true,
      completedOn: "2025-11-15",
      presentingComplaints: "Known case of hypothyroidism. Feeling easily winded.",
      medicalHistory: { thyroid: true, thyroidMeds: "Levothyroxine 50mcg" },
      examination: { bp: "110/70", weight: "68", bmi: "25.9" },
      summary: "38yo G3P0. Moderate risk due to age and thyroid status.",
      autoRisk: "moderate",
    },
    visits: [
      { id: "v5-a", date: "2026-03-01", type: "ANC 4th Visit", ancContact: 4, ga: "27+0", bp: "125/82", weight: "74.0", fetalHR: "144", fundal: "27", findings: "Growth on track. TSH slightly elevated.", plan: "Increase Levothyroxine to 75mcg.", bpFlag: null },
    ],
    labs: [
      { id: "l5-a", test: "TSH", date: "2026-02-15", value: "4.8", unit: "mIU/L", status: "abnormal" },
    ],
  },
  {
    id: "MN-006",
    name: "Maya Bk", age: 19, phone: "9800011122",
    address: "Attariya, Kailali",
    bloodGroup: "O+", religion: "Hindu", ethnicity: "Dalit",
    education: "Secondary", occupation: "Laborer",
    weight: "51", height: "152",
    partner: { name: "Karan Bk", age: 21, occupation: "Driver" },
    basicMedical: {},
    allergies: "None",
    gravida: 1, para: 0,
    lmp: "2025-10-26", edd: "2026-08-02", ga: "18+0",
    // No tags from your config apply here
    tags: [],
    riskLevel: "low",
    registeredOn: "2026-01-20",
    firstVisit: {
      completed: true,
      completedOn: "2026-01-20",
      presentingComplaints: "Generalized weakness.",
      nutritionalHistory: { dietType: "Vegetarian", ironIntake: "Low" },
      examination: { bp: "100/60", weight: "48", conjunctiva: "Pale" },
      summary: "19yo primigravida. Normal risk profile based on current config.",
      autoRisk: "low",
    },
    visits: [
      { id: "v6-a", date: "2026-03-01", type: "ANC 2nd Visit", ancContact: 2, ga: "18+0", bp: "105/65", weight: "51.0", fetalHR: "155", fundal: "18", findings: "Quickening felt.", plan: "Iron supplementation and dietary counseling.", bpFlag: null },
    ],
    labs: [
      { id: "l6-a", test: "Hb", date: "2026-03-01", value: "8.9", unit: "g/dL", status: "abnormal" },
    ],
  },
  {
    id: "MN-005",
    name: "Anjali Gurung", age: 30, phone: "9844556677",
    address: "Dhangadhi 4, Kailali",
    bloodGroup: "B+", religion: "Buddhist", ethnicity: "Gurung",
    education: "Graduate", occupation: "Nurse",
    weight: "82", height: "165",
    partner: { name: "Suman Gurung", age: 33, occupation: "Army" },
    basicMedical: { diabetes: false },
    allergies: "Sulfa drugs",
    gravida: 1, para: 0,
    lmp: "2025-08-10", edd: "2026-05-17", ga: "29+0",
    // Matches HIGH_RISK_TAGS
    tags: ["Twin Pregnancy"],
    riskLevel: "high",
    registeredOn: "2025-10-15",
    firstVisit: {
      completed: true,
      completedOn: "2025-10-15",
      presentingComplaints: "Severe nausea. Ultrasound confirmed Twins.",
      examination: { bp: "120/75", weight: "72" },
      summary: "30yo primigravida. High risk due to twin gestation.",
      autoRisk: "high",
    },
    visits: [
      { id: "v7-a", date: "2026-03-01", type: "ANC 5th Visit", ancContact: 5, ga: "29+0", bp: "130/85", weight: "82.0", fetalHR: "142/148", fundal: "34", findings: "Increased pelvic pressure.", plan: "Fortnightly scans.", bpFlag: null },
    ],
    labs: [
      { id: "l7-a", test: "Anomaly Scan", date: "2025-12-28", value: "Normal anatomy", status: "normal" },
    ],
  },
  {
    id: "MN-004",
    name: "Priya Sharma", age: 28, phone: "9876543210",
    address: "Dhangadhi 5, Kailalis",
    bloodGroup: "B−", religion: "Hindu", ethnicity: "Brahmin",
    education: "Graduate", occupation: "Teacher",
    weight: "58", height: "158",
    partner: { name: "Rahul Sharma", age: 32, phone: "9876500000", occupation: "Engineer", education: "Post Graduate" },
    basicMedical: { prevCS: true, diabetes: false, highBP: false, thyroid: false },
    allergies: "Penicillin",
    gravida: 2, para: 1,
    lmp: "2025-12-21", edd: "2026-09-27", ga: "10+0", // GA: 10 Weeks
    tags: ["Rh Negative"],
    riskLevel: "high",
    registeredOn: "2026-02-10",
    firstVisit: {
      completed: true,
      completedOn: "2026-02-10",
      presentingComplaints: "Routine ANC booking.",
      historyOfComplaints: "First pregnancy ended by LSCS in 2022.",
      reviewOfSystems: { pvBleeding: false, pvDischarge: false, pelvicPain: false, dysmenorrhea: false, dyspareunia: false, fetalMovements: false, contractions: false, headache: false, visualDisturbance: false, epigastricPain: false, oedema: false },
      menstrualHistory: { cycleNature: "Regular 28-day cycles", lmp: "2025-12-21", regularCycles: true },
      obstetricHistory: {
        prevCS: true, prevPPH: false, prevPreterm: false, prevStillbirth: false,
        prevEclampsia: false, prevGDM: true, prevNeonatalDeath: false,
        prevCongenitalAnomaly: false, prevForceps: false, prevAbortion2Plus: false, prevSevereAnaemia: false,
        detailedHistory: "G2P1L1 | 1st delivery: LSCS 2022",
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
      contraceptiveHistory: "OCP used for 1 year",
      nutritionalHistory: { dietType: "Non-vegetarian", foodTaboos: "None" },
      gynaecologicalHistory: "No previous problems",
      stiHistory: "HIV negative.",
      gbvScreening: "No concerns disclosed.",
      examination: { generalCondition: "Good", bp: "118/76", pulse: "78", weight: "58", height: "158", bmi: "23.2", breastExam: "Normal", abdominalExam: "Uterus 10 weeks size", fundalHeight: "10", pelvicExam: "Not done" },
      summary: "Priya Sharma, 10 weeks gestation. High risk due to Prev CS and Rh negative.",
      autoRisk: "high",
    },
    visits: [
      { id: "v1b", date: "2026-02-10", type: "ANC 1st Visit", ancContact: 1, ga: "7+2", bp: "118/76", weight: "58.0", height: "158", fetalHR: "148", fundal: "8", findings: "Booked.", plan: "Folic acid started.", bpFlag: null, fhrFlag: null },
    ],
    labs: [
      { id: "l1d", test: "Blood Group & Rh", date: "2026-02-10", value: "B Rh−", unit: "", status: "normal" },
    ],
  },
  {
    id: "MN-003",
    name: "Meena Khadka", age: 32, phone: "9123456789",
    address: "Dhangadhi 2, Kailali",
    bloodGroup: "A+", religion: "Hindu", ethnicity: "Chettri",
    education: "Higher Secondary (11–12)", occupation: "Homemaker",
    weight: "64", height: "160",
    partner: { name: "Arun Khadka", age: 35, phone: "9123400000", occupation: "Business", education: "Graduate" },
    basicMedical: {},
    allergies: "",
    gravida: 1, para: 0,
    lmp: "2025-11-16", edd: "2026-08-23", ga: "15+0", // GA: 15 Weeks
    tags: ["PIH"], riskLevel: "moderate", registeredOn: "2026-01-01",
    firstVisit: {
      completed: true,
      completedOn: "2026-01-01",
      presentingComplaints: "Routine booking ANC.",
      historyOfComplaints: "",
      reviewOfSystems: { pvBleeding: false, pvDischarge: false, pelvicPain: false, dysmenorrhea: false, dyspareunia: false, fetalMovements: false, contractions: false, headache: false, visualDisturbance: false, epigastricPain: false, oedema: false },
      menstrualHistory: { cycleNature: "Regular 30-day cycles", lmp: "2025-11-16", regularCycles: true },
      obstetricHistory: { prevCS: false, prevPPH: false, detailedHistory: "G1P0 — Primigravida.", previousPregnancies: [] },
      medicalHistory: { asthma: false, epilepsy: false, hypertension: false, diabetes: false },
      treatmentHistory: { prevAdmission: "", drugAllergy: "", tetanusImmunised: false },
      surgicalHistory: "Nil",
      familyHistory: { diabetes: false, hypertension: true },
      socialHistory: { employment: "Homemaker", maritalStatus: "Married" },
      personalHistory: { smoking: false, alcohol: false },
      contraceptiveHistory: "None",
      nutritionalHistory: { dietType: "Non-vegetarian" },
      gynaecologicalHistory: "No previous problems",
      stiHistory: "HIV negative.",
      gbvScreening: "No concerns.",
      examination: { generalCondition: "Good", bp: "120/78", pulse: "76", weight: "64", height: "160", bmi: "25.0", fundalHeight: "" },
      summary: "Meena Khadka, 15 weeks gestation. Primigravida.",
      autoRisk: "low",
    },
    visits: [
      { id: "v2b", date: "2026-01-01", type: "ANC 1st Visit", ancContact: 1, ga: "6+4", bp: "120/78", weight: "64.0", height: "160", fetalHR: "144", fundal: "", findings: "Booked.", plan: "Routine supplements.", bpFlag: null, fhrFlag: null },
    ],
    labs: [
      { id: "l2b", test: "Blood Group & Rh", date: "2026-01-01", value: "A+", unit: "", status: "normal" },
    ],
  },
  {
    id: "MN-002",
    name: "Lakshmi Chaudhary", age: 24, phone: "9988776655",
    address: "Dhangadhi 1, Kailali",
    bloodGroup: "O+", religion: "Hindu", ethnicity: "Janajati",
    education: "Secondary (9–10)", occupation: "Farmer",
    weight: "52", height: "155",
    partner: { name: "Suresh Kumar", age: 26, phone: "9988700000", occupation: "Farmer", education: "Secondary (9–10)" },
    basicMedical: {},
    allergies: "",
    gravida: 1, para: 0,
    lmp: "2025-08-03", edd: "2026-05-10", ga: "30+0", // GA: 30 Weeks
    tags: [], riskLevel: "low", registeredOn: "2026-01-15",
    firstVisit: null,
    visits: [
      { id: "v3a", date: "2026-01-15", type: "ANC 1st Visit", ancContact: 1, ga: "23+4", bp: "112/72", weight: "52.0", height: "155", fetalHR: "156", fundal: "24", findings: "Booked late.", plan: "Routine supplementation.", bpFlag: null, fhrFlag: null },
    ],
    labs: [
      { id: "l3a", test: "Haemoglobin", date: "2026-01-15", value: "11.8", unit: "g/dL", status: "normal" },
    ],
  },
  {
    id: "MN-001",
    name: "Smiriti Shrestha", age: 32, phone: "9123456789",
    address: "Dhangadhi 2, Kailali",
    bloodGroup: "A+", religion: "Hindu", ethnicity: "Newar",
    education: "Higher Secondary (11–12)", occupation: "Homemaker",
    weight: "64", height: "160",
    partner: { name: "Arun Khadka", age: 35, phone: "9123400000", occupation: "Business", education: "Graduate" },
    basicMedical: {},
    allergies: "",
    gravida: 1, para: 0,
    lmp: "2025-06-29", edd: "2026-04-05", ga: "35+0", // GA: 35 Weeks
    tags: ["PIH"], riskLevel: "moderate", registeredOn: "2025-10-01",
    firstVisit: {
      completed: true,
      completedOn: "2025-10-01",
      presentingComplaints: "Routine booking.",
      historyOfComplaints: "",
      reviewOfSystems: { pvBleeding: false, pvDischarge: false, pelvicPain: false, contractions: false },
      menstrualHistory: { cycleNature: "Regular", lmp: "2025-06-29", regularCycles: true },
      obstetricHistory: { detailedHistory: "G1P0 — Primigravida.", previousPregnancies: [] },
      medicalHistory: { asthma: false, hypertension: false },
      treatmentHistory: { drugAllergy: "" },
      surgicalHistory: "Nil",
      familyHistory: { hypertension: true },
      socialHistory: { employment: "Homemaker", maritalStatus: "Married" },
      personalHistory: { smoking: false },
      contraceptiveHistory: "None",
      nutritionalHistory: { dietType: "Non-vegetarian" },
      gynaecologicalHistory: "No previous problems",
      stiHistory: "HIV negative.",
      gbvScreening: "No concerns.",
      examination: { generalCondition: "Good", bp: "120/78", pulse: "76", bmi: "25.0" },
      summary: "Smiriti, 35 weeks gestation. Monitoring for PIH.",
      autoRisk: "low",
    },
    visits: [
      { id: "v2a", date: "2026-02-20", type: "ANC 6th Visit", ancContact: 6, ga: "33+5", bp: "142/90", weight: "70.2", fetalHR: "148", fundal: "34", findings: "BP elevated.", plan: "Labetalol started.", bpFlag: "high", fhrFlag: null },
    ],
    labs: [
      { id: "l2a", test: "Haemoglobin", date: "2026-02-20", value: "10.6", unit: "g/dL", status: "abnormal" },
    ],
  },

];

function reducer(state, action) {
  switch (action.type) {
    case "ADD_PATIENT": {
      const newP = { ...action.payload };
      newP.riskLevel = computeOverallRisk(newP);
      return { ...state, patients: [newP, ...state.patients] };
    }
    case "ADD_VISIT":
      return {
        ...state, patients: state.patients.map(p => {
          if (p.id === action.patientId) {
            const updatedP = {
              ...p,
              weight: action.payload.weight || p.weight,
              height: action.payload.height || p.height,
              bmi: action.payload.bmi || p.bmi,
              visits: [action.payload, ...p.visits]
            };
            updatedP.riskLevel = computeOverallRisk(updatedP);
            return updatedP;
          }
          return p;
        })
      };
    case "ADD_LAB":
      return {
        ...state, patients: state.patients.map(p => {
          if (p.id === action.patientId) {
            const updatedP = { ...p, labs: [action.payload, ...p.labs] };
            updatedP.riskLevel = computeOverallRisk(updatedP);
            return updatedP;
          }
          return p;
        })
      };
    case "SAVE_FIRST_VISIT":
      return {
        ...state, patients: state.patients.map(p => {
          if (p.id === action.patientId) {
            const updatedP = {
              ...p,
              firstVisit: action.payload,
              weight: action.payload.examination?.weight || p.weight,
              height: action.payload.examination?.height || p.height,
              bmi: action.payload.examination?.bmi || p.bmi,
            };
            updatedP.riskLevel = computeOverallRisk(updatedP);
            return updatedP;
          }
          return p;
        })
      };
    default: return state;
  }
}

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, { patients: SEED });
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}