# CampusFlow – Smart Student OD & Leave Management System
### With Automatic Timetable & Attendance Integration

CampusFlow is an enterprise-grade full-stack web application designed to eliminate paper-based tracking and WhatsApp approvals for student On-Duty (OD) and leave requests across collegiate institutions.

---

## 🌟 Key Features

- **4 Role Personas (RBAC)**: Custom workflows and dashboards for **Student**, **Faculty Advisor**, **HOD**, and **Administrator**.
- **Digital OD & Leave Slips**: Multi-tier digital approval pipeline with immutable audit history.
- **Automatic Attendance Synchronization**: Approved OD requests automatically credit affected timetable periods as "Present" under college policy.
- **Overlapping Request Guard**: Intelligent detection preventing duplicate or conflicting applications for the same dates.
- **Timetable Engine**: Automatically calculates affected academic hours and course subjects for any selected date range.
- **Digital Certificates & PDF Receipts**: Generate and download official signed clearance certificates on demand.
- **In-App Notification Feed**: Real-time alerts for student submissions, faculty reviews, and HOD approvals.
- **Comprehensive Analytics & Exports**: Interactive Recharts analytics and one-click CSV register exports.
- **1-Click Live Demo Role Switcher**: Quick role switcher banner at the top of the app to effortlessly test all approval flows.

---

## 🛠️ Technology Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Lucide Icons, React Router, TanStack Query, Recharts.
- **Backend**: Node.js, Express.js, TypeScript, REST API under `/api/v1`, JWT Authentication (HTTP-only cookies + Bearer token), Zod Validation, Multer Uploads, PDFKit, Swagger UI.
- **Database**: MongoDB with Mongoose ODM, indexed schemas, and transactional data integrity.
- **Testing**: Vitest & Supertest automated test suite.

---

## 🔑 Demo Accounts (Pre-Seeded)

The database includes pre-configured demo accounts for immediate testing:

| Role | Email | Password | Persona & Department |
|---|---|---|---|
| **Student** | `student@campusflow.edu` | `Student@123` | Alex Johnson (21CSR042), CSE-A |
| **Faculty Advisor** | `faculty@campusflow.edu` | `Faculty@123` | Prof. Grace Hopper, Class Advisor |
| **HOD** | `hod@campusflow.edu` | `Hod@123` | Dr. Alan Turing, Head of CSE |
| **Administrator** | `admin@campusflow.edu` | `Admin@123` | Dr. Sarah Jenkins, System Administrator |

*(You can also click any role button directly in the login page or top switcher bar for instant 1-click access!)*

---

## 🚀 Quickstart & Setup Guide

### 1. Prerequisites
- Node.js 20+
- MongoDB instance running locally on `mongodb://127.0.0.1:27017`

### 2. Environment Configuration
The repository includes pre-configured environment files:
- Backend: `backend/.env` (and `backend/.env.example`)
- Frontend: `frontend/.env` (and `frontend/.env.example`)

### 3. Install Dependencies
```bash
# In backend directory:
cd backend
npm install

# In frontend directory:
cd ../frontend
npm install
```

### 4. Seed the Database
Populate the database with departments, classes, subjects, timetables, and demo requests:
```bash
npm --prefix backend run seed
```

### 5. Run the Automated Test Suite
Execute the 13 backend integration tests:
```bash
npm --prefix backend run test
```

### 6. Start the Servers Locally
You can run both simultaneously from the root:
```bash
npm run dev
```

Or run each service separately in two different terminal windows:

**Terminal 1 (Backend Server):**
```bash
cd backend
npm run dev
# Running on http://localhost:5050
# Health check: http://localhost:5050/api/v1/health
# Swagger Docs: http://localhost:5050/api-docs
```

**Terminal 2 (Frontend Client):**
```bash
cd frontend
npm run dev
# Running on http://localhost:5173
```

---

## 🌐 Production Deployment: Vercel & Render

### Frontend on Vercel
1. Import this repository in [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Framework Preset: **Vite** (auto-detected).
4. Add Environment Variable:
   - `VITE_API_BASE_URL` = `https://your-backend.onrender.com/api/v1`
5. Deploy! Single-page app routing is handled automatically by `frontend/vercel.json`.

### Backend on Render
1. Create a **New Web Service** on [Render](https://render.com).
2. Connect this repository and set:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
3. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string (`mongodb+srv://...`)
   - `JWT_SECRET`: Random secure string
   - `CLIENT_URL`: Your Vercel frontend URL (e.g. `https://your-frontend.vercel.app`)
   - `NODE_ENV`: `production`

---

## 📚 API Endpoints Summary

All endpoints are organized under `/api/v1`:

| Endpoint | Method | Role | Description |
|---|---|---|---|
| `/health` | `GET` | Public | System status & database connectivity |
| `/auth/login` | `POST` | Public | Authenticate user & issue JWT |
| `/auth/demo-users` | `GET` | Public | Retrieve demo accounts |
| `/od` | `POST` | Student | Submit new On-Duty request |
| `/od` | `GET` | Authenticated | List OD requests with filters |
| `/od/:id/approve` | `POST` | Faculty, HOD, Admin | Approve OD request |
| `/od/:id/reject` | `POST` | Faculty, HOD, Admin | Reject OD request with mandatory comment |
| `/od/:id/receipt` | `GET` | Authenticated | Download official PDF clearance pass |
| `/leave` | `POST` | Student | Submit new Leave request |
| `/attendance/my-stats`| `GET` | Student | Real-time attendance stats with OD credit |
| `/attendance/manual-update` | `POST` | Faculty, Admin | Manual attendance correction with audit log |
| `/timetable/calculate-affected` | `GET` | Authenticated | Map timetable periods for date range |
| `/admin/dashboard` | `GET` | HOD, Admin | Institutional summary statistics |
| `/admin/users` | `GET`, `POST` | Admin | Manage user directory |
| `/admin/policy` | `GET`, `PUT` | Admin | Configure attendance rules |
| `/reports/attendance/csv` | `GET` | Faculty, HOD, Admin | Export attendance register CSV |

---

## 📄 Documentation Directory

- [`docs/architecture.md`](docs/architecture.md): Architectural topology, RBAC matrix, and state machine.
- [`docs/api-documentation.md`](docs/api-documentation.md): Comprehensive REST API specifications and payload contracts.
- [`docs/database-schema.md`](docs/database-schema.md): Mongoose schemas, reference maps, and indexes.
- [`docs/testing-report.md`](docs/testing-report.md): Vitest and Supertest execution results.
