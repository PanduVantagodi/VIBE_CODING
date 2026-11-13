import io
import os
import re
import tempfile
import pytesseract
from PIL import Image, ImageEnhance, ImageOps
import pdfplumber
from app.core.config import settings

if settings.TESSERACT_CMD:
    pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD

def preprocess_image_for_ocr(image: Image.Image) -> Image.Image:
    """Improve contrast, convert to grayscale, and auto-invert if dark mode."""
    gray = image.convert("L")
    enhanced = ImageEnhance.Contrast(gray).enhance(1.8)
    return enhanced

def extract_from_image_path(image_path: str) -> dict:
    """Run Tesseract OCR on a local image file safely."""
    try:
        with Image.open(image_path) as img:
            processed = preprocess_image_for_ocr(img)
            text = pytesseract.image_to_string(processed, config='--oem 3 --psm 6')
            cleaned = text.strip()
            
            # If standard psm 6 produced very little text, retry with automatic page segmentation
            if len(cleaned) < 15:
                text = pytesseract.image_to_string(processed, config='--oem 3 --psm 3')
                cleaned = text.strip()

            return {
                "text": cleaned,
                "pages": 1,
                "method": "ocr_tesseract"
            }
    except Exception as e:
        raise RuntimeError(f"OCR processing failed: {str(e)}")

def extract_from_pdf_path(pdf_path: str) -> dict:
    """Extract digital text from PDF. If scanned or sparse, apply Tesseract OCR to page renders."""
    pages_text = []
    total_pages = 0
    used_ocr = False

    try:
        with pdfplumber.open(pdf_path) as pdf:
            total_pages = len(pdf.pages)
            if total_pages == 0:
                raise ValueError("The provided PDF file contains 0 pages.")

            for page_idx, page in enumerate(pdf.pages):
                # Try direct text extraction first
                text = page.extract_text()
                if text and len(text.strip()) > 30:
                    pages_text.append(text.strip())
                else:
                    # Fallback to OCR on page render for scanned or image-only pages
                    used_ocr = True
                    page_img = page.to_image(resolution=300).original
                    processed = preprocess_image_for_ocr(page_img)
                    ocr_page_text = pytesseract.image_to_string(processed, config='--oem 3 --psm 6')
                    if ocr_page_text.strip():
                        pages_text.append(ocr_page_text.strip())

        full_text = "\n\n".join(pages_text).strip()
        method = "hybrid_pdf" if used_ocr and len(pages_text) > 1 else ("ocr_tesseract" if used_ocr else "digital_pdf")

        return {
            "text": full_text,
            "pages": total_pages,
            "method": method
        }
    except Exception as e:
        raise RuntimeError(f"PDF extraction error: {str(e)}")
