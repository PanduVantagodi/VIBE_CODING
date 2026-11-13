import re
from typing import List, Dict, Optional
from app.schemas.report import Biomarker, SectionFinding, GeminiAnalysisResult

BIOMARKER_KNOWLEDGE_BASE = {
    "hemoglobin": {
        "display": "Hemoglobin (Hb)",
        "category": "Complete Blood Count",
        "role": "Protein in red blood cells that carries oxygen from lungs throughout your body.",
        "low_exp": "Below reference range. Mildly low hemoglobin is often associated with fatigue and nutritional factors like iron or B12.",
        "high_exp": "Above reference range. Elevated hemoglobin can occur with dehydration or living at high altitudes.",
        "norm_exp": "Within standard healthy range, indicating normal oxygen-carrying capacity."
    },
    "rbc": {
        "display": "Red Blood Cell Count (RBC)",
        "category": "Complete Blood Count",
        "role": "Oxygen-carrying blood cells.",
        "low_exp": "Fewer circulating red cells than average, often evaluated alongside hemoglobin.",
        "high_exp": "Higher than reference count.",
        "norm_exp": "Healthy count of circulating red blood cells."
    },
    "wbc": {
        "display": "Total Leukocyte Count (WBC)",
        "category": "Complete Blood Count",
        "role": "Primary defense cells of the immune system.",
        "low_exp": "Below reference interval. Can happen during recovery from common viral illnesses.",
        "high_exp": "Above reference interval. Frequently an active, temporary immune response to a mild infection or inflammation.",
        "norm_exp": "Healthy immune cell count."
    },
    "platelet": {
        "display": "Platelet Count",
        "category": "Complete Blood Count",
        "role": "Cell fragments essential for standard blood clotting and tissue repair.",
        "low_exp": "Below reference range. Can cause easier bruising or slower clotting.",
        "high_exp": "Above reference range. Frequently elevated temporarily following inflammation.",
        "norm_exp": "Healthy clotting cell count."
    },
    "glucose": {
        "display": "Blood Glucose (Sugar)",
        "category": "Metabolic & Glycemic Profile",
        "role": "Main fuel source for body cells circulating in blood.",
        "low_exp": "Low blood sugar (hypoglycemia).",
        "high_exp": "Higher than normal fasting target. Warrants a conversation with your doctor about diet and metabolism.",
        "norm_exp": "Healthy fasting blood sugar."
    },
    "creatinine": {
        "display": "Serum Creatinine",
        "category": "Kidney Function Profile",
        "role": "Byproduct of normal muscle breakdown filtered out by the kidneys.",
        "low_exp": "Lower than average creatinine.",
        "high_exp": "Above standard range. May indicate kidneys are filtering waste slower than ideal.",
        "norm_exp": "Normal kidney filtration."
    },
    "cholesterol": {
        "display": "Total Cholesterol",
        "category": "Lipid Profile",
        "role": "Fatty substance required for cell membranes and hormones.",
        "low_exp": "Lower than average cholesterol.",
        "high_exp": "Above recommended heart-healthy ceiling.",
        "norm_exp": "Desirable cardiovascular cholesterol balance."
    },
    "ldl": {
        "display": "LDL Cholesterol",
        "category": "Lipid Profile",
        "role": "Low-density lipoprotein commonly called 'bad' cholesterol.",
        "low_exp": "Favorable lower arterial risk marker.",
        "high_exp": "Above optimal target. Long-term elevation can deposit plaque in arteries.",
        "norm_exp": "Protective desirable range."
    },
    "hdl": {
        "display": "HDL Cholesterol",
        "category": "Lipid Profile",
        "role": "High-density lipoprotein ('good' cholesterol) that clears excess fats.",
        "low_exp": "Below optimal protective level.",
        "high_exp": "Strong protective cardiovascular level.",
        "norm_exp": "Normal protective range."
    },
    "triglyceride": {
        "display": "Triglycerides",
        "category": "Lipid Profile",
        "role": "Storage form of fat circulating in bloodstream.",
        "low_exp": "Low circulating triglycerides.",
        "high_exp": "Elevated triglycerides, often influenced by dietary carbohydrates and sugars.",
        "norm_exp": "Healthy fasting triglyceride level."
    }
}

def parse_report_fallback(extracted_text: str, filename: str) -> GeminiAnalysisResult:
    """
    Deterministic rule-based fallback parser used when GEMINI_API_KEY is not configured
    or when Gemini API is unreachable.
    Strictly follows grounding: never invents values or reference ranges.
    """
    found_biomarkers: List[Biomarker] = []
    lines = [line.strip() for line in extracted_text.splitlines() if line.strip()]

    for line in lines:
        lower_line = line.lower()
        for key, info in BIOMARKER_KNOWLEDGE_BASE.items():
            if re.search(r'\b' + re.escape(key) + r'\b', lower_line):
                number_match = re.search(r'[:\s=](\d+[\.,]?\d*)\b', line) or re.search(r'(\d+[\.,]?\d*)', line)
                if number_match:
                    val_str = number_match.group(1).replace(',', '')
                    
                    unit_match = re.search(r'\b(g/dl|mg/dl|/mcl|mcl|million/mcl|%|u/l|iu/l|mmol/l)\b', line, re.IGNORECASE)
                    unit = unit_match.group(1) if unit_match else None

                    ref_range = None
                    ref_match = re.search(r'[\(\[]([^\)\]]+)[\)\]]', line)
                    if ref_match and any(ch in ref_match.group(1) for ch in ['-', '<', '>']):
                        ref_range = ref_match.group(1).strip()
                    elif 'ref' in lower_line or 'range' in lower_line:
                        range_search = re.search(r'(?:ref\.?\s*range|range)[:\s]+([\d\.\s\-–<>]+)', line, re.IGNORECASE)
                        if range_search:
                            ref_range = range_search.group(1).strip()

                    status = "REVIEW"
                    missing_note = None
                    if not ref_range:
                        missing_note = "Reference range was not specified in the extracted report text."

                    if re.search(r'\b(high|elevated|h)\b', lower_line):
                        status = "HIGH"
                        explanation = info["high_exp"]
                    elif re.search(r'\b(low|decreased|l)\b', lower_line):
                        status = "LOW"
                        explanation = info["low_exp"]
                    elif ref_range and '-' in ref_range:
                        try:
                            parts = [float(p.strip()) for p in re.findall(r'(\d+(?:\.\d+)?)', ref_range)]
                            val_float = float(val_str)
                            if len(parts) >= 2:
                                if val_float < parts[0]:
                                    status = "LOW"
                                    explanation = info["low_exp"]
                                elif val_float > parts[1]:
                                    status = "HIGH"
                                    explanation = info["high_exp"]
                                else:
                                    status = "NORMAL"
                                    explanation = info["norm_exp"]
                        except Exception:
                            status = "REVIEW"
                            explanation = f"Extracted value: {val_str}. {info['role']}"
                    else:
                        explanation = f"Extracted value: {val_str}. {info['role']}"

                    if not any(b.name == info["display"] for b in found_biomarkers):
                        found_biomarkers.append(Biomarker(
                            name=info["display"],
                            extracted_value=val_str,
                            unit=unit,
                            reference_range=ref_range,
                            status=status,
                            simple_language_explanation=explanation,
                            missing_or_unclear_note=missing_note
                        ))

    # Organize into sections
    sections_map = {}
    for bio in found_biomarkers:
        cat = "Laboratory Parameters"
        for k, v in BIOMARKER_KNOWLEDGE_BASE.items():
            if v["display"] == bio.name:
                cat = v["category"]
                break
        if cat not in sections_map:
            sections_map[cat] = []
        sections_map[cat].append(bio)

    sections = [
        SectionFinding(
            category=cat_name,
            summary=f"Contains {len(bios)} extracted parameter(s) evaluated from the document.",
            biomarkers=bios
        )
        for cat_name, bios in sections_map.items()
    ]

    total = len(found_biomarkers)
    high_count = sum(1 for b in found_biomarkers if b.status in ["HIGH", "ABNORMAL"])
    low_count = sum(1 for b in found_biomarkers if b.status == "LOW")

    if total > 0:
        summary = (
            f"Extracted {total} test parameter(s) from '{filename}'. "
            f"{high_count} are higher than reference limits, {low_count} lower, and "
            f"{total - high_count - low_count} within normal bounds or requiring review."
        )
        key_findings = [
            f"{total} clinical biomarkers extracted verbatim from the report.",
            "All values are factual extractions without interpolation.",
            "Discuss abnormal findings with your physician."
        ]
        clarity = "Clear"
    else:
        summary = (
            f"Document text was extracted from '{filename}', but no known standard biomarker rows "
            "matched the diagnostic rulebook. Please review the verbatim text below or consult a clinician."
        )
        key_findings = [
            "Text extraction succeeded, but no structured biomarker rows were positively identified.",
            "Consider uploading a clearer digital PDF copy."
        ]
        clarity = "Partially Unclear"

    return GeminiAnalysisResult(
        title=f"Report Analysis: {filename}",
        overall_summary=summary,
        key_findings=key_findings,
        sections=sections,
        questions_for_doctor=[
            "Do any of these results require lifestyle, dietary, or medication adjustments?",
            "Should any of these tests be re-checked or monitored over the coming 3 to 6 months?",
            "What factors could have influenced these numbers (e.g. fasting, hydration, medications)?"
        ],
        clarity_assessment=clarity
    )
