# VOCX AI — Voice of Customer Intelligence Platform

**VOCX AI** is an enterprise-grade multilingual customer feedback intelligence platform focused on Indian regional languages. The platform ingests customer feedback across multiple channels (PlayStore, AppStore, Support Tickets, Twitter, Surveys), runs AI-powered Indic NLP pipelines, generates real-time business insights, and executes automated escalations.

---

## 🌟 Key Features

- **Multilingual Regional Intelligence**: Native support & script detection for Hindi, Tamil, Telugu, Kannada, Bengali, Marathi, Gujarati, Malayalam, Punjabi, Odia, Hinglish (code-mixed), and English.
- **Aspect-Based Sentiment Analysis (ABSA)**: Identifies sentiment across key operational dimensions:
  - *Customer Support*
  - *Product Quality*
  - *Pricing & Value*
  - *Delivery & Logistics*
  - *App UI & Performance*
  - *Billing & Payment*
- **Unified Cross-Lingual Analytics**: Automatically normalizes and translates regional text into English for uniform search, reporting, and dashboard metrics.
- **Urgency & Risk Escalations**: Identifies fraud, legal threats, and critical churn indicators to auto-trigger alert workflows.
- **Automation Rules Engine**: Flexible rule builder triggering Email Alerts, Slack Notifications, Jira Ticket creation, and Priority Escalations.
- **Interactive Live NLP Sandbox**: Test regional feedback scripts and view real-time model confidence, ABSA tags, and translation outputs.

---

## 🚀 Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons
- **Backend**: FastAPI, Python 3.11, Pydantic v2, PyJWT
- **Database & ORM**: PostgreSQL, SQLAlchemy 2.0 (with automatic SQLite fallback for zero-config local run)
- **ML & NLP**: Hugging Face Transformers, XLM-RoBERTa, IndicBERT, Sentence Transformers
- **Containerization**: Docker, Docker Compose

---

## 💻 Getting Started

### 1. Local Development (Standard Run)

#### Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
*API Swagger Docs available at:* `http://localhost:8000/docs`

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend application available at:* `http://localhost:5173`

---

### 2. Docker Compose Deployment

```bash
docker-compose up --build
```
- **Frontend App**: `http://localhost:5173`
- **FastAPI Service**: `http://localhost:8000`
- **PostgreSQL Database**: `localhost:5432`

---

## 🔑 Default Credentials

- **Admin Email**: `admin@vocx.ai`
- **Password**: `admin123`

---

## 📂 Project Architecture

```
vocx AI/
├── backend/
│   ├── app/
│   │   ├── api/          # FastAPI REST endpoints (v1)
│   │   ├── models/       # SQLAlchemy ORM models
│   │   ├── schemas/      # Pydantic data validation schemas
│   │   ├── services/     # NLP Engine, Feedback, Analytics, & Automation services
│   │   ├── utils/        # JWT security, Logger, & Seed dataset generator
│   │   ├── config.py     # Configuration settings
│   │   ├── database.py   # Database engine & session setup
│   │   └── main.py       # FastAPI application entry point
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/   # Dashboard, Feedback, Analytics & Automation UI widgets
│   │   ├── context/      # Authentication state context
│   │   ├── pages/        # Application views & pages
│   │   ├── services/     # Axios API service interfaces
│   │   ├── types/        # TypeScript interfaces
│   │   ├── App.tsx       # Main router setup
│   │   └── main.tsx      # React entry point
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
└── README.md
```
