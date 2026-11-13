# ReportSaathi — Comprehensive Project & QA Manual

**ReportSaathi** is an educational, privacy-first web application and companion bot that simplifies complex medical laboratory test reports into plain-language explanations.

---

## 1. Required APIs & Environment Variables

| Variable Name | Required? | Service | Where to Obtain | Purpose |
|---|---|---|---|---|
| `GEMINI_API_KEY` | **Recommended** | Google AI Studio | [aistudio.google.com](https://aistudio.google.com) | Powers plain-language explanations, biomarker mapping, and report chat. (Fallback grounded parser activates if missing). |
| `VITE_BACKEND_URL` | **Required (Frontend)** | Local or Render Backend | e.g. `http://127.0.0.1:8000` | Points the React client to your FastAPI backend server. |
| `VITE_SUPABASE_URL` | *Optional* | Supabase | [supabase.com](https://supabase.com) | Enables authenticated user profiles and private report history. |
| `VITE_SUPABASE_ANON_KEY` | *Optional* | Supabase | [supabase.com](https://supabase.com) | Client-side anon key enforcing database Row Level Security (RLS). |
| `TELEGRAM_BOT_TOKEN` | *Optional* | Telegram BotFather | `@BotFather` on Telegram | Enables the optional companion Telegram bot. |
| `TESSERACT_CMD` | *Optional (Windows only)* | Tesseract OCR | System PATH | Path to Tesseract binary (default `tesseract`). |

---

## 2. Local Setup & Execution

### Backend (FastAPI + Python 3.13)
```powershell
# 1. Open Terminal 1 and enter backend folder
cd backend

# 2. Activate virtual environment
.\venv\Scripts\Activate.ps1

# 3. Start development server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- API & Docs: `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/api/health`

### Frontend (React + Vite + Tailwind CSS)
```powershell
# 1. Open Terminal 2 and enter frontend folder
cd frontend

# 2. Start Vite server
npm run dev
```
- Web Application: `http://127.0.0.1:5173/`

### Optional Telegram Bot Poller
```powershell
cd backend
.\venv\Scripts\python run_telegram_bot.py
```

---

## 3. QA Test Commands & Automated Results

To run the automated backend test suite:
```powershell
cd backend
.\venv\Scripts\python -m pytest tests/ -o pythonpath=.
```
**Test Coverage Includes:**
- `GET /api/health`: Validates service and OCR engine readiness.
- `POST /api/reports/analyze` (Validation): Rejects unsupported extensions (`.txt`, `.docx`) with `400 Bad Request`.
- `POST /api/reports/analyze` (Size & Empty): Rejects 0-byte or oversized files.
- `POST /api/reports/chat` (Strict Grounding): Returns out-of-scope flags when queries exceed report context.
- Production Frontend: `npm run build` compiles with 0 errors.

---

## 4. Production Deployment Blueprint

### A. Backend on Render (Web Service)
1. **Repository**: Connect your GitHub repository to Render.
2. **Environment**: Python 3 (or Docker).
3. **Build Command**:
   ```bash
   pip install -r requirements.txt
   ```
4. **Start Command**:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
5. **System Dependencies (OCR)**: On Render native Linux environments, add `apt-get update && apt-get install -y tesseract-ocr` via a `render-build.sh` script or use a Docker container.
6. **Environment Variables on Render**:
   - `GEMINI_API_KEY`: Your Google AI Studio API Key.
   - `FRONTEND_URL`: URL of your deployed Cloudflare Pages app.

### B. Frontend on Cloudflare Pages
1. **Connect Repo**: Point Cloudflare Pages to your repository.
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build`
4. **Build Output Directory**: `dist`
5. **Environment Variables on Cloudflare**:
   - `VITE_BACKEND_URL`: Your live Render backend URL (e.g. `https://reportsaathi-api.onrender.com`).
   - `VITE_SUPABASE_URL`: (Optional) Your Supabase URL.
   - `VITE_SUPABASE_ANON_KEY`: (Optional) Your Supabase Anon Key.

---

## 5. Final QA Checklist & Current Limitations

### QA Checklist
- [x] Responsive layout tested across mobile, tablet, and desktop viewports.
- [x] File upload validation rejects disallowed types and files >10MB.
- [x] OCR failure handling gracefully prompts for a clearer scan if characters <10.
- [x] Gemini structured JSON extraction strictly distinguishes verbatim facts from AI context.
- [x] Hallucination prevention: Unstated reference intervals are left `null` and flagged.
- [x] Chat strictly bounded to active report context.
- [x] Supabase Row Level Security ensures users can only query their own history.
- [x] Privacy First: Uploaded binaries and raw OCR text are discarded from memory and never stored in the database.

### Remaining System Limitations
1. **Handwritten Prescriptions / Notes**: Tesseract OCR is trained for machine-printed typography; cursive doctor notes or handwritten margins will yield lower accuracy than printed laboratory reports.
2. **Tesseract Linux Binary**: When deploying to free-tier cloud containers (Render/Heroku), the system `tesseract-ocr` package must be installed at build time via Dockerfile or buildpack.
3. **Telegram Webhook HTTPS Requirement**: When running the Telegram bot in production webhook mode, Telegram requires a public HTTPS domain. Local polling (`run_telegram_bot.py`) can be used for testing without an HTTPS domain.
