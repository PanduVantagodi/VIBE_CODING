import json
import logging
from typing import Optional, List
from google import genai
from google.genai import types
from app.core.config import settings
from app.schemas.report import GeminiAnalysisResult, ReportChatResponse, ChatMessage

logger = logging.getLogger(__name__)

GEMINI_MEDICAL_SYSTEM_PROMPT = """You are ReportSaathi, an empathetic and highly precise medical educator.
Your task is to analyze extracted laboratory report text and explain the findings in plain, accessible language for educational awareness.

CRITICAL MEDICAL SAFETY & GROUNDING RULES:
1. NEVER diagnose an illness or disease, never prescribe medication, and never claim clinical certainty.
2. NEVER INVENT, ASSUME, OR FABRICATE values, units, or reference ranges.
   - If a reference range is NOT stated in the source text, set reference_range to null.
   - If a unit is NOT present, set unit to null.
   - Use missing_or_unclear_note to explicitly note what is missing or unclear.
3. CLEARLY DISTINGUISH FACTS FROM EXPLANATIONS:
   - name, extracted_value, unit, reference_range MUST be 100% verbatim from the report text.
   - simple_language_explanation should explain what the marker generally does in the body.
4. UNCLEAR REPORTS:
   - If text is garbled, set clarity_assessment to 'Partially Unclear' or 'Unclear' and advise consulting a clinician.
5. STATUS must be strictly one of: "NORMAL", "HIGH", "LOW", "ABNORMAL", or "REVIEW".
6. Always include 3-5 constructive questions for the user to ask their doctor.
"""

CHAT_SYSTEM_PROMPT = """You are ReportSaathi's dedicated report question assistant.
You are helping a patient understand their specific laboratory report results.

ABSOLUTE BOUNDARY & SAFETY RULES:
1. GROUNDING RULE: You must answer questions ONLY using the provided report context.
   - If the user asks about a test, symptom, illness, or biomarker that is NOT mentioned in the provided report context, you must explicitly state that the information is unavailable in this report, and recommend discussing it with a licensed healthcare professional.
   - Do NOT assume, extrapolate, or bring outside unmentioned diagnostic tests into the answer.
2. NON-DIAGNOSIS RULE:
   - NEVER diagnose a condition (e.g., do not say "You have diabetes", say "Your report shows a fasting blood glucose of 122 mg/dL, which is above standard reference limits. Only a licensed physician can diagnose conditions like prediabetes or diabetes").
   - NEVER recommend or prescribe medication, supplements, dosage changes, or medical treatments.
3. CLEAR & SUPPORTIVE:
   - Explain what the biomarkers in the report measure in simple terms.
   - Always encourage consulting their doctor for personal medical decisions.
"""

def analyze_with_gemini(extracted_text: str, filename: str) -> Optional[GeminiAnalysisResult]:
    if not settings.GEMINI_API_KEY:
        return None
    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        prompt = f"""Review and analyze the following extracted laboratory report text from file '{filename}':

--- BEGIN EXTRACTED REPORT TEXT ---
{extracted_text}
--- END EXTRACTED REPORT TEXT ---

Instructions: Extract each test parameter verbatim. For each parameter, provide a simple-language educational explanation.
If any value, unit, or reference interval is absent in the text, do not invent it. Note it under missing_or_unclear_note.
"""
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[prompt],
            config=types.GenerateContentConfig(
                system_instruction=GEMINI_MEDICAL_SYSTEM_PROMPT,
                response_mime_type="application/json",
                response_schema=GeminiAnalysisResult,
                temperature=0.1,
            ),
        )
        if not response.text:
            return None
        parsed_json = json.loads(response.text)
        return GeminiAnalysisResult(**parsed_json)
    except Exception as e:
        logger.error(f"Gemini API analysis failed: {str(e)}", exc_info=True)
        return None

def answer_report_chat_question(
    question: str, 
    report_context: str, 
    chat_history: Optional[List[ChatMessage]] = None
) -> ReportChatResponse:
    disclaimer = (
        "Educational use only. ReportSaathi does not provide medical diagnoses or treatment recommendations. "
        "Always verify your report with a qualified healthcare provider."
    )

    # If Gemini API key is configured, use Gemini
    if settings.GEMINI_API_KEY:
        try:
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            
            history_text = ""
            if chat_history:
                for msg in chat_history[-4:]:  # last 4 turns for context
                    history_text += f"{msg.role.upper()}: {msg.content}\n"

            prompt = f"""CONTEXT FROM THE PATIENT'S REPORT:
\"\"\"
{report_context}
\"\"\"

CONVERSATION HISTORY:
{history_text}

USER'S QUESTION:
{question}

Answer strictly based on the report context above. If the report doesn't contain the answer, say that the information is unavailable in this report and advise asking a healthcare professional."""

            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=[prompt],
                config=types.GenerateContentConfig(
                    system_instruction=CHAT_SYSTEM_PROMPT,
                    temperature=0.2,
                ),
            )
            ans = response.text.strip()
            # Simple heuristic to flag whether supported
            is_supported = not any(neg in ans.lower() for neg in [
                "not mentioned in this report",
                "unavailable in this report",
                "not found in your report",
                "does not contain information"
            ])

            return ReportChatResponse(
                answer=ans,
                supported_by_report=is_supported,
                disclaimer=disclaimer
            )
        except Exception as e:
            logger.error(f"Gemini chat error: {e}")

    # Fallback deterministic responder if Gemini key not set or unavailable
    lower_q = question.lower()
    lower_ctx = report_context.lower()

    # Check if keyword in question exists in report context
    keywords = [w for w in lower_q.split() if len(w) > 3 and w not in ["what", "does", "mean", "have", "this", "that", "tell", "about", "your", "should"]]
    found_keywords = [kw for kw in keywords if kw in lower_ctx]

    if not found_keywords:
        return ReportChatResponse(
            answer=(
                "This topic or test is not mentioned in your uploaded report. "
                "Because ReportSaathi strictly answers questions based on your specific lab results, "
                "we cannot provide information for tests not present in this document. "
                "Please consult your healthcare professional or doctor for personalized guidance."
            ),
            supported_by_report=False,
            disclaimer=disclaimer
        )

    return ReportChatResponse(
        answer=(
            f"Based on your report context, the following relevant details were noted regarding your query: "
            f"Please review the extracted values and reference ranges in the breakdown section above. "
            f"Remember that only a licensed doctor can interpret these metrics in the full context of your symptoms, medications, and medical history."
        ),
        supported_by_report=True,
        disclaimer=disclaimer
    )
