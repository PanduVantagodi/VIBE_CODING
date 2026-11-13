import os
import shutil
import tempfile
import logging
from typing import Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from app.services.extractor import extract_from_image_path, extract_from_pdf_path
from app.services.gemini import analyze_with_gemini, answer_report_chat_question
from app.services.parser import parse_report_fallback
from app.schemas.report import ReportAnalyzeResponse, ReportChatRequest, ReportChatResponse

router = APIRouter(prefix="/reports", tags=["Reports"])
logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/octet-stream"
}
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

EDUCATIONAL_DISCLAIMER = (
    "EDUCATIONAL USE ONLY: ReportSaathi is an educational and literacy tool designed "
    "to help patients understand laboratory terminology. It does not provide medical diagnoses, "
    "clinical advice, or treatment plans. Never modify, start, or cease any medical treatment "
    "without the direct supervision of your licensed physician or healthcare provider."
)

@router.post("/analyze", response_model=ReportAnalyzeResponse)
async def analyze_report(
    file: UploadFile = File(..., description="PDF or image (JPG/PNG) of the medical lab report")
):
    filename = file.filename or "unknown_report"
    ext = os.path.splitext(filename)[1].lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Allowed formats are PDF, JPG, and PNG."
        )

    content_type = file.content_type or ""
    if content_type and content_type.lower() not in ALLOWED_MIME_TYPES:
        logger.warning(f"Unusual mime type: {content_type} for {filename}")

    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=ext)
    temp_path = temp_file.name

    try:
        size = 0
        chunk_size = 1024 * 64
        while chunk := await file.read(chunk_size):
            size += len(chunk)
            if size > MAX_FILE_SIZE_BYTES:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"File exceeds maximum allowed size of 10MB."
                )
            temp_file.write(chunk)
        temp_file.flush()
        temp_file.close()

        if size == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The uploaded file is completely empty (0 bytes)."
            )

        if ext == ".pdf":
            extraction = extract_from_pdf_path(temp_path)
        else:
            extraction = extract_from_image_path(temp_path)

        extracted_text = extraction.get("text", "").strip()
        page_count = extraction.get("pages", 1)
        method = extraction.get("method", "unknown")

        if not extracted_text or len(extracted_text) < 10:
            return ReportAnalyzeResponse(
                status="unreadable",
                filename=filename,
                file_type=ext.replace(".", "").upper(),
                file_size_bytes=size,
                page_count=page_count,
                extraction_method=method,
                extracted_text="",
                title=f"Unreadable Document: {filename}",
                overall_summary=(
                    "The OCR system was unable to detect readable text in this file. "
                    "This commonly happens if the image is too blurry, dark, low-resolution, "
                    "or contains handwritten notes rather than printed clinical lab results."
                ),
                key_findings=[
                    "No discernible printed text could be extracted.",
                    "Please ensure the image or scan is well-lit, sharp, and properly aligned."
                ],
                sections=[],
                questions_for_doctor=[
                    "Would the laboratory provide a digital PDF copy of this report for clearer review?"
                ],
                clarity_assessment="Unclear",
                ai_powered=False,
                disclaimer=EDUCATIONAL_DISCLAIMER,
                warnings=[
                    "Text extraction yielded zero readable characters. Please upload a higher-resolution scan."
                ]
            )

        ai_powered = False
        analysis = analyze_with_gemini(extracted_text, filename)
        warnings = []
        if analysis:
            ai_powered = True
        else:
            analysis = parse_report_fallback(extracted_text, filename)
            warnings.append("Analysis generated via grounded local parser.")

        return ReportAnalyzeResponse(
            status="success",
            filename=filename,
            file_type=ext.replace(".", "").upper(),
            file_size_bytes=size,
            page_count=page_count,
            extraction_method=method,
            extracted_text=extracted_text,
            title=analysis.title,
            overall_summary=analysis.overall_summary,
            key_findings=analysis.key_findings,
            sections=analysis.sections,
            questions_for_doctor=analysis.questions_for_doctor,
            clarity_assessment=analysis.clarity_assessment,
            ai_powered=ai_powered,
            disclaimer=EDUCATIONAL_DISCLAIMER,
            warnings=warnings
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing file {filename}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while processing the document: {str(e)}"
        )
    finally:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception as e:
                logger.warning(f"Could not remove temp file {temp_path}: {e}")

@router.post("/chat", response_model=ReportChatResponse)
async def chat_about_report(payload: ReportChatRequest):
    """
    POST /api/reports/chat
    Answers questions strictly grounded in the currently selected report's extracted text.
    If the requested information is absent from the report, it explicitly says so
    and recommends asking a licensed clinician. Never diagnoses or prescribes.
    """
    try:
        response = answer_report_chat_question(
            question=payload.question,
            report_context=payload.report_context,
            chat_history=payload.chat_history
        )
        return response
    except Exception as e:
        logger.error(f"Chat processing failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Failed to answer question about report."
        )
