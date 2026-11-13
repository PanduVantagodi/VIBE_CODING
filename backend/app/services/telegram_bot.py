import os
import io
import tempfile
import logging
from typing import Optional
import requests
from app.core.config import settings
from app.services.extractor import extract_from_image_path, extract_from_pdf_path
from app.services.gemini import analyze_with_gemini
from app.services.parser import parse_report_fallback

logger = logging.getLogger(__name__)

# Strict safety disclaimer attached to all Telegram responses
TELEGRAM_DISCLAIMER = (
    "\n\n⚠️ *Educational Disclaimer*: ReportSaathi is for informational & educational purposes only. "
    "It cannot diagnose medical conditions or prescribe treatment. Always consult a licensed physician."
)

class TelegramBotService:
    def __init__(self):
        self.token = settings.TELEGRAM_BOT_TOKEN
        self.base_url = f"https://api.telegram.org/bot{self.token}" if self.token else None

    def is_configured(self) -> bool:
        return bool(self.token and self.token.strip() != "")

    def send_message(self, chat_id: int, text: str, parse_mode: str = "Markdown") -> bool:
        if not self.base_url:
            return False
        try:
            # We never log chat content or tokens to prevent data leakage
            res = requests.post(
                f"{self.base_url}/sendMessage",
                json={
                    "chat_id": chat_id,
                    "text": text,
                    "parse_mode": parse_mode
                },
                timeout=10
            )
            return res.status_code == 200
        except Exception as e:
            logger.error("Failed to deliver Telegram message.")
            return False

    def process_file_and_explain(self, file_bytes: bytes, filename: str) -> str:
        """
        Validates file type and size safely.
        Never logs sensitive report bytes or patient content.
        """
        ext = os.path.splitext(filename)[1].lower()
        if ext not in [".pdf", ".jpg", ".jpeg", ".png"]:
            return "❌ *Unsupported Format*: Please send a PDF, JPG, or PNG document of your lab report."

        if len(file_bytes) > 10 * 1024 * 1024:
            return "❌ *File Too Large*: The maximum supported file size is 10MB."

        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=ext)
        temp_path = temp_file.name

        try:
            temp_file.write(file_bytes)
            temp_file.flush()
            temp_file.close()

            if ext == ".pdf":
                extraction = extract_from_pdf_path(temp_path)
            else:
                extraction = extract_from_image_path(temp_path)

            extracted_text = extraction.get("text", "").strip()
            if not extracted_text or len(extracted_text) < 10:
                return (
                    "⚠️ *Unreadable Report*: Could not detect clear printed text in this document. "
                    "Please ensure the image is bright, sharp, and well-aligned." + TELEGRAM_DISCLAIMER
                )

            analysis = analyze_with_gemini(extracted_text, filename)
            if not analysis:
                analysis = parse_report_fallback(extracted_text, filename)

            # Format a clean, concise Telegram message
            lines = [
                f"📋 *{analysis.title}*",
                f"\n💡 *Summary*: {analysis.overall_summary}\n",
                "*Key Biomarkers Extracted:*"
            ]

            count = 0
            for sec in analysis.sections:
                for bio in sec.biomarkers[:5]:  # Top 5 for concise mobile read
                    ref_str = f" (Ref: {bio.reference_range})" if bio.reference_range else ""
                    val_str = f"{bio.extracted_value} {bio.unit or ''}".strip()
                    lines.append(f"• *{bio.name}*: `{val_str}`{ref_str} — _{bio.status}_")
                    count += 1

            if count == 0:
                lines.append("• No discrete biomarkers matched standard reference intervals.")

            if analysis.questions_for_doctor:
                lines.append("\n🩺 *Questions for your Doctor:*")
                for q in analysis.questions_for_doctor[:2]:
                    lines.append(f"1. {q}")

            lines.append(TELEGRAM_DISCLAIMER)
            return "\n".join(lines)

        except Exception as e:
            logger.error("Error processing telegram document.")
            return "❌ An error occurred while analyzing the document." + TELEGRAM_DISCLAIMER
        finally:
            if os.path.exists(temp_path):
                try:
                    os.remove(temp_path)
                except Exception:
                    pass

telegram_bot_service = TelegramBotService()
