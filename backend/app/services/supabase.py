import logging
from typing import Optional
from supabase import create_client, Client
from app.core.config import settings

logger = logging.getLogger(__name__)

supabase_client: Optional[Client] = None

if settings.SUPABASE_URL and settings.SUPABASE_KEY:
    try:
        supabase_client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        logger.info("Supabase client initialized.")
    except Exception as e:
        logger.warning(f"Could not initialize Supabase client: {e}")

def save_report_history(user_id: Optional[str], file_name: str, analysis_dict: dict):
    """Optional storage of analysis history in Supabase table 'reports'."""
    if not supabase_client or not user_id:
        return None
    try:
        data = {
            "user_id": user_id,
            "filename": file_name,
            "analysis": analysis_dict,
        }
        res = supabase_client.table("reports").insert(data).execute()
        return res
    except Exception as e:
        logger.error(f"Failed to save report history to Supabase: {e}")
        return None
