# Mantra4Change — PBL Program Intelligence Dashboard

A full-stack web application for monitoring Project-Based Learning (PBL) programs across schools, generating grant reports, and providing leadership review summaries.

---

## Architecture

```
mantra4change-pbl/
├── frontend/       React + Vite + TypeScript + TailwindCSS + Recharts
│   └── src/
│       ├── pages/       Dashboard, Districts, GrantReport, ReviewSummary
│       ├── components/  UI, Charts, Filters, Layout
│       ├── hooks/       usePBLData, useGrantData
│       ├── services/    HTTP clients (pbl, grant)
│       ├── types/       TypeScript interfaces
│       ├── utils/       Risk classification (client-side mirror)
│       └── constants/   Colors, months, API base
│
├── backend/        Node.js + Express + TypeScript
│   ├── src/
│   │   ├── app.ts           Entry point, Express setup
│   │   ├── controllers/     Request handlers
│   │   ├── services/        Business logic (pbl, grant, risk, ai)
│   │   ├── routes/          Express routers
│   │   ├── middleware/       CORS, error handling
│   │   ├── utils/           CSV parser, risk engine
│   │   └── types/           Shared TypeScript interfaces
│   └── data/
│       ├── pbl/             july_2025.csv, august_2025.csv, september_2025.csv
│       └── grants/          grant_finance.csv, grant_performance.csv, grant_media.csv
│
└── README.md

Data Flow:
CSV Files → csvParser → Services → Controllers → REST API → React Hooks → Pages
                                                      ↓
                                              Anthropic API (AI narratives only)
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm 9+

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 2: Configure Backend Environment

```bash
cp .env.example .env
# Edit .env and set ANTHROPIC_API_KEY (optional — app works without it)
```

### Step 3: Start the Backend

```bash
npm run dev
# Server starts on http://localhost:3001
```

### Step 4: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### Step 5: Start the Frontend

```bash
npm run dev
# App opens on http://localhost:5173
```

### Step 6: Open the App

Navigate to `http://localhost:5173` in your browser.

---

## Data Model

### PBL Data (backend/data/pbl/)

Each CSV row represents one school's monthly report:

| Column | Description |
|--------|-------------|
| Reporting Month | July/August/September 2025 |
| School Code | Unique identifier (SCH001–SCH060) |
| District / Block | Geographic grouping |
| PBL Conducted | Yes/No — whether PBL session happened |
| Evidence Submitted | Yes/No — whether documentation was uploaded |
| Enrollment Class 6/7/8 | Student count per grade |
| Attendance Class 6/7/8 Science/Math | Actual attendees |
| Total Enrollment / Attendance | Aggregated |
| Attendance Rate | totalAttendance / totalEnrollment |
| Risk Status | Derived from Attendance Rate via risk engine |

### Grant Data (backend/data/grants/)

**grant_finance.csv** — Budget lines per grant per month  
**grant_performance.csv** — PBL/Evidence/Attendance KPIs per grant per month  
**grant_media.csv** — Photos, videos, documents linked to grants  

---

## Risk Logic

Risk classification is **always deterministic code** — never AI:

```typescript
export function classifyRisk(rate: number): string {
  if (rate >= 0.75) return 'On Track';   // Green
  if (rate >= 0.60) return 'Behind';     // Yellow
  if (rate >= 0.35) return 'At Risk';    // Orange
  return 'Critical';                      // Red  (<35%)
}
```

Thresholds:
- **On Track** (≥75%): Program progressing well
- **Behind** (60–74%): Needs attention, not yet critical
- **At Risk** (35–59%): Significant intervention required
- **Critical** (<35%): Emergency response needed

---

## AI Workflow

AI is used **only** for narrative generation. All KPIs are computed deterministically first:

```
1. CSV data → Pure math → Computed Facts (attendance %, PBL rate, finance utilization, etc.)
2. User clicks "Generate AI Report"
3. Backend sends Computed Facts + grant context to Anthropic API (claude-sonnet-4-6)
4. Claude generates a 3-paragraph donor narrative using ONLY the provided facts
5. Response includes both [COMPUTED FACTS] and [AI NARRATIVE] sections
```

**Fallback behavior**: If `ANTHROPIC_API_KEY` is missing or invalid, the system shows a deterministic text summary instead of an AI narrative. All other features work normally.

---

## API Endpoints

### PBL Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pbl/summary` | Overall KPIs with optional filters |
| GET | `/api/pbl/districts` | District-block breakdown |
| GET | `/api/pbl/months` | Month-over-month comparison |
| GET | `/api/pbl/filters` | Available filter values |

**Query params for `/api/pbl/summary` and `/api/pbl/districts`:**
- `month` — e.g., `July 2025`
- `district` — e.g., `District A`
- `block` — e.g., `Block 001`
- `subject` — e.g., `Science & Math`

### Grant Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/grants` | List all grants |
| GET | `/api/grants/:grantId/report` | Full grant report (finance + performance + media) |
| GET | `/api/grants/:grantId/months` | Available months for a grant |
| POST | `/api/grants/generate-narrative` | Generate AI narrative |

**POST `/api/grants/generate-narrative` body:**
```json
{
  "grantId": "GRANT_AA_2025",
  "month": "September 2025",
  "facts": { "PBL Completion Rate": "92.0%", ... }
}
```

### Review Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/review/summary` | Structured review summary for a month |

---

## Assumptions Made

1. **Data scope**: Three months (July–September 2025), 60 schools, 5 districts, 3 blocks per district.
2. **Attendance Rate formula**: `totalAttendance / totalEnrollment` (not distinct students).
3. **Evidence rate**: Percentage of all schools (not just PBL schools) that submitted evidence.
4. **MoM calculation**: Only available when both current and previous month exist in data.
5. **Grant-level PBL rates**: Stored in `grant_performance.csv` (pre-computed per grant per month), not re-derived from school-level data to allow grant-specific overrides.
6. **Finance units**: Abstract "units" (could represent INR thousands, headcount, etc.) — kept unit-agnostic.
7. **Media assets**: Metadata only — actual files are not managed by this system.

---

## Limitations

1. **No database**: All data is read from CSV files on every request. Not suitable for high-traffic production use.
2. **No authentication**: The API is open — add auth middleware before deploying publicly.
3. **No file uploads**: Evidence/media tracking is metadata-only.
4. **No real-time data**: CSV files must be manually updated or replaced.
5. **AI cost**: Anthropic API calls are billed per token — narrative generation is per-click, not cached.
6. **No pagination**: All district/school data is returned at once — fine for 60 schools, not for thousands.

---

## Production Readiness Notes

To productionize this application:

1. **Database**: Replace CSV parsing with PostgreSQL (use Prisma ORM). CSV import as a seeding step.
2. **Caching**: Add Redis cache for PBL summaries (TTL: 5 minutes). CSV files rarely change intra-day.
3. **Authentication**: Add JWT auth middleware. Role-based: Program Officers (read), Admins (write).
4. **Rate limiting**: Add express-rate-limit on the AI narrative endpoint (expensive API call).
5. **AI response caching**: Cache narrative outputs by (grantId + month) hash — same facts = same narrative.
6. **Environment**: Docker-compose for local dev; separate containers for frontend (nginx) and backend.
7. **Monitoring**: Add structured logging (pino) and health check endpoint already present at `/api/health`.
8. **Data validation**: Add Zod schemas for CSV row validation and API request bodies.

---

## Future Improvements

1. **CSV Upload UI**: Let program officers upload monthly data directly from the dashboard.
2. **Export to PDF**: One-click grant report PDF generation using puppeteer.
3. **Email Digest**: Scheduled weekly email summaries to leadership using cron + Nodemailer.
4. **Trend Analytics**: Predictive risk scoring using 3-month trend lines.
5. **School-level Drill Down**: Click on a district to see individual school cards.
6. **Comparative Benchmarking**: Compare district performance against national/state averages.
7. **Offline Support**: PWA with service worker for field officers with poor connectivity.
8. **Multilingual**: Hindi/regional language support for field staff.
