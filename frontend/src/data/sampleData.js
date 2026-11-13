export const sampleReports = {
  cbc: {
    id: "rep-cbc-01",
    title: "Complete Blood Count (CBC) with Differential",
    patientCode: "PT-88219 (De-identified)",
    dateSampled: "November 10, 2026",
    overallSummary:
      "This routine Complete Blood Count checks red cells, white cells, and blood clotting platelets. Overall, the majority of markers are in healthy ranges, with slightly elevated white blood cells (which commonly happens when the body is resolving a minor reaction or seasonal infection) and mild borderline low hemoglobin.",
    keyTakeaways: [
      "Hemoglobin is slightly below optimal, indicating mild fatigue potential.",
      "White Blood Cells (WBC) are mildly elevated, suggesting normal active immune response.",
      "Platelet counts and Red Blood Cell indices are well within safe balance.",
    ],
    sections: [
      {
        category: "Oxygen Transport & Red Cells",
        description: "Assesses how efficiently oxygen travels from lungs to tissues.",
        biomarkers: [
          {
            name: "Hemoglobin (Hb)",
            value: "11.8",
            unit: "g/dL",
            referenceRange: "12.0 - 16.0",
            status: "LOW",
            clinicalRole: "Protein in red blood cells carrying oxygen throughout the body.",
            plainExplanation:
              "Your hemoglobin is just under the standard threshold. Mild low levels can cause you to feel tired or cold more easily. Often related to dietary iron, hydration, or vitamin B12 levels.",
          },
          {
            name: "Total RBC Count",
            value: "4.45",
            unit: "million/mcL",
            referenceRange: "4.00 - 5.20",
            status: "NORMAL",
            clinicalRole: "Actual count of oxygen-carrying red blood cells.",
            plainExplanation:
              "Your total number of red blood cells is in the healthy standard bracket.",
          },
          {
            name: "Hematocrit (PCV)",
            value: "36.2",
            unit: "%",
            referenceRange: "36.0 - 46.0",
            status: "NORMAL",
            clinicalRole: "Percentage of total blood volume made up of red cells.",
            plainExplanation:
              "Normal volume proportion of red cells circulating in your bloodstream.",
          },
        ],
      },
      {
        category: "Immune Response & White Cells",
        description: "Measures the white blood cells defending against infections.",
        biomarkers: [
          {
            name: "Total Leukocyte Count (WBC)",
            value: "11,800",
            unit: "/mcL",
            referenceRange: "4,000 - 10,500",
            status: "HIGH",
            clinicalRole: "Primary defense cells of the immune system.",
            plainExplanation:
              "Slightly elevated. A higher count is common during or right after a common cold, allergy flare, physical stress, or inflammation. It shows your immune system is alert.",
          },
          {
            name: "Neutrophils",
            value: "71",
            unit: "%",
            referenceRange: "40 - 70",
            status: "HIGH",
            clinicalRole: "First responder cells for common bacterial challenges.",
            plainExplanation:
              "Just 1% above the standard reference window, consistent with minor immune activation.",
          },
          {
            name: "Lymphocytes",
            value: "23",
            unit: "%",
            referenceRange: "20 - 45",
            status: "NORMAL",
            clinicalRole: "White cells responsible for antibodies and viral defense.",
            plainExplanation:
              "Normal balance of antibody-producing immune defense cells.",
          },
        ],
      },
      {
        category: "Clotting & Platelet Balance",
        description: "Evaluates clotting cells that prevent and stop bleeding.",
        biomarkers: [
          {
            name: "Platelet Count",
            value: "245,000",
            unit: "/mcL",
            referenceRange: "150,000 - 450,000",
            status: "NORMAL",
            clinicalRole: "Cell fragments essential for normal blood clotting.",
            plainExplanation:
              "Well within normal range. Your body has plenty of clotting power to heal small cuts normally.",
          },
        ],
      },
    ],
    doctorQuestions: [
      "Could my slightly lower hemoglobin explain feeling low on energy lately?",
      "Would you suggest checking my serum ferritin (iron storage) or vitamin B12 levels?",
      "Does the slight WBC elevation warrant a follow-up test in a month or two?",
    ],
  },
  lipid: {
    id: "rep-lipid-02",
    title: "Comprehensive Lipid & Metabolic Panel",
    patientCode: "PT-49102 (De-identified)",
    dateSampled: "November 08, 2026",
    overallSummary:
      "This lipid test assesses cardiovascular risk factors and circulating fats. While your protective HDL is strong, your LDL ('bad') cholesterol is moderately elevated, and fasting triglycerides are slightly above ideal target levels.",
    keyTakeaways: [
      "Total Cholesterol and LDL are elevated above recommended heart-healthy thresholds.",
      "HDL ('Good') cholesterol is at a protective level (54 mg/dL).",
      "Lifestyle and dietary adjustments like soluble fiber and aerobic activity are great talking points for your physician.",
    ],
    sections: [
      {
        category: "Lipid Profile (Cholesterol & Fats)",
        description: "Assesses heart, artery, and circulation health indicators.",
        biomarkers: [
          {
            name: "Total Cholesterol",
            value: "228",
            unit: "mg/dL",
            referenceRange: "< 200",
            status: "HIGH",
            clinicalRole: "Total circulating cholesterol in the bloodstream.",
            plainExplanation:
              "Higher than the recommended 200 mg/dL target. Reflects a combination of genetics, nutrition, and metabolic factors.",
          },
          {
            name: "LDL Cholesterol ('Bad')",
            value: "142",
            unit: "mg/dL",
            referenceRange: "< 100",
            status: "HIGH",
            clinicalRole: "Low-density lipoprotein that can build plaque in blood vessels.",
            plainExplanation:
              "Moderately above optimal. Elevated LDL over long periods can deposit inside arterial walls.",
          },
          {
            name: "HDL Cholesterol ('Good')",
            value: "54",
            unit: "mg/dL",
            referenceRange: "> 40",
            status: "NORMAL",
            clinicalRole: "High-density lipoprotein that sweeps excess fats back to the liver.",
            plainExplanation:
              "Healthy and protective level. High HDL helps counterbalance circulating risks.",
          },
          {
            name: "Triglycerides",
            value: "165",
            unit: "mg/dL",
            referenceRange: "< 150",
            status: "HIGH",
            clinicalRole: "Storage form of fat in blood derived from unused calories.",
            plainExplanation:
              "Mildly elevated. Often responds very quickly to reducing refined sugars, sodas, and alcohol.",
          },
        ],
      },
    ],
    doctorQuestions: [
      "Are these cholesterol levels something we should address through diet and exercise first?",
      "Would you recommend calculating a 10-year ASCVD (cardiovascular risk) score for me?",
      "When should I repeat this fasting lipid panel to see progress?",
    ],
  },
};
