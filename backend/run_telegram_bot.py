import os
import sys
import time
import tempfile
import logging
import requests
from dotenv import load_dotenv

load_dotenv()

# Setup safe logger: never log sensitive tokens or report contents
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("telegram_bot_runner")

TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
if not TOKEN:
    logger.warning("TELEGRAM_BOT_TOKEN is not set in backend/.env. Poller will exit.")
    print("TELEGRAM_BOT_TOKEN not configured. Please add it to backend/.env to run the bot.")
    sys.exit(0)

BASE_URL = f"https://api.telegram.org/bot{TOKEN}"
ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}
MAX_SIZE = 10 * 1024 * 1024  # 10MB

# Import our backend extractor and parsers safely
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.services.extractor import extract_from_image_path, extract_from_pdf_path
from app.services.gemini import analyze_with_gemini
from app.services.parser import parse_report_fallback

DISCLAIMER = (
    "\n\n⚠️ *Educational Disclaimer*: ReportSaathi is for educational purposes only. "
    "It does not provide medical diagnoses, treatment plans, or clinical advice. "
    "Always discuss your laboratory results with a licensed healthcare provider."
)

def send_message(chat_id, text):
    try:
        requests.post(
            f"{BASE_URL}/sendMessage",
            json={"chat_id": chat_id, "text": text, "parse_mode": "Markdown"},
            timeout=10
        )
    except Exception as e:
        logger.error("Failed to send telegram message.")

def process_and_explain(file_bytes, filename):
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return "❌ *Unsupported Format*: Please send a PDF, JPG, or PNG document of your lab report."

    if len(file_bytes) > MAX_SIZE:
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
                "Please ensure the image or scan is sharp, well-lit, and properly aligned." + DISCLAIMER
            )

        analysis = analyze_with_gemini(extracted_text, filename)
        if not analysis:
            analysis = parse_report_fallback(extracted_text, filename)

        lines = [
            f"📋 *{analysis.title}*",
            f"\n💡 *Overview*: {analysis.overall_summary}\n",
            "*Biomarkers Extracted:*"
        ]

        count = 0
        for sec in analysis.sections:
            for bio in sec.biomarkers[:6]:
                ref = f" (Ref: {bio.reference_range})" if bio.reference_range else ""
                val = f"{bio.extracted_value} {bio.unit or ''}".strip()
                lines.append(f"• *{bio.name}*: `{val}`{ref} — _{bio.status}_")
                count += 1

        if count == 0:
            lines.append("• No discrete biomarkers matched standard reference intervals.")

        if analysis.questions_for_doctor:
            lines.append("\n🩺 *Questions for your Doctor:*")
            for q in analysis.questions_for_doctor[:2]:
                lines.append(f"• {q}")

        lines.append(DISCLAIMER)
        return "\n".join(lines)
    except Exception as e:
        logger.error("Error processing document in Telegram bot.")
        return "❌ An error occurred while analyzing the document." + DISCLAIMER
    finally:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass

def run_poller():
    logger.info("ReportSaathi Telegram Bot Poller starting...")
    offset = 0

    while True:
        try:
            res = requests.get(f"{BASE_URL}/getUpdates?offset={offset}&timeout=20", timeout=30)
            if res.status_code == 200:
                data = res.json()
                for update in data.get("result", []):
                    offset = update["update_id"] + 1
                    msg = update.get("message", {})
                    chat_id = msg.get("chat", {}).get("id")
                    if not chat_id:
                        continue

                    # Handle /start or text
                    if "text" in msg:
                        text = msg["text"].strip()
                        if text.startswith("/start") or text.startswith("/help"):
                            welcome = (
                                "👋 *Welcome to ReportSaathi Bot!*\n\n"
                                "Send me a photo (JPG/PNG) or PDF document of your laboratory test report, "
                                "and I will extract the biomarkers and provide a plain-language educational breakdown.\n\n"
                                "⚠️ *Note*: Educational use only. Not medical diagnosis."
                            )
                            send_message(chat_id, welcome)
                            continue

                    # Handle document / photo
                    file_id = None
                    file_name = "report.jpg"
                    if "document" in msg:
                        doc = msg["document"]
                        file_id = doc.get("file_id")
                        file_name = doc.get("file_name", "report.pdf")
                    elif "photo" in msg:
                        file_id = msg["photo"][-1].get("file_id")
                        file_name = "report.jpg"

                    if file_id:
                        send_message(chat_id, "🔍 *Reading and analyzing your laboratory report...* Please wait a moment.")
                        f_res = requests.get(f"{BASE_URL}/getFile?file_id={file_id}", timeout=10)
                        if f_res.status_code == 200:
                            f_path = f_res.json().get("result", {}).get("file_path")
                            d_url = f"https://api.telegram.org/file/bot{TOKEN}/{f_path}"
                            f_bytes = requests.get(d_url, timeout=25).content
                            
                            explanation = process_and_explain(f_bytes, file_name)
                            send_message(chat_id, explanation)
                        else:
                            send_message(chat_id, "❌ Could not retrieve file from Telegram.")
            time.sleep(1)
        except Exception as e:
            time.sleep(3)

if __name__ == "__main__":
    run_poller()
