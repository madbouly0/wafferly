# Copilot Workspace Instructions for Wafferly

## Overview
Wafferly is a full-stack Amazon price tracker with a Python (Flask) backend and a Next.js/TypeScript frontend. This file provides conventions, build/test commands, and agent guidance for effective automation and onboarding.

---

## Build & Run Commands

### Backend (Python/Flask)
- **Install dependencies:**
  ```bash
  python -m venv .venv
  .venv\Scripts\Activate
  pip install -r requirements.txt
  ```
- **Run backend:**
  ```bash
  cd backend
  python run.py
  ```
- **Run scheduler (optional):**
  ```bash
  cd backend
  python scheduler.py
  ```
- **Manual test script:**
  ```bash
  cd backend
  python test_scrape.py
  ```

### Frontend (Next.js)
- **Install dependencies:**
  ```bash
  cd frontend
  npm install
  ```
- **Run frontend:**
  ```bash
  cd frontend
  npm run dev
  ```

---

## Project Structure & Conventions

### Backend
- Modular: `models/`, `routes/`, `scraper/`, `services/`, `utils.py`
- App factory pattern in `app/__init__.py`
- SQLAlchemy models with `to_dict()` for serialization
- Scraper logic isolated from API
- Email/scheduler logic in `services/`

### Frontend
- Next.js app directory (`app/`), modular components in `components/`
- API calls abstracted in `lib/api.ts`
- TypeScript types in `types/`
- Uses environment variable `NEXT_PUBLIC_API_URL`

---

## Environment Setup
- Python 3.11+, Node.js 18+, SQL Server Express, Chrome browser (for Selenium)
- Create `.env` in root with required variables (see README)
- Database must be created manually in SQL Server
- ChromeDriver or browser dependencies may be required for scraping

---

## Testing
- No automated test framework; use manual scripts (e.g., `test_scrape.py`)
- Frontend: No test setup by default; consider adding Jest/React Testing Library

---

## Agent Guidance
- Use provided build/run commands for automation
- Respect modular boundaries (do not mix scraping, API, and service logic)
- Use serialization methods for API responses
- Ensure environment variables are set before running
- If adding tests, follow project structure and suggest automation improvements

---

## Example Prompts
- "Add a new API route to fetch all tracked products."
- "Implement a Jest test for the ProductCard component."
- "Update the scraper to handle Amazon CAPTCHA."
- "Refactor email service to support multiple providers."

---

## Next Steps
- Consider adding automated test setup for both backend and frontend
- Propose agent customizations for test automation, environment validation, or database migration tasks
