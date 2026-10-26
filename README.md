# SkillTwin AI: An Intelligent Career Digital Twin for Students

> **Final-Year B.Tech Computer Science and Business Systems (CSBS) Project**  
> A full-stack, career intelligence platform that creates a student digital twin to diagnose skill gaps, parse resumes, administer coding assessments, and generate deterministic 4-week learning roadmaps.

---

## 🌟 System Architecture Overview

SkillTwin AI is built as a production-grade full-stack SaaS platform designed with human-centered principles:

```
[ Frontend: React 18 + TypeScript + Vite + Tailwind CSS ]
                         │
                    HTTP / REST (JWT Bearer Token)
                         ▼
[ Backend: FastAPI (Python 3.12) + SQLAlchemy 2.0 ORM ]
      │                   │                     │
      ▼                   ▼                     ▼
[ Rule-Based Engine ] [ PDF Plumber Parser ] [ SQLite / PostgreSQL ]
- Skill-Gap Logic     - Keyword Extraction    - User Isolation
- 4-Week Roadmap      - ATS Suggestions       - Full Audit Trail
- STAR Evaluator      - Resume Keyword Sync   - ACID Transactions
```

---

## 🚀 Key Functional Modules

1. **Student Career Digital Twin (`/career-twin`)**  
   Aggregates self-reported skills, resume keywords, project/certification assets, and verified coding assessment results into a unified profile.
2. **Deterministic Skill-Gap Engine (`/skill-gap`)**  
   Calculates `skill_gap = max(0, required_level - current_level)` against industry benchmark roles (Java Developer, Python Developer, ML Engineer, Data Scientist, etc.) with transparent readiness scoring.
3. **Personalized 4-Week Learning Roadmap (`/roadmap`)**  
   Adaptive schedule categorizing high, medium, and low-priority gaps into actionable study activities, with persistent task completion tracking.
4. **Real PDF Resume Analyzer (`/resume`)**  
   Extracts text using `pdfplumber`, detects technical keywords, identifies missing role skills, and allows students to sync detected skills to their profile.
5. **Technical Coding Assessments (`/assessment`)**  
   Timed multiple-choice assessments across Java, Python, and Data Structures & Algorithms with backend answer evaluation and explanation breakdowns.
6. **Communication & Interview Practice (`/communication`)**  
   Evaluates written responses to HR, technical, and STAR-method situational prompts with structured feedback and improvement suggestions.
7. **Projects & Certifications CRUD (`/projects`)**  
   Full CRUD management for student portfolios, GitHub repository links, and credential verification.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Router v6, Axios, Recharts, Lucide React
- **Backend:** Python 3.12, FastAPI, Uvicorn, SQLAlchemy 2.0, Pydantic v2, Python-Jose (JWT), Bcrypt
- **Database:** Persistent SQLite (local development) / PostgreSQL-compatible schema
- **PDF Extraction:** `pdfplumber`

---

## 💻 Local Setup & Execution Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm 9+

### 1. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- API Root: `http://127.0.0.1:8000`
- Interactive Swagger API Docs: `http://127.0.0.1:8000/docs`

### 2. Frontend Setup
```bash
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```
- Frontend Application: `http://localhost:5173`

---

## 🧪 Comprehensive Verification & Test Suite

The project includes an end-to-end automated integration test suite verifying all 13 critical workflows:

```bash
cd backend
.\venv\Scripts\python.exe test_full_system.py
```

### Verified Test Results:
- `[PASS]` Root API endpoint operational
- `[PASS]` Test 1: Student registration & JWT token generation
- `[PASS]` Test 2: Login authentication & credential verification
- `[PASS]` Test 3: Student profile and technical skills persistence
- `[PASS]` Test 4: Deterministic skill-gap calculations against benchmarks
- `[PASS]` Test 5: 4-week roadmap generation from real gaps
- `[PASS]` Test 6: Roadmap task completion persistence
- `[PASS]` Test 7: Coding assessment evaluation and score storage
- `[PASS]` Test 8: Real PDF resume extraction (`pdfplumber` keyword detection)
- `[PASS]` Test 9: Projects & Certifications CRUD operations
- `[PASS]` Test 10: Dashboard summary asset aggregation
- `[PASS]` Test 11: Multi-tenant security & student data isolation
- `[PASS]` Test 12: Communication answer evaluation
- `[PASS]` Test 13: Database restart persistence (`test_restart_persistence.py`)

---

## 🌐 Production Deployment

### Frontend (Vercel)
1. Push repository to GitHub.
2. Import repository in Vercel with root directory set to `frontend`.
3. Set build command: `npm run build` and output directory: `dist`.
4. Add environment variable: `VITE_API_BASE_URL=https://your-backend-domain.com/api`.
5. Deploy (preconfigured `vercel.json` handles client-side routing).

### Backend (Render / Railway / AWS EC2)
1. Set root directory to `backend`.
2. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
3. Environment variables:
   - `DATABASE_URL`: `postgresql://user:pass@host:5432/skilltwin` (or default SQLite)
   - `SECRET_KEY`: `strong-random-production-secret-at-least-32-chars`
   - `FRONTEND_ORIGIN`: `https://your-frontend-domain.vercel.app`
