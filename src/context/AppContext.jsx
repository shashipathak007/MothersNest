import { createContext, useReducer } from "react";
import { computeOverallRisk, calcGA } from "../utils/helpers.js";


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
    lmp: "2025-08-24", edd: "2026-05-31", ga: "28+0",
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
    lmp: "2025-10-26", edd: "2026-08-02", ga: "19+0",
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
    lmp: "2025-08-10", edd: "2026-05-17", ga: "29+4",
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
    bloodGroup: "B+", religion: "Hindu", ethnicity: "Brahmin",
    education: "Graduate", occupation: "Teacher",
    weight: "58", height: "158",
    partner: { name: "Rahul Sharma", age: 32, phone: "9876500000", occupation: "Engineer", education: "Post Graduate" },
    basicMedical: { prevCS: true, diabetes: false, highBP: false, thyroid: false },
    allergies: "Penicillin",
    gravida: 2, para: 1,
    lmp: "2025-12-21", edd: "2026-09-27", ga: "11+0",
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
    lmp: "2025-11-16", edd: "2026-08-23", ga: "16+0",
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
    lmp: "2025-08-03", edd: "2026-05-10", ga: "31+0",
    tags: [], riskLevel: "low", registeredOn: "2026-01-15",
    firstVisit: null,
    visits: [
      { id: "v3a", date: "2026-01-15", type: "ANC 1st Visit", ancContact: 1, ga: "23+4", bp: "112/72", weight: "52.0", height: "155", fetalHR: "156", fundal: "24", findings: "Booked late.", plan: "Routine supplementation.", bpFlag: null, fhrFlag: null },
      { id: "v3b", date: "2026-02-12", type: "ANC 2nd Visit (16 weeks)", ancContact: 2, ga: "27+4", bp: "110/70", weight: "53.5", fetalHR: "152", fundal: "27", findings: "Active fetal movements.", plan: "Second dose TT given.", bpFlag: null, fhrFlag: null },
      { id: "v3c", date: "2026-03-05", type: "ANC 3rd Visit (24 weeks)", ancContact: 3, ga: "30+4", bp: "114/72", weight: "55.0", fetalHR: "148", fundal: "30", findings: "Normal growth.", plan: "Birth preparedness counseling.", bpFlag: null, fhrFlag: null },
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
    lmp: "2025-06-29", edd: "2026-04-05", ga: "36+0",
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
      { id: "v1-5", date: "2026-01-15", type: "ANC 5th Visit (32 weeks)", ancContact: 5, ga: "28+3", bp: "128/82", weight: "69.0", fetalHR: "142", fundal: "28", findings: "Normal growth.", plan: "Continue supplements.", bpFlag: null, fhrFlag: null },
      { id: "v1-4", date: "2025-12-10", type: "ANC 4th Visit (28 weeks)", ancContact: 4, ga: "23+2", bp: "124/80", weight: "67.5", fetalHR: "146", fundal: "23", findings: "Active fetal movements.", plan: "Routine monitoring.", bpFlag: null, fhrFlag: null },
      { id: "v1-3", date: "2025-11-05", type: "ANC 3rd Visit (24 weeks)", ancContact: 3, ga: "18+2", bp: "122/78", weight: "66.0", fetalHR: "144", fundal: "18", findings: "Anomaly scan reviewed. Normal.", plan: "Calcium added.", bpFlag: null, fhrFlag: null },
      { id: "v1-2", date: "2025-09-30", type: "ANC 2nd Visit (16 weeks)", ancContact: 2, ga: "13+1", bp: "120/78", weight: "64.5", fetalHR: "150", fundal: "-", findings: "Normal early pregnancy.", plan: "Iron/Folic acid.", bpFlag: null, fhrFlag: null },
    ],
    labs: [
      { id: "l2a", test: "Haemoglobin", date: "2026-02-20", value: "10.6", unit: "g/dL", status: "abnormal" },
    ],
  },

];

const POSTNATAL_SEED = [
  {
    id: "PN-001", name: "Gita Adhikari", age: 27, phone: "9801234567", address: "Dhangadhi 6, Kailali",
    bloodGroup: "A+", religion: "Hindu", ethnicity: "Chhetri", education: "Higher Secondary (11–12)", occupation: "Homemaker",
    weight: "65", height: "158", gravida: 2, para: 2,
    lmp: "2025-05-15", edd: "2026-02-19", ga: "42+0",
    deliveryDate: "2026-02-20", deliveryTime: "14:30", deliveryMode: "SVD (Spontaneous Vaginal Delivery)", durationOfLabor: "8 hours", maternalComplications: "None", episiotomy: "Yes",
    babySex: "Male", birthWeight: "3.2", apgar1: "8", apgar5: "9", babyStatus: "Stable", feedingMethod: "Breastfeeding", bfedInitiated: "Yes",
    dischargeDate: "2026-02-21", followUpDate: "2026-03-20", familyPlanningCounseling: "Done", signsExplained: "Yes", immunization: { bcg: true, opv: true, hepB: true },
    riskStatus: "low", riskLevel: "low", registeredOn: "2025-08-10", patientType: "postnatal",
    tags: [], basicMedical: {},
    partner: { name: "Ramesh Adhikari", age: 30, occupation: "Business" }, allergies: "",
    firstVisit: {
      completed: true, completedOn: "2025-08-10",
      menstrualHistory: { cycleNature: "Regular 28-day", lmp: "2025-05-15", regularCycles: true },
      obstetricHistory: {
        prevCS: false, prevPPH: false, detailedHistory: "G2P1L1. First delivery SVD 2023.", previousPregnancies: [
          { year: "2023", ancAttended: true, placeOfDelivery: "Hospital", ga: "39 weeks", typeOfLabour: "Spontaneous", modeOfDelivery: "SVD (Normal)", complications: "None", babyWeight: "3.0 kg", apgar: "8/9", babySex: "Female", babyComplications: "None" }
        ]
      },
      medicalHistory: { asthma: false, hypertension: false, diabetes: false, thyroid: false },
      treatmentHistory: { drugAllergy: "", tetanusImmunised: true },
      familyHistory: { diabetes: false, hypertension: false },
      socialHistory: { employment: "Homemaker", maritalStatus: "Married" },
      personalHistory: { smoking: false, alcohol: false },
      examination: { generalCondition: "Good", bp: "118/74", pulse: "76", weight: "58", height: "158", bmi: "23.2" },
      summary: "27yo G2P1. Normal pregnancy. Low risk.", autoRisk: "low",
    },
    visits: [
      { id: "pv1-1", date: "2025-12-15", type: "ANC 5th Visit (32 weeks)", ancContact: 5, ga: "30+4", bp: "116/72", weight: "62.0", fetalHR: "142", fundal: "30", findings: "Normal growth.", plan: "Continue supplements.", bpFlag: null, fhrFlag: null },
      { id: "pv1-2", date: "2026-01-20", type: "ANC 7th Visit (36 weeks)", ancContact: 7, ga: "35+5", bp: "120/78", weight: "64.0", fetalHR: "148", fundal: "35", findings: "Vertex. Engaged.", plan: "Await spontaneous labour.", bpFlag: null, fhrFlag: null },
    ],
    labs: [
      { id: "pl1-1", test: "Haemoglobin", date: "2025-08-10", value: "12.2", unit: "g/dL", status: "normal" },
      { id: "pl1-2", test: "Blood Group & Rh", date: "2025-08-10", value: "A+", unit: "", status: "normal" },
    ],
  },
  {
    id: "PN-002", name: "Sarita Bhandari", age: 31, phone: "9812345678", address: "Dhangadhi 3, Kailali",
    bloodGroup: "B+", religion: "Hindu", ethnicity: "Brahmin", education: "Graduate", occupation: "Teacher",
    weight: "72", height: "160", gravida: 3, para: 3,
    lmp: "2025-05-10", edd: "2026-02-14", ga: "43+0",
    deliveryDate: "2026-02-15", deliveryTime: "09:15", deliveryMode: "LSCS (Cesarean Section)", durationOfLabor: "12 hours", maternalComplications: "Postpartum hemorrhage", episiotomy: "No",
    babySex: "Female", birthWeight: "2.9", apgar1: "7", apgar5: "9", babyStatus: "Stable", feedingMethod: "Mixed", bfedInitiated: "Yes",
    dischargeDate: "2026-02-19", followUpDate: "2026-03-15", familyPlanningCounseling: "Done", signsExplained: "Yes", immunization: { bcg: true, opv: true, hepB: true },
    riskStatus: "high", riskLevel: "high", registeredOn: "2025-07-20", patientType: "postnatal",
    tags: ["PIH"], basicMedical: { prevCS: true, highBP: true },
    partner: { name: "Deepak Bhandari", age: 34, occupation: "Government Employee" }, allergies: "Sulfa",
    firstVisit: {
      completed: true, completedOn: "2025-07-20",
      menstrualHistory: { cycleNature: "Regular 30-day", lmp: "2025-05-10", regularCycles: true },
      obstetricHistory: {
        prevCS: true, prevPPH: false, prevPreterm: false, prevEclampsia: true, detailedHistory: "G3P2L2. 1st LSCS 2020, 2nd SVD 2022.", previousPregnancies: [
          { year: "2020", ancAttended: true, placeOfDelivery: "Hospital", ga: "38 weeks", typeOfLabour: "Induced", modeOfDelivery: "LSCS", indication: "Fetal distress", complications: "PIH", babyWeight: "2.8 kg", apgar: "7/9", babySex: "Male" },
          { year: "2022", ancAttended: true, placeOfDelivery: "Hospital", ga: "39 weeks", typeOfLabour: "Spontaneous", modeOfDelivery: "SVD (Normal)", complications: "None", babyWeight: "3.2 kg", apgar: "8/9", babySex: "Female" },
        ]
      },
      medicalHistory: { hypertension: true, diabetes: false, thyroid: false, asthma: false },
      treatmentHistory: { drugAllergy: "Sulfa", tetanusImmunised: true, bloodTransfusion: true },
      familyHistory: { hypertension: true, diabetes: true },
      socialHistory: { employment: "Teacher", maritalStatus: "Married" },
      personalHistory: { smoking: false, alcohol: false },
      examination: { generalCondition: "Good", bp: "138/88", pulse: "82", weight: "66", height: "160", bmi: "25.8" },
      summary: "31yo G3P2. High risk — Prev CS, PIH, HTN.", autoRisk: "high",
    },
    visits: [
      { id: "pv2-1", date: "2025-11-01", type: "ANC 4th Visit (28 weeks)", ancContact: 4, ga: "25+2", bp: "142/90", weight: "70.0", fetalHR: "138", fundal: "26", findings: "BP elevated. Labetalol started.", plan: "Weekly BP monitoring.", bpFlag: "high", fhrFlag: null },
      { id: "pv2-2", date: "2026-01-15", type: "ANC 7th Visit (36 weeks)", ancContact: 7, ga: "35+4", bp: "148/92", weight: "72.0", fetalHR: "144", fundal: "34", findings: "Persistent HTN. Planned LSCS.", plan: "Elective LSCS at 38 weeks.", bpFlag: "high", fhrFlag: null },
    ],
    labs: [
      { id: "pl2-1", test: "Haemoglobin", date: "2025-07-20", value: "10.2", unit: "g/dL", status: "abnormal" },
      { id: "pl2-2", test: "Blood Group & Rh", date: "2025-07-20", value: "B+", unit: "", status: "normal" },
    ],
  },
  {
    id: "PN-003", name: "Kamala Rana", age: 24, phone: "9823456789", address: "Attariya, Kailali",
    bloodGroup: "O+", religion: "Hindu", ethnicity: "Janajati", education: "Secondary (9–10)", occupation: "Farmer",
    weight: "56", height: "155", gravida: 1, para: 1,
    lmp: "2025-06-05", edd: "2026-03-12", ga: "39+3",
    deliveryDate: "2026-03-01", deliveryTime: "22:45", deliveryMode: "SVD (Spontaneous Vaginal Delivery)", durationOfLabor: "6 hours", maternalComplications: "None", episiotomy: "No",
    babySex: "Male", birthWeight: "3.0", apgar1: "9", apgar5: "10", babyStatus: "Stable", feedingMethod: "Breastfeeding", bfedInitiated: "Yes",
    dischargeDate: "2026-03-02", followUpDate: "2026-03-22", familyPlanningCounseling: "Pending", signsExplained: "Yes", immunization: { bcg: true, opv: true, hepB: true },
    riskStatus: "low", riskLevel: "low", registeredOn: "2025-09-01", patientType: "postnatal",
    tags: [], basicMedical: {},
    partner: { name: "Bikram Rana", age: 26, occupation: "Farmer" }, allergies: "",
    firstVisit: {
      completed: true, completedOn: "2025-09-01",
      menstrualHistory: { cycleNature: "Regular", lmp: "2025-06-05", regularCycles: true },
      obstetricHistory: { detailedHistory: "G1P0 — Primigravida.", previousPregnancies: [] },
      medicalHistory: { asthma: false, hypertension: false, diabetes: false },
      examination: { generalCondition: "Good", bp: "110/70", pulse: "74", weight: "50", height: "155", bmi: "20.8" },
      summary: "24yo primigravida. Low risk.", autoRisk: "low",
    },
    visits: [
      { id: "pv3-1", date: "2026-01-10", type: "ANC 5th Visit (32 weeks)", ancContact: 5, ga: "31+0", bp: "112/72", weight: "54.0", fetalHR: "148", fundal: "31", findings: "Normal.", plan: "Continue supplements.", bpFlag: null, fhrFlag: null },
    ],
    labs: [
      { id: "pl3-1", test: "Haemoglobin", date: "2025-09-01", value: "11.8", unit: "g/dL", status: "normal" },
    ],
  },
  {
    id: "PN-004", name: "Sunita Rai", age: 35, phone: "9834567890", address: "Dhangadhi 1, Kailali",
    bloodGroup: "AB−", religion: "Hindu", ethnicity: "Janajati", education: "Graduate", occupation: "Nurse",
    weight: "68", height: "162", gravida: 4, para: 3,
    lmp: "2025-05-01", edd: "2026-02-05", ga: "44+2",
    deliveryDate: "2026-02-10", deliveryTime: "11:20", deliveryMode: "Vacuum Delivery", durationOfLabor: "16 hours", maternalComplications: "Anemia", episiotomy: "Yes",
    babySex: "Female", birthWeight: "2.7", apgar1: "6", apgar5: "8", babyStatus: "NICU admitted", feedingMethod: "Formula", bfedInitiated: "No",
    dischargeDate: "2026-02-14", followUpDate: "2026-03-10", familyPlanningCounseling: "Done", signsExplained: "Yes", immunization: { bcg: false, opv: false, hepB: false },
    riskStatus: "moderate", riskLevel: "moderate", registeredOn: "2025-07-10", patientType: "postnatal",
    tags: ["Rh Negative", "Elderly Gravida"], basicMedical: {},
    partner: { name: "Sunil Rai", age: 38, occupation: "Army" }, allergies: "Penicillin",
    firstVisit: {
      completed: true, completedOn: "2025-07-10",
      menstrualHistory: { cycleNature: "Regular", lmp: "2025-05-01", regularCycles: true },
      obstetricHistory: {
        prevCS: false, prevPPH: false, detailedHistory: "G4P2L2A1.", previousPregnancies: [
          { year: "2018", placeOfDelivery: "Hospital", modeOfDelivery: "SVD (Normal)", babyWeight: "3.1 kg", babySex: "Male" },
          { year: "2021", placeOfDelivery: "Hospital", modeOfDelivery: "SVD (Normal)", babyWeight: "2.9 kg", babySex: "Female" },
        ]
      },
      medicalHistory: { asthma: false, hypertension: false, diabetes: false, thyroid: false },
      treatmentHistory: { drugAllergy: "Penicillin", rhImmunoglobulin: true },
      examination: { generalCondition: "Good", bp: "120/76", pulse: "80", weight: "62", height: "162", bmi: "23.6" },
      summary: "35yo G4P2A1. Moderate risk — Rh Negative, elderly gravida.", autoRisk: "moderate",
    },
    visits: [
      { id: "pv4-1", date: "2025-12-20", type: "ANC 6th Visit (34 weeks)", ancContact: 6, ga: "33+4", bp: "118/76", weight: "66.0", fetalHR: "140", fundal: "33", findings: "Hb 9.2 — Anaemia.", plan: "IV Iron therapy.", bpFlag: null, fhrFlag: null },
    ],
    labs: [
      { id: "pl4-1", test: "Haemoglobin", date: "2025-12-20", value: "9.2", unit: "g/dL", status: "abnormal" },
      { id: "pl4-2", test: "Blood Group & Rh", date: "2025-07-10", value: "AB Rh−", unit: "", status: "normal" },
    ],
  },
  {
    id: "PN-005", name: "Parbati Shahi", age: 22, phone: "9845678901", address: "Dhangadhi 5, Kailali",
    bloodGroup: "B+", religion: "Hindu", ethnicity: "Chhetri", education: "Lower Secondary (6–8)", occupation: "Homemaker",
    weight: "54", height: "152", gravida: 1, para: 1,
    lmp: "2025-05-28", edd: "2026-03-04", ga: "40+4",
    deliveryDate: "2026-02-25", deliveryTime: "04:10", deliveryMode: "SVD (Spontaneous Vaginal Delivery)", durationOfLabor: "9 hours", maternalComplications: "Mild preeclampsia", episiotomy: "Yes",
    babySex: "Male", birthWeight: "3.1", apgar1: "8", apgar5: "9", babyStatus: "Stable", feedingMethod: "Breastfeeding", bfedInitiated: "Yes",
    dischargeDate: "2026-02-27", followUpDate: "2026-03-18", familyPlanningCounseling: "Done", signsExplained: "Yes", immunization: { bcg: true, opv: true, hepB: true },
    riskStatus: "moderate", riskLevel: "moderate", registeredOn: "2025-08-20", patientType: "postnatal",
    tags: [], basicMedical: {},
    partner: { name: "Kumar Shahi", age: 24, occupation: "Labourer" }, allergies: "",
    firstVisit: {
      completed: true, completedOn: "2025-08-20",
      obstetricHistory: { detailedHistory: "G1P0.", previousPregnancies: [] },
      medicalHistory: { hypertension: false, diabetes: false },
      examination: { bp: "110/70", weight: "48", height: "152", bmi: "20.8" },
      summary: "22yo primigravida. Low risk at booking.", autoRisk: "low",
    },
    visits: [
      { id: "pv5-1", date: "2026-02-01", type: "ANC 7th Visit (36 weeks)", ancContact: 7, ga: "35+4", bp: "144/92", weight: "53.0", fetalHR: "150", fundal: "34", findings: "BP elevated — preeclampsia.", plan: "Admit for monitoring.", bpFlag: "high", fhrFlag: null },
    ],
    labs: [
      { id: "pl5-1", test: "Haemoglobin", date: "2025-08-20", value: "11.4", unit: "g/dL", status: "normal" },
    ],
  },
  {
    id: "PN-006", name: "Devi Basnet", age: 29, phone: "9856789012", address: "Dhangadhi 2, Kailali",
    bloodGroup: "A−", religion: "Hindu", ethnicity: "Chhetri", education: "Graduate", occupation: "Business",
    weight: "70", height: "163", gravida: 2, para: 2,
    lmp: "2025-05-25", edd: "2026-03-01", ga: "41+0",
    deliveryDate: "2026-03-03", deliveryTime: "08:45", deliveryMode: "LSCS (Cesarean Section)", durationOfLabor: "N/A", maternalComplications: "Wound infection", episiotomy: "No",
    babySex: "Male", birthWeight: "3.5", apgar1: "8", apgar5: "9", babyStatus: "Stable", feedingMethod: "Mixed", bfedInitiated: "Yes",
    dischargeDate: "2026-03-08", followUpDate: "2026-03-25", familyPlanningCounseling: "Done", signsExplained: "Yes", immunization: { bcg: true, opv: true, hepB: true },
    riskStatus: "moderate", riskLevel: "moderate", registeredOn: "2025-08-15", patientType: "postnatal",
    tags: ["Rh Negative"], basicMedical: { prevCS: true },
    partner: { name: "Hari Basnet", age: 32, occupation: "Business" }, allergies: "",
    firstVisit: {
      completed: true, completedOn: "2025-08-15",
      obstetricHistory: {
        prevCS: true, detailedHistory: "G2P1L1. 1st LSCS 2023.", previousPregnancies: [
          { year: "2023", placeOfDelivery: "Hospital", modeOfDelivery: "LSCS", indication: "Breech", babyWeight: "3.2 kg", babySex: "Male" },
        ]
      },
      medicalHistory: { hypertension: false, diabetes: false },
      examination: { bp: "116/74", weight: "64", height: "163", bmi: "24.1" },
      summary: "29yo G2P1. Moderate risk — Prev CS, Rh neg.", autoRisk: "moderate",
    },
    visits: [
      { id: "pv6-1", date: "2026-01-28", type: "ANC 7th Visit (36 weeks)", ancContact: 7, ga: "35+0", bp: "118/76", weight: "68.0", fetalHR: "146", fundal: "35", findings: "Prev scar. Planned repeat CS.", plan: "Elective LSCS at 38 weeks.", bpFlag: null, fhrFlag: null },
    ],
    labs: [
      { id: "pl6-1", test: "Blood Group & Rh", date: "2025-08-15", value: "A Rh−", unit: "", status: "normal" },
      { id: "pl6-2", test: "Indirect Coombs Test", date: "2025-12-01", value: "Negative", unit: "", status: "normal" },
    ],
  },
  {
    id: "PN-007", name: "Radha Chaudhary", age: 26, phone: "9867890123", address: "Tikapur, Kailali",
    bloodGroup: "O+", religion: "Hindu", ethnicity: "Madhesi", education: "Primary (1–5)", occupation: "Farmer",
    weight: "52", height: "150", gravida: 2, para: 1,
    lmp: "2025-06-01", edd: "2026-03-08", ga: "40+0",
    deliveryDate: "2026-02-28", deliveryTime: "18:20", deliveryMode: "SVD (Spontaneous Vaginal Delivery)", durationOfLabor: "14 hours", maternalComplications: "None", episiotomy: "Yes",
    babySex: "Female", birthWeight: "2.4", apgar1: "2", apgar5: "4", babyStatus: "Referred", feedingMethod: "—", bfedInitiated: "No",
    dischargeDate: "2026-03-01", followUpDate: "2026-03-14", familyPlanningCounseling: "Done", signsExplained: "Yes", immunization: { bcg: false, opv: false, hepB: false },
    riskStatus: "high", riskLevel: "high", registeredOn: "2025-08-01", patientType: "postnatal",
    tags: [], basicMedical: {},
    partner: { name: "Mohan Chaudhary", age: 28, occupation: "Farmer" }, allergies: "",
    firstVisit: {
      completed: true, completedOn: "2025-08-01",
      obstetricHistory: {
        prevStillbirth: false, detailedHistory: "G2P0A1.", previousPregnancies: [],
        abortions: [{ type: "Spontaneous Abortion", year: "2024", ga: "12 weeks", management: "Expectant" }]
      },
      medicalHistory: { hypertension: false, diabetes: false },
      examination: { bp: "108/68", weight: "46", height: "150", bmi: "20.4" },
      summary: "26yo G2. Previous spontaneous abortion.", autoRisk: "low",
    },
    visits: [
      { id: "pv7-1", date: "2026-02-15", type: "ANC 7th Visit (36 weeks)", ancContact: 7, ga: "36+5", bp: "110/70", weight: "51.0", fetalHR: "100", fundal: "34", findings: "Reduced fetal movement. FHR low.", plan: "Emergency admission.", bpFlag: null, fhrFlag: "bradycardia" },
    ],
    labs: [
      { id: "pl7-1", test: "Haemoglobin", date: "2025-08-01", value: "10.8", unit: "g/dL", status: "abnormal" },
    ],
  },
  {
    id: "PN-008", name: "Manju Oli", age: 33, phone: "9878901234", address: "Dhangadhi 4, Kailali",
    bloodGroup: "B−", religion: "Hindu", ethnicity: "Chhetri", education: "Graduate", occupation: "Healthcare Worker",
    weight: "74", height: "165", gravida: 3, para: 2,
    lmp: "2025-04-20", edd: "2026-01-25", ga: "46+0",
    deliveryDate: "2026-01-30", deliveryTime: "23:55", deliveryMode: "Forceps Delivery", durationOfLabor: "20 hours", maternalComplications: "PPH, Transfusion needed", episiotomy: "Yes",
    babySex: "Male", birthWeight: "2.5", apgar1: "5", apgar5: "7", babyStatus: "NICU admitted", feedingMethod: "Formula", bfedInitiated: "No",
    dischargeDate: "2026-02-05", followUpDate: "2026-03-12", familyPlanningCounseling: "Pending", signsExplained: "Yes", immunization: { bcg: false, opv: false, hepB: false },
    riskStatus: "high", riskLevel: "high", registeredOn: "2025-06-15", patientType: "postnatal",
    tags: ["Rh Negative"], basicMedical: { highBP: true },
    partner: { name: "Prakash Oli", age: 36, occupation: "Engineer" }, allergies: "NSAIDs",
    firstVisit: {
      completed: true, completedOn: "2025-06-15",
      obstetricHistory: {
        prevPPH: true, prevCS: false, detailedHistory: "G3P1L1A1. PPH in 1st delivery.", previousPregnancies: [
          { year: "2020", placeOfDelivery: "Hospital", modeOfDelivery: "SVD (Normal)", complications: "PPH", babyWeight: "2.8 kg", babySex: "Female" },
        ]
      },
      medicalHistory: { hypertension: true, diabetes: false, thyroid: false },
      treatmentHistory: { drugAllergy: "NSAIDs", bloodTransfusion: true },
      examination: { bp: "136/86", weight: "68", height: "165", bmi: "25.0" },
      summary: "33yo G3P1A1. High risk — Prev PPH, HTN, Rh neg.", autoRisk: "high",
    },
    visits: [
      { id: "pv8-1", date: "2025-12-01", type: "ANC 6th Visit (34 weeks)", ancContact: 6, ga: "32+2", bp: "140/90", weight: "72.0", fetalHR: "136", fundal: "31", findings: "BP elevated. Growth scan normal.", plan: "Labetalol. Weekly monitoring.", bpFlag: "high", fhrFlag: null },
    ],
    labs: [
      { id: "pl8-1", test: "Haemoglobin", date: "2025-06-15", value: "9.8", unit: "g/dL", status: "abnormal" },
      { id: "pl8-2", test: "Blood Group & Rh", date: "2025-06-15", value: "B Rh−", unit: "", status: "normal" },
    ],
  },
  {
    id: "PN-009", name: "Anita Tamang", age: 28, phone: "9889012345", address: "Dhangadhi 7, Kailali",
    bloodGroup: "AB+", religion: "Buddhist", ethnicity: "Janajati", education: "Higher Secondary (11–12)", occupation: "Business",
    weight: "60", height: "157", gravida: 1, para: 1,
    lmp: "2025-06-10", edd: "2026-03-17", ga: "38+5",
    deliveryDate: "2026-03-05", deliveryTime: "06:10", deliveryMode: "SVD (Spontaneous Vaginal Delivery)", durationOfLabor: "5 hours", maternalComplications: "None", episiotomy: "No",
    babySex: "Female", birthWeight: "3.3", apgar1: "9", apgar5: "10", babyStatus: "Stable", feedingMethod: "Breastfeeding", bfedInitiated: "Yes",
    dischargeDate: "2026-03-07", followUpDate: "2026-03-26", familyPlanningCounseling: "Done", signsExplained: "Yes", immunization: { bcg: true, opv: true, hepB: true },
    riskStatus: "low", riskLevel: "low", registeredOn: "2025-09-10", patientType: "postnatal",
    tags: [], basicMedical: {},
    partner: { name: "Dorje Tamang", age: 30, occupation: "Business" }, allergies: "",
    firstVisit: {
      completed: true, completedOn: "2025-09-10",
      obstetricHistory: { detailedHistory: "G1P0 — Primigravida.", previousPregnancies: [] },
      medicalHistory: { asthma: false, hypertension: false, diabetes: false },
      examination: { bp: "114/72", weight: "54", height: "157", bmi: "21.9" },
      summary: "28yo primigravida. Low risk.", autoRisk: "low",
    },
    visits: [
      { id: "pv9-1", date: "2026-02-10", type: "ANC 7th Visit (36 weeks)", ancContact: 7, ga: "35+0", bp: "116/74", weight: "58.0", fetalHR: "146", fundal: "35", findings: "Normal progress.", plan: "Await labour.", bpFlag: null, fhrFlag: null },
    ],
    labs: [
      { id: "pl9-1", test: "Haemoglobin", date: "2025-09-10", value: "12.0", unit: "g/dL", status: "normal" },
    ],
  },
  {
    id: "PN-010", name: "Sushila Malla", age: 30, phone: "9890123456", address: "Lamki, Kailali",
    bloodGroup: "A+", religion: "Hindu", ethnicity: "Chhetri", education: "Secondary (9–10)", occupation: "Farmer",
    weight: "62", height: "156", gravida: 2, para: 2,
    lmp: "2025-05-12", edd: "2026-02-16", ga: "42+5",
    deliveryDate: "2026-02-18", deliveryTime: "13:30", deliveryMode: "SVD (Spontaneous Vaginal Delivery)", durationOfLabor: "7 hours", maternalComplications: "UTI", episiotomy: "Yes",
    babySex: "Male", birthWeight: "3.0", apgar1: "8", apgar5: "9", babyStatus: "Stable", feedingMethod: "Breastfeeding", bfedInitiated: "Yes",
    dischargeDate: "2026-02-20", followUpDate: "2026-03-18", familyPlanningCounseling: "Done", signsExplained: "Yes", immunization: { bcg: true, opv: true, hepB: true },
    riskStatus: "low", riskLevel: "low", registeredOn: "2025-08-05", patientType: "postnatal",
    tags: [], basicMedical: {},
    partner: { name: "Krishna Malla", age: 33, occupation: "Farmer" }, allergies: "",
    firstVisit: {
      completed: true, completedOn: "2025-08-05",
      obstetricHistory: {
        detailedHistory: "G2P1L1. 1st SVD 2023.", previousPregnancies: [
          { year: "2023", placeOfDelivery: "Health Centre", modeOfDelivery: "SVD (Normal)", babyWeight: "2.9 kg", babySex: "Male" },
        ]
      },
      medicalHistory: { hypertension: false, diabetes: false },
      examination: { bp: "112/70", weight: "56", height: "156", bmi: "23.0" },
      summary: "30yo G2P1. Low risk.", autoRisk: "low",
    },
    visits: [
      { id: "pv10-1", date: "2026-01-15", type: "ANC 6th Visit (34 weeks)", ancContact: 6, ga: "35+4", bp: "114/72", weight: "60.0", fetalHR: "144", fundal: "35", findings: "UTI symptoms. Urine culture sent.", plan: "Amoxicillin 5 days.", bpFlag: null, fhrFlag: null },
    ],
    labs: [
      { id: "pl10-1", test: "Haemoglobin", date: "2025-08-05", value: "11.6", unit: "g/dL", status: "normal" },
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
    case "RECORD_DELIVERY": {
      const patient = state.patients.find(p => p.id === action.patientId);
      if (!patient) return state;

      let newPara = parseInt(patient.para) || 0;

      if (patient.lmp && action.payload.deliveryDate) {
        const gaStr = calcGA(patient.lmp, action.payload.deliveryDate);
        if (gaStr) {
          const gaWeeks = parseInt(gaStr.split('+')[0], 10);
          if (gaWeeks >= 28) {
            newPara += 1;
          }
        }
      } else {
        // Fallback if no dates exist but delivery is recorded
        newPara += 1;
      }

      const postP = {
        ...patient,
        ...action.payload,
        para: newPara,
        patientType: "postnatal"
      };

      return {
        ...state,
        patients: state.patients.filter(p => p.id !== action.patientId),
        postnatalPatients: [postP, ...(state.postnatalPatients || [])]
      };
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
    case "UPDATE_VISIT":
      return {
        ...state, patients: state.patients.map(p => {
          if (p.id === action.patientId) {
            const updatedP = {
              ...p,
              visits: p.visits.map(v => v.id === action.visitId ? { ...v, ...action.payload } : v)
            };
            // Sync vitals if it's the latest visit
            const latest = updatedP.visits[0];
            if (latest && latest.id === action.visitId) {
              updatedP.weight = action.payload.weight || p.weight;
              updatedP.height = action.payload.height || p.height;
              updatedP.bmi = action.payload.bmi || p.bmi;
            }
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
    case "RECORD_NEW_PREGNANCY": {
      const p = state.postnatalPatients.find(x => x.id === action.patientId);
      if (!p) return state;

      // Map complications and delivery outcome to specific boolean flags
      const isCS = p.deliveryMode?.includes("LSCS") || p.deliveryMode?.includes("Caesarean");
      const isForceps = p.deliveryMode?.includes("Forceps") || p.deliveryMode?.includes("Vacuum");
      const isPPH = p.maternalComplications?.includes("PPH") || p.maternalComplications?.includes("hemorrhage");
      const isEclampsia = p.maternalComplications?.includes("Eclampsia") || p.maternalComplications?.includes("PIH");
      const isStillbirth = p.babyStatus === "Stillbirth";
      const isNND = p.babyStatus === "Neonatal Death";
      const isAnomaly = p.babyStatus === "Congenital Anomaly";
      const isPreterm = p.gaAtDelivery && parseInt(p.gaAtDelivery.split("+")[0]) < 37;

      // Build the previous pregnancy entry from the delivery that just happened
      const prevDeliveryEntry = p.deliveryDate ? {
        year: p.deliveryDate.slice(0, 4),
        outcome: isStillbirth ? "Stillbirth" : isNND ? "Neonatal Death" : "Live Birth",
        ancAttended: true,
        placeOfDelivery: "Hospital",
        ga: p.gaAtDelivery || "",
        typeOfLabour: p.durationOfLabor ? "Spontaneous" : "",
        modeOfDelivery: p.deliveryMode || "",
        indication: "",
        anaesthesia: "",
        interventions: p.episiotomy === "Yes" ? "Episiotomy" : "",
        complications: p.maternalComplications && p.maternalComplications !== "None" ? p.maternalComplications : "",
        babySex: p.babySex || "",
        babyWeight: p.birthWeight ? `${p.birthWeight} kg` : "",
        apgar: p.apgar5 ? `5min: ${p.apgar5}` : "",
        timeOfBirth: p.deliveryTime || "",
        babyComplications: p.babyStatus !== "Stable" && p.babyStatus !== "Healthy & Stable" ? p.babyStatus : "",
        immunisations: p.immunization ? Object.entries(p.immunization).filter(([_, v]) => v).map(([k]) => k.toUpperCase()).join(", ") : "",
        breastfeeding: p.bfedInitiated === "Yes" ? "Exclusive (6 months)" : "",
        // Specific boolean flags for risk evaluation
        prevCS: !!isCS,
        prevPPH: !!isPPH,
        prevPreterm: !!isPreterm,
        prevStillbirth: !!isStillbirth,
        prevEclampsia: !!isEclampsia,
        prevGDM: p.maternalComplications?.includes("GDM") || false,
        prevNeonatalDeath: !!isNND,
        prevCongenitalAnomaly: !!isAnomaly,
        prevForceps: !!isForceps,
        prevAbortion2Plus: false,
        prevSevereAnaemia: p.maternalComplications?.includes("Anaemia") || false,
      } : null;

      // Combine: new delivery entry + any existing previousPregnancies from prior firstVisit
      const existingPrevPregs = p.firstVisit?.obstetricHistory?.previousPregnancies || [];
      const allPrevPregs = prevDeliveryEntry
        ? [prevDeliveryEntry, ...existingPrevPregs]
        : existingPrevPregs;

      // Save the previous firstVisit data (with updated OB history) so the new MHE form can inherit it
      const prevFirstVisit = p.firstVisit ? {
        ...p.firstVisit,
        obstetricHistory: {
          ...(p.firstVisit.obstetricHistory || {}),
          previousPregnancies: allPrevPregs,
        },
      } : allPrevPregs.length > 0 ? {
        obstetricHistory: { previousPregnancies: allPrevPregs },
      } : null;

      const newP = {
        ...p,
        ...action.payload,
        patientType: "antenatal",
        registeredOn: new Date().toISOString().split('T')[0],
        visits: [],
        labs: [],
        tags: [],
        riskLevel: "low",
        firstVisit: null,
        prevFirstVisit: prevFirstVisit,
        // Clear delivery fields so they don't confuse the antenatal view
        deliveryDate: undefined,
        deliveryTime: undefined,
        deliveryMode: undefined,
        babySex: undefined,
        birthWeight: undefined,
        babyStatus: undefined,
      };

      return {
        ...state,
        postnatalPatients: state.postnatalPatients.filter(x => x.id !== action.patientId),
        patients: [newP, ...(state.patients || [])]
      };
    }
    default: return state;
  }
}

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, { patients: SEED, postnatalPatients: POSTNATAL_SEED });
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}