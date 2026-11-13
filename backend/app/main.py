from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import analyze, telegram

app = FastAPI(
    title="ReportSaathi API",
    description="Educational AI assistant that explains medical laboratory reports in simple language.",
    version="1.0.0"
)

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router, prefix="/api")
app.include_router(telegram.router, prefix="/api")

@app.get("/")
def root():
    return {
        "app": "ReportSaathi API",
        "status": "online",
        "docs_url": "/docs",
        "health_url": "/api/health"
    }

@app.get("/api/health")
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ReportSaathi API",
        "ocr_engine": "Tesseract OCR",
        "pdf_engine": "pdfplumber",
        "telegram_bot_configured": bool(settings.TELEGRAM_BOT_TOKEN),
        "endpoints": {
            "analyze": "POST /api/reports/analyze",
            "chat": "POST /api/reports/chat",
            "telegram_webhook": "POST /api/telegram/webhook",
            "health": "GET /api/health",
            "docs": "GET /docs"
        }
    }
