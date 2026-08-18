# Employee Leave Management System (ELMS) — Mord Spark Pvt. Ltd.

[![Developed By](https://img.shields.io/badge/Developer-Fenil%20Dhanani-indigo?style=for-the-badge)](https://github.com/fenildhanani)
[![Company](https://img.shields.io/badge/Company-Mord%20Spark%20Pvt.%20Ltd.-cyan?style=for-the-badge)](https://mordspark.com)
[![Stack](https://img.shields.io/badge/Stack-MERN%20(Pure%20JavaScript)-green?style=for-the-badge)](https://reactjs.org)

A commercial-grade, multi-tenant Employee Leave Management System (ELMS) built for **Mord Spark Pvt. Ltd.** by **Fenil Dhanani** using the **MERN Stack** (**MongoDB Atlas, Express.js, React.js, Node.js**) strictly written in **100% pure JavaScript (`.js` and `.jsx`)**.

---

## Developer Credit & Company Profile
- **Lead Software Engineer & Architect**: **Fenil Dhanani**
- **Organization**: **Mord Spark Pvt. Ltd.** (Ahmedabad, Gujarat, India)
- **Timezone & Regional Format**: **Asia/Kolkata** (Indian Standard Time `en-IN`)

---

## Technical Stack & Architecture

### Backend Stack
- **Node.js & Express.js** (`.js`)
- **MongoDB Atlas Connection**: Pre-configured with MongoDB Cloud cluster
- **Authentication**: JWT (JSON Web Tokens) Bearer auth & `bcryptjs` password hashing
- **Security**: Multi-tenant company data isolation (`company: req.user.company`), `helmet`, `cors`
- **File Uploads**: `multer` middleware storing local receipts and medical attachments
- **Integrations Architecture**:
  - Stripe Subscription Billing (`stripe`)
  - Google Calendar OAuth & REST API
  - Microsoft Outlook Graph API
  - Payroll API deduction export engine
  - Nodemailer Email Service & Twilio SMS architecture

### Frontend Stack
- **React.js & Vite** (`.jsx` and `.js`) — *No TypeScript*
- **UI Styling**: Bootstrap 5 + Bootstrap Icons + custom glassmorphic SaaS styling (`index.css`)
- **Routing**: `react-router-dom` v6 with role-based `ProtectedRoute.jsx`
- **Calendar**: `@fullcalendar/react`, `@fullcalendar/daygrid`, `@fullcalendar/interaction`
- **Charts & Visualizations**: Recharts for HR & Manager analytics

---

## User Roles & Key Features

### 1. Employee Portal (`/employee/*`)
- **Dashboard**: Leave balance summary cards, attendance clock-in/out, recent applications, upcoming holidays.
- **Apply Leave**: Form with automatic day calculation excluding weekends & holidays, half-day session toggles, attachment upload, and balance validation.
- **My Leaves**: Filterable list of applications with cancellation capability for pending/approved leaves.
- **Leave Balances**: Detailed breakdown of annual allocation, carry-forward days, comp-off credits, used, and remaining days.
- **Attendance**: Daily clock-in/clock-out tracking with calculated working hours.
- **Comp-Off**: Request compensatory leave for weekend work.
- **Expenses**: Submit reimbursement claims with receipt file upload.
- **Calendar**: FullCalendar view of team availability and holidays.

### 2. Team Manager Portal (`/manager/*`)
- **Manager Dashboard**: Overview of pending approvals, team availability rates, and monthly leave trend charts.
- **Pending Approvals**: Review team leave applications with quick approval or rejection (requiring mandatory comment).
- **Team Directory**: Overview of direct reports.
- **Comp-Off & Expense Review**: Approve or reject weekend overtime and expense claims.
- **Team Reports**: Filterable CSV export for team leaves and expenses.

### 3. HR Admin Portal (`/admin/*`)
- **HR Master Dashboard**: Organization-wide metrics (Absenteeism rate, Leave utilization ratio, Team availability, Peak absence month).
- **Employee CRUD**: Full employee management with role assignments and automatic balance initialization.
- **Departments & Grades**: Manage company hierarchy and designations.
- **Leave Types Builder**: Create configurable leave types (Paid/Unpaid, Annual Allocation, Max Consecutive Days, Notice Period, Carry Forward, Medical Document requirement).
- **Leave Policies Matrix**: Override default allocations per department and grade.
- **Holidays Master**: Manage national, regional, and company holidays.
- **Analytics**: Interactive Recharts bar and pie charts.
- **Audit Logs**: Immutable log of security events and HR modifications.
- **Stripe Subscription**: Upgrade plans via Stripe Checkout (Free, Basic, Professional, Enterprise).
- **CSV Export Reports**: Export organization-wide leave and expense reports.

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB Atlas (Cloud connection string pre-configured in `.env`)

### 1. Backend Setup
```bash
cd backend
npm install
node seed/seed.js   # Seeds MongoDB Atlas database for Mord Spark
npm run dev         # Starts backend API on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev         # Starts Vite dev server on http://localhost:5173
```

---

## Demo Credentials (Seeded on MongoDB Atlas)

All passwords are initialized to: **`Password123!`**

| Role | Email | Password |
|---|---|---|
| **HR Admin** | `hradmin@elms.com` | `Password123!` |
| **Manager** | `manager1@elms.com` | `Password123!` |
| **Employee** | `employee@elms.com` | `Password123!` |

---

## Deployment Guide

### 1. Backend Deployment on Render (Node/Express API)
1. Sign up on [Render.com](https://render.com) and connect your GitHub repository.
2. Click **New +** -> **Web Service**.
3. Set **Root Directory**: `backend`
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `npm start`
6. Add Environment Variables:
   - `MONGO_URI`: `mongodb+srv://fenildhanani28_db_user:CO5j606mDJIFjzXR@cluster0.o43uoep.mongodb.net/employee_leave_management?retryWrites=true&w=majority`
   - `JWT_SECRET`: `super_secret_jwt_key_mord_spark_2026`
   - `CLIENT_URL`: `https://your-app-name.vercel.app`
7. Click **Deploy Web Service**.

### 2. Frontend Deployment on Vercel (React Vite)
1. Sign up on [Vercel.com](https://vercel.com) and import your GitHub repository.
2. Set **Root Directory**: `frontend`
3. Set **Build Command**: `npm run build`
4. Set **Output Directory**: `dist`
5. Add Environment Variable:
   - `VITE_API_URL`: `https://mord-spark-elms-backend.onrender.com/api` (Use your Render backend URL)
6. Click **Deploy**.

---

## Credits

Developed with ❤️ by **Fenil Dhanani** for **Mord Spark Pvt. Ltd.**.
