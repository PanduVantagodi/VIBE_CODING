import logging
from fastapi import APIRouter, Request, HTTPException
from app.services.telegram_bot import telegram_bot_service
import requests

router = APIRouter(prefix="/telegram", tags=["Telegram Bot"])
logger = logging.getLogger(__name__)

@router.get("/status")
def bot_status():
    """Reports whether Telegram bot token is configured on the backend."""
    return {
        "configured": telegram_bot_service.is_configured(),
        "service": "ReportSaathi Telegram Webhook Service"
    }

@router.post("/webhook")
async def telegram_webhook(request: Request):
    """
    Receives Telegram updates via webhook.
    Never logs sensitive message bodies or tokens.
    """
    if not telegram_bot_service.is_configured():
        return {"status": "bot_token_not_configured"}

    try:
        data = await request.json()
        message = data.get("message", {})
        chat_id = message.get("chat", {}).get("id")
        if not chat_id:
            return {"status": "ignored"}

        # Handle /start or text greetings
        if "text" in message:
            text = message["text"].strip()
            if text.startswith("/start") or text.startswith("/help"):
                welcome = (
                    "👋 *Welcome to ReportSaathi Bot!*\n\n"
                    "Send me an image (JPG/PNG) or PDF document of your laboratory test report, "
                    "and I will provide an educational plain-language breakdown.\n\n"
                    "⚠️ *Notice*: Educational use only. Not medical diagnosis."
                )
                telegram_bot_service.send_message(chat_id, welcome)
                return {"status": "ok"}

        # Handle Document or Photo upload
        file_id = None
        file_name = "lab_report.jpg"

        if "document" in message:
            doc = message["document"]
            file_id = doc.get("file_id")
            file_name = doc.get("file_name", "report.pdf")
        elif "photo" in message:
            photos = message["photo"]
            file_id = photos[-1].get("file_id")  # highest resolution
            file_name = "report_scan.jpg"

        if file_id:
            telegram_bot_service.send_message(chat_id, "🔍 *Reading and analyzing your laboratory report...* Please wait.")
            
            # Fetch file path from Telegram Bot API
            file_info_res = requests.get(
                f"{telegram_bot_service.base_url}/getFile?file_id={file_id}",
                timeout=10
            )
            if file_info_res.status_code == 200:
                file_path = file_info_res.json().get("result", {}).get("file_path")
                download_url = f"https://api.telegram.org/file/bot{telegram_bot_service.token}/{file_path}"
                file_bytes = requests.get(download_url, timeout=20).content

                # Process safely with strict guardrails
                explanation = telegram_bot_service.process_file_and_explain(file_bytes, file_name)
                telegram_bot_service.send_message(chat_id, explanation)
            else:
                telegram_bot_service.send_message(chat_id, "❌ Could not retrieve file from Telegram.")

        return {"status": "processed"}

    except Exception as e:
        logger.error("Error processing telegram webhook update.")
        return {"status": "error"}
