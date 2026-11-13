from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field

class Biomarker(BaseModel):
    name: str = Field(..., description="Exact test name extracted from the report.")
    extracted_value: str = Field(..., description="Verbatim numerical or qualitative value from the report.")
    unit: Optional[str] = Field(None, description="Verbatim unit of measurement if present in the report.")
    reference_range: Optional[str] = Field(
        None, 
        description="Verbatim reference interval strictly as stated in the report. null if missing."
    )
    status: str = Field(
        "REVIEW", 
        description="One of: NORMAL, HIGH, LOW, ABNORMAL, or REVIEW."
    )
    simple_language_explanation: str = Field(
        ..., 
        description="AI educational explanation in simple layman's language."
    )
    missing_or_unclear_note: Optional[str] = Field(
        None, 
        description="Note if unit, range, or value was missing or unclear."
    )

class SectionFinding(BaseModel):
    category: str = Field(..., description="Clinical grouping.")
    summary: Optional[str] = Field(None)
    biomarkers: List[Biomarker] = []

class GeminiAnalysisResult(BaseModel):
    title: str
    overall_summary: str
    key_findings: List[str] = []
    sections: List[SectionFinding] = []
    questions_for_doctor: List[str] = []
    clarity_assessment: str = "Clear"

class ReportAnalyzeResponse(BaseModel):
    status: str
    filename: str
    file_type: str
    file_size_bytes: int
    page_count: int
    extraction_method: str
    extracted_text: str
    title: str
    overall_summary: str
    key_findings: List[str] = []
    sections: List[SectionFinding] = []
    questions_for_doctor: List[str] = []
    clarity_assessment: str = "Clear"
    ai_powered: bool = False
    disclaimer: str
    warnings: List[str] = []

# --- Chat Schemas ---
class ChatMessage(BaseModel):
    role: str  # 'user' | 'assistant'
    content: str

class ReportChatRequest(BaseModel):
    question: str = Field(..., description="The user's question regarding their lab report.")
    report_context: str = Field(..., description="Verbatim extracted report text and parsed summary.")
    chat_history: Optional[List[ChatMessage]] = Field(default_factory=list)

class ReportChatResponse(BaseModel):
    answer: str
    supported_by_report: bool
    disclaimer: str
