# HotelPro — Task Backlog

## Epic 1: Environment Setup & Configuration
**Goal:** Prepare the development environment and configure all required services.

| # | Task | Acceptance Criteria |
|---|------|---------------------|
| 1.1 | Install Node.js backend dependencies (express, mongoose, bcryptjs, jsonwebtoken, cors, dotenv) | `npm install` completes without errors; `package.json` lists all deps |
| 1.2 | Configure `.env` file with MongoDB URI, JWT secret, email credentials, port | App reads env vars at startup; no hard-coded secrets in source |
| 1.3 | Verify MongoDB connection and confirm all collections are reachable | Server starts and connects; seed script populates test data successfully |

---

## Epic 2: Database Design & Models
**Goal:** Define and validate all MongoDB collections and Mongoose schemas.

| # | Task | Acceptance Criteria |
|---|------|---------------------|
| 2.1 | Design & implement User, Room, RoomCategory, Hotel schemas | Models export correctly; validation rejects invalid payloads |
| 2.2 | Design & implement Booking, Payment, CheckInOut schemas | Booking enforces date overlap prevention; Payment links to Booking |
| 2.3 | Design & implement Notification, ServiceRequest, AdminLog, Review, Report schemas | All models index key query fields; `models/index.js` exports all |

---

## Epic 3: Application Development
**Goal:** Build Guest, Staff, and Admin modules with full CRUD and business logic.

| # | Task | Acceptance Criteria |
|---|------|---------------------|
| 3.1 | Guest: registration, login, profile management | JWT issued on login; bcrypt hashes passwords; profile update validates fields |
| 3.2 | Guest: room browsing, search by category, booking, payment, history | Room availability checked before booking; duplicate booking rejected |
| 3.3 | Guest: cancellation & refund, reviews & ratings, notifications | Cancellation policy applied (24h → 100%, <24h → 80%); notification created |
| 3.4 | Staff: check-in/check-out management, room status updates | CheckInOut record created; Room status transitions correctly |
| 3.5 | Staff: housekeeping management, service request handling, customer support | ServiceRequest lifecycle (open → assigned → completed) enforced |
| 3.6 | Admin: room inventory, pricing, seasonal pricing updates, availability tracking | Admin-only routes return 403 to guests/staff |
| 3.7 | Admin: booking approval & modifications, staff assignment, occupancy monitoring | Occupancy report aggregates checked_in bookings correctly |
| 3.8 | Shared: email confirmations, invoice generation, review system | Invoice contains all line items; email sent on booking confirmation |

---

## Epic 4: Role-Based Security
**Goal:** Enforce JWT authentication and RBAC across all routes.

| # | Task | Acceptance Criteria |
|---|------|---------------------|
| 4.1 | Implement JWT middleware for protected routes | Unauthenticated requests return 401; expired tokens rejected |
| 4.2 | Implement role-based authorization (Guest, Staff, Admin) | Cross-role access returns 403; tests cover all role boundaries |
| 4.3 | Input validation & sanitization on all API endpoints | Malformed inputs return 400 with descriptive messages |
| 4.4 | Activity logging & audit trail via AdminLog model | Every admin action creates an AdminLog entry |

---

## Epic 5: Frontend Integration
**Goal:** Build a responsive React UI connected to the backend API.

| # | Task | Acceptance Criteria |
|---|------|---------------------|
| 5.1 | Guest UI: Home, Room Listing, Room Details, Booking Form, Payment Portal | End-to-end booking flow completes without JS errors |
| 5.2 | Guest UI: Guest Dashboard, Booking History, Notifications Center, Reviews | All panels render real API data; empty states handled gracefully |
| 5.3 | Staff UI: Check-In/Out management, Housekeeping, Service Requests dashboards | Staff cannot access admin-only routes via UI |
| 5.4 | Admin UI: Management Dashboard, Reports & Analytics, User/Hotel/Staff management | Charts render occupancy and revenue metrics from API |
| 5.5 | Responsive design, pagination, dynamic search filters | All pages pass mobile viewport tests; search filters debounce correctly |

---

## Epic 6: Testing & Validation
**Goal:** Verify all system components through automated and manual testing.

| # | Task | Acceptance Criteria |
|---|------|---------------------|
| 6.1 | Authentication tests: registration, login, JWT validation, role-based access | All auth paths tested; no hard-coded credentials in test fixtures |
| 6.2 | Booking workflow tests: search, reserve, confirm, modify, cancel | Overlap booking rejected; refund amounts calculated correctly |
| 6.3 | Payment tests: processing, verification, invoice generation, refund handling | Payment states transition correctly; invoice totals match booking |
| 6.4 | Hotel operations tests: availability, check-in/out, housekeeping, occupancy | Room status machine transitions validated end-to-end |
| 6.5 | Admin tests: user management, booking reports, payment audits, security monitoring | Admin log populated; report aggregations match database state |
