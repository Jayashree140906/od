# 🤝 CampusFlow – Friend & Collaborator Transfer Guide

Hello! Welcome to **CampusFlow** – an automated Student On-Duty (OD) & Leave Management System with Automatic Attendance Integration.

This package contains the complete full-stack source code, pre-configured database seeder, test suite, and interactive frontend.

---

## ⚡ 1-Minute Quickstart

### Step 1: Requirements
Make sure you have:
1. **Node.js** (v18 or newer) – [Download Node.js](https://nodejs.org)
2. **MongoDB** – Either:
   - A local MongoDB instance running on `mongodb://127.0.0.1:27017`
   - **OR** a free [MongoDB Atlas Cloud](https://www.mongodb.com/cloud/atlas) connection string (just paste it into `server/.env` under `MONGODB_URI`)

---

### Step 2: One-Click Setup

#### On Mac or Linux:
Open Terminal in the extracted project folder and run:
```bash
bash setup.sh
```

#### On Windows:
Double-click `setup.bat` **or** open Command Prompt / PowerShell and run:
```cmd
setup.bat
```

#### Manual Setup (Alternative):
If you prefer manual terminal commands:
```bash
npm install
npm --prefix backend install
npm --prefix frontend install
npm --prefix backend run seed
```

---

### Step 3: Start the Application

In your terminal root directory, run:
```bash
npm run dev
```

This single command starts **both** the backend and frontend simultaneously!

- 🌐 **Web Application**: [http://localhost:5173](http://localhost:5173)
- 📡 **Backend REST API**: [http://localhost:5050/api/v1](http://localhost:5050/api/v1)
- 📚 **Interactive Swagger API Docs**: [http://localhost:5050/api-docs](http://localhost:5050/api-docs)

---

## 🔑 Pre-Seeded Demo Accounts

The system comes pre-loaded with realistic demo data:

| Role | Email | Password | Persona |
|---|---|---|---|
| **Student** | `student@campusflow.edu` | `Student@123` | Alex Johnson (`21CSR042`), CSE-A |
| **Faculty Advisor** | `faculty@campusflow.edu` | `Faculty@123` | Prof. Grace Hopper, Class Advisor |
| **HOD** | `hod@campusflow.edu` | `Hod@123` | Dr. Alan Turing, Head of Department |
| **Administrator** | `admin@campusflow.edu` | `Admin@123` | Dr. Sarah Jenkins, System Admin |

> 💡 **Tip**: When you open the web application at [http://localhost:5173](http://localhost:5173), there is a **Live Demo Role Switcher bar** at the very top. You can click any role button to switch between Student, Faculty, HOD, and Admin without re-typing passwords!

---

## 🧪 Run Automated Integration Tests

To verify that the database, state engine, and APIs are 100% operational:
```bash
npm test
```
*(All 13 integration tests will run and display green checkmarks!)*

---

## 📁 Project Structure

```
campusflow/
├── frontend/            # React 19 + TypeScript + Tailwind CSS Frontend (Vercel-ready)
│   ├── src/
│   │   ├── pages/       # Portals for Student, Faculty, HOD, and Admin
│   │   ├── layouts/     # AppLayout with collapsible sidebar & topbar
│   │   ├── components/  # Badges, Notifications, Switcher
│   │   └── services/    # Axios API client (configurable for Vercel)
│   ├── vercel.json      # Single Page App routing configuration
│   └── vite.config.ts
├── backend/             # Node.js + Express.js + TypeScript Backend (Render-ready)
│   ├── src/
│   │   ├── controllers/ # Auth, OD, Leave, Attendance, Timetable, Admin
│   │   ├── services/    # Approval FSM, Attendance Sync, PDF generator
│   │   ├── models/      # Mongoose Schemas & MongoDB Indexes
│   │   └── tests/       # Vitest & Supertest integration suite
│   └── render.yaml      # Render blueprint configuration
├── docs/                # Architecture, DB Schema, and API specifications
├── setup.sh             # Mac/Linux automated setup script
├── setup.bat            # Windows automated setup script
├── package-project.sh   # Clean zip generator for sharing
└── README.md            # Comprehensive project overview & Deployment Guide
```

---

## 🚀 Hosting: Vercel (Frontend) & Render (Backend)

### Deploy Backend to Render:
1. In Render Dashboard, click **New Web Service** and connect this repository.
2. Set **Root Directory**: `backend`
3. Set **Build Command**: `npm install && npm run build`
4. Set **Start Command**: `npm start`
5. Add Environment Variables:
   - `MONGODB_URI`: your MongoDB Atlas connection string
   - `JWT_SECRET`: your secret key (or generate random)
   - `CLIENT_URL`: your Vercel deployment URL (e.g. `https://your-app.vercel.app`)
   - `NODE_ENV`: `production`

### Deploy Frontend to Vercel:
1. In Vercel Dashboard, click **Add New Project** and select this repository.
2. Set **Root Directory**: `frontend`
3. Framework Preset will auto-detect as **Vite**.
4. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://your-backend.onrender.com/api/v1`
5. Click **Deploy**!

---

## ❓ Troubleshooting

1. **MongoDB Connection Error:**
   - If using local MongoDB, make sure MongoDB is running (`brew services start mongodb-community` or `mongod`).
   - If using MongoDB Atlas, paste the connection string into `backend/.env`:
     ```env
     MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/campusflow
     ```

2. **Port Conflicts:**
   - Backend runs on port `5050` (to avoid macOS AirPlay on port 5000).
   - Frontend runs on port `5173`.
   - Both can be changed in `backend/.env` and `frontend/.env` if needed.
