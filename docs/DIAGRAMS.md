# HotelPro — System & Architecture Diagrams

This document contains visual diagrams for the HotelPro Management System rendered in high-resolution (300 DPI) PNG format.

To regenerate all diagrams programmatically at any time, run:
\`\`\`bash
npm run diagrams:generate
\`\`\`

The diagram files are stored in both `docs/diagrams/` and root `diagrams/`:
- `docs/diagrams/er_diagram.png`
- `docs/diagrams/system_architecture.png`
- `docs/diagrams/multi_agent_workflow.png`
- `docs/diagrams/booking_payment_sequence.png`

---

## 1. Entity-Relationship (ER) Diagram

Covers all 14 collections and models:
1. **User** — Primary account entity (Guest, Staff, Admin) with bcrypt hashed credentials and status.
2. **Guest** — Guest profile, travel preferences, and loyalty rewards tracking.
3. **Staff** — Employee roster with department assignment (`Housekeeping`, `Reception`, `Management`, `Maintenance`, `Concierge`) and shifts.
4. **Hotel** — Hotel property details, amenities, ratings, and operating policies.
5. **RoomCategory** — Room classifications (`Standard`, `Deluxe`, `Suite`, `Executive`), capacity, and base rates.
6. **Room** — Physical inventory, current state (`available`, `occupied`, `cleaning`, `maintenance`), floor, and features.
7. **Booking** — Core reservation lifecycle, double-booking prevention, dates, total charge, and status.
8. **Payment** — Financial settlement ledger, invoice numbers, card transactions, and refunds.
9. **Review** — Verified guest ratings (1-5 stars) and staff responses.
10. **Notification** — Multi-channel in-app and agent-generated alert feeds.
11. **ServiceRequest** — Guest service tickets (room cleaning, maintenance, concierge) with priority levels.
12. **CheckInOut** — Front desk physical log for check-in / check-out, keycard distribution, and room inspection.
13. **Report** — Executive telemetry snapshots (occupancy rates, RevPAR, revenue aggregates).
14. **AdminLog** — Immutable security and administrative audit trail.

![HotelPro ER Diagram](diagrams/er_diagram.png)

---

## 2. System Architecture Diagram

Highlights the MERN stack with Ponytail architectural governance, the autonomous Multi-Agent engine, and the Task Queue:
- **Presentation Tier**: React 18 + Vite SPA with Guest UI, Staff Console, and Admin Monitor.
- **Ponytail Governance**: Strict anti-overengineering standard, YAGNI, standard library first, zero framework bloat.
- **API Gateway & Guards**: Node.js + Express 4.21, JWT Authentication, RBAC (`guest`, `staff`, `admin`), IDOR protection, and atomic double-booking guards.
- **Multi-Agent Engine**: 5 domain agents (`BookingAgent`, `HousekeepingAgent`, `ConciergeAgent`, `BillingAgent`, `OperationsAgent`) coordinated by the `AgentOrchestrator`.
- **Task Workforce Queue**: Decoupled `tasks/` directory with `TaskRunner` managing task states (`pending` -> `running` -> `completed`/`failed`).
- **Data Persistence**: Mongoose 8 with active dual-mode fallback to in-memory store for 100% test autonomy.

![HotelPro System Architecture](diagrams/system_architecture.png)

---

## 3. Autonomous Multi-Agent Workflow & Task Queue

Details the execution pipeline and inter-agent communication:
- **Triggers**: HTTP REST APIs, scheduled cron tasks (`npm run agents:run`), and front desk actions.
- **Agent Orchestrator**: Intent mapping, priority dispatch, multi-step pipeline coordinator.
- **Task Workforce**: Atomic task scripts executed with telemetry and error isolation.
- **Inter-Agent Choreography**:
  * `BookingAgent` creates reservation -> notifies `BillingAgent`
  * `BillingAgent` settles payment -> triggers `ConciergeAgent` confirmation & `HousekeepingAgent` prep
  * `Staff` completes check-out -> `HousekeepingAgent` auto-dispatches cleaning -> `OperationsAgent` updates hotel occupancy.

![HotelPro Multi-Agent Workflow](diagrams/multi_agent_workflow.png)

---

## 4. Booking & Payment Lifecycle Sequence Diagram

Chronological trace of a reservation from room search through payment settlement and physical check-in:
1. **Search & Availability**: Query available rooms avoiding date overlaps.
2. **Booking Submission**: Authenticated request with RBAC checks and atomic collision detection.
3. **Payment Settlement**: IDOR verification ensuring ownership, unique invoice/transaction generation, and status commit.
4. **Post-Payment Actions**: Automated notifications sent to guest, room preparation queued for housekeeping.
5. **On-Site Stay Lifecycle**: Front desk check-in (keycard issued, room `occupied`) to check-out (room marked `cleaning`).

![HotelPro Booking & Payment Sequence](diagrams/booking_payment_sequence.png)
