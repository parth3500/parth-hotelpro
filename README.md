# HotelPro — Modern Autonomous Multi-Agent Hotel Management System

HotelPro is a comprehensive, production-grade hotel management platform built with the MERN stack (MongoDB, Express, React, Node.js) and an autonomous multi-agent architecture. The system streamlines end-to-end hospitality operations—ranging from guest room discovery, real-time availability tracking, and concurrency-safe double-booking prevention to staff front-desk check-in/out, automated housekeeping workflows, and administrative financial auditing.

---

## 🔑 Demo & Seed Accounts

The system comes pre-configured with seed demo accounts for all three primary roles. The backend accepts both `password123` and `Test@123` across all demo accounts.

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Admin** | `admin@hotelpro.com` | `password123` *(or `Test@123`)* | Full administrative privileges, revenue & telemetry reports, user role management, room pricing & inventory control |
| **Staff** | `staff@hotelpro.com` | `password123` *(or `Test@123`)* | Operational front desk, guest check-in / check-out, room turnover, housekeeping status board, service tickets |
| **Guest** | `guest@hotelpro.com` | `password123` *(or `Test@123`)* | Room browsing, filtering, booking reservations, payment simulation, reservation history, review submission |

> **Note:** Demo credentials can also be auto-filled directly from the login screen (`/login`) via the Quick Demo Login selector.

---

## 🏗️ Architecture & Autonomous Multi-Agent Orchestration

HotelPro utilizes a decoupled multi-agent architecture designed to automate hospitality operations and eliminate human bottlenecks:

1. **Booking Agent (`agents/bookingAgent.js`):**
   - Evaluates availability and manages conflict resolution with concurrency-safe locking to prevent double bookings.
2. **Billing Agent (`agents/billingAgent.js`):**
   - Handles simulated payments, payment verification, and automatic invoice generation.
3. **Housekeeping Agent (`agents/housekeepingAgent.js`):**
   - Automatically marks rooms as `cleaning` upon guest checkout and monitors room status transitions.
4. **Concierge Agent (`agents/conciergeAgent.js`):**
   - Manages guest service requests, room preferences, and guest messaging.
5. **Operations Agent (`agents/operationsAgent.js`):**
   - Generates daily operational summaries, occupancy metrics, and audit logs.
6. **Agent Orchestrator (`agents/agentOrchestrator.js`):**
   - Coordinates cross-agent workflows and event queues.

Detailed architectural diagrams and sequence charts are available in [`docs/DIAGRAMS.md`](docs/DIAGRAMS.md) and the [`diagrams/`](diagrams/) directory.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+ recommended)
- npm / pnpm

### 1. Installation

Install dependencies for both root (backend + agents) and client:
```bash
# Install backend dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 2. Environment Configuration

Copy the example environment configuration:
```bash
cp .env.example .env
```
Default configuration runs with high-performance in-memory MongoDB simulation (`USE_MEMORY_DB=true`), requiring no external MongoDB daemon for development and automated testing.

### 3. Build Client Single Page Application

```bash
cd client
npm run build
cd ..
```

### 4. Seed Database & Run Server

Seed the database with sample hotels, rooms, categories, demo users, and bookings:
```bash
node server/config/seed.js
```

Start the unified server (serves both API and React SPA on port 5000):
```bash
npm start
# or
node server/server.js
```
The application will be live at `http://localhost:5000`.

---

## 🧪 Testing Suite

HotelPro includes an automated test runner covering all core routes, role-based access control (RBAC), IDOR security guards, double-booking prevention, and demo account authentication:

```bash
node tests/test-runner.js
```

**Test Coverage Highlights:**
- Health check & API telemetry (`/health`)
- User registration, duplicate checks, and password validation
- Multi-role authentication & profile update
- Single-Page Application (SPA) HTML fallback routing
- Double-booking conflict detection & overlap rejection (409 Conflict)
- IDOR security guards across guest reservations & payments
- Staff check-in / check-out workflows & room status transitions
- Demo account authentication for Admin, Staff, and Guest with both `password123` and `Test@123`

---

## 📹 Video Demo Generation

To record a full-fidelity headless browser walkthrough of all application views and compile the demonstration video (`parth-HotelPro-demo.mp4`):

```bash
# Ensure server is running on port 5000
node scripts/record_demo.js
```
The script captures screenshots of all guest, staff, and admin portals in 1280x720 HD, appends architecture sequence diagrams, and compiles an MP4 demo video using ffmpeg without voiceover.

---

## ⚡ Free-Tier Vercel Deployment

HotelPro is configured out-of-the-box for free-tier serverless deployment on Vercel:

- **Serverless API Function (`api/index.js`):** Wraps the Express backend and models, automatically managing database connectivity (seamlessly connecting to MongoDB or falling back to the high-performance in-memory store and seeding demo accounts on cold boot).
- **Static Frontend SPA (`vercel.json`):** Directs Vercel to compile and serve the Vite React frontend from `client/dist`, routing all `/api/(.*)` traffic to the serverless function and all frontend navigation to `/index.html`.
- **Automated Build Scripts (`package.json`):** Features top-level `"build"` and `"vercel-build"` commands (`cd client && npm install && npm run build`).

### Deploying to Vercel:
1. **Via Vercel Web Dashboard:**
   - Import your GitHub repository (`github.com/parth3500/parth-hotelpro`).
   - Framework Preset: **Vite** or **Other**.
   - Build Command: `npm run vercel-build` (detected automatically).
   - Output Directory: `client/dist` (defined in `vercel.json`).
   - (Optional) Set `MONGODB_URI` and `JWT_SECRET` in Environment Variables. If omitted, HotelPro runs gracefully in self-contained in-memory mode with preloaded demo data.
   - Click **Deploy**.

2. **Via Vercel CLI:**
   ```bash
   npm i -g vercel
   vercel deploy --prod
   ```

---

## 📡 Core API Endpoints

### Authentication
- `POST /api/register` — Register new guest account
- `POST /api/login` — Login with credentials (returns JWT token)
- `GET /api/profile` — Fetch current user profile
- `PUT /api/profile` — Update user profile details
- `POST /api/logout` — Logout user session

### Rooms
- `GET /api/rooms` — List all active rooms (supports filtering by category, price, capacity)
- `GET /api/rooms/available` — Search rooms available for specific date range
- `GET /api/rooms/:id` — Retrieve room specifications & amenities
- `POST /api/rooms` — Add new room (Admin only)
- `PUT /api/rooms/:id` — Update room pricing, capacity, or details (Admin only)

### Bookings & Reservations
- `POST /api/bookings` — Create reservation (with concurrency-safe double-booking guard)
- `GET /api/bookings` — List bookings (Guest sees own, Admin sees all)
- `GET /api/bookings/:id` — Get booking details (IDOR guarded)
- `PUT /api/bookings/:id/cancel` — Cancel reservation & calculate refund
- `POST /api/bookings/:id/checkin` — Guest check-in & key card assignment (Staff/Admin)
- `POST /api/bookings/:id/checkout` — Guest check-out & flag room for turnover (Staff/Admin)

### Payments & Invoicing
- `POST /api/payments` — Process payment for booking
- `GET /api/payments/:bookingId` — Fetch payment receipt (IDOR guarded)
- `GET /api/payments` — View all hotel transactions (Admin only)

### Staff & Admin Management
- `GET /api/staff/dashboard` — Real-time operational metrics & turnover queue
- `PUT /api/staff/room/:id/status` — Update room housekeeping status
- `GET /api/admin/reports` — High-level telemetry, occupancy rates, and financial reports
- `GET /api/admin/users` — List registered users
- `PUT /api/admin/users/:id` — Update user role or account status
