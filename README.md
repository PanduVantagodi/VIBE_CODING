# ReportSaathi

**ReportSaathi** is an educational web application designed to help patients understand complex medical laboratory test reports in simple, compassionate language.

---

## Architecture Overview

- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons, Axios.
- **Backend**: Python 3.13, FastAPI, Uvicorn, Pydantic v2.
- **OCR & Document Extraction**:
  - `pdfplumber` / `pypdf` for digital PDF vector text parsing.
  - `pytesseract` + `Pillow` image preconditioning (grayscale & contrast enhancement) for scans, photos, and images (`PNG`, `JPG`, `JPEG`).
- **Safety & Grounding**: Never invents or hallucinates missing lab values or reference intervals. Verbatim extraction only.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check endpoint reporting service, OCR, and parser readiness |
| `POST` | `/api/reports/analyze` | Accepts `multipart/form-data` file (`PDF`, `JPG`, `PNG` up to 10MB) and returns structured analysis |
| `GET` | `/docs` | Interactive Swagger API documentation |

---

## Setup & Running Locally

### 1. Backend Setup

```powershell
# Navigate to backend directory
cd backend

# Create and activate virtual environment (Python 3.13 recommended)
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install requirements
pip install -r requirements.txt

# Start FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The backend will be live at:
- API: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- Swagger Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health Check: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

---

### 2. Frontend Setup

```powershell
# In a new terminal, navigate to frontend directory
cd frontend

# Install npm packages
npm install

# Start Vite development server
npm run dev
```

The frontend will be live at:
- Web App: [http://127.0.0.1:5173/](http://127.0.0.1:5173/)

---

## File Validation & Error Handling
- **Size Limit**: Enforces a strict 10MB ceiling (returns `413 Request Entity Too Large`).
- **File Types**: Validates extensions `.pdf`, `.jpg`, `.jpeg`, `.png` (returns `400 Bad Request` on unsupported formats like `.txt` or `.docx`).
- **Empty / 0-byte Files**: Returns `400 Bad Request`.
- **Low OCR Quality**: Returns a graceful `"status": "unreadable"` response with instructions to upload a clearer document.
- **Safe Temporary Files**: Automatically cleans up and removes temporary files from disk even if processing raises an exception.
