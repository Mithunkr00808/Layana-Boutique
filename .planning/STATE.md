---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: planning
stopped_at: Session resumed, proceeding to Execute Phase 2 (Plan 02-03)
last_updated: "2026-03-29T11:37:50.058Z"
progress:
  total_phases: 4
  completed_phases: 3
  total_plans: 7
  completed_plans: 7
---

# Next.js Server & Client State Tracking

## Current Position

Phase: 03 (order-management) — EXECUTING
Plan: Not started

- **Phase:** 4
- **Plans:** 2 / 3 completed (next: 02-03 Order Confirmation)
- **Status:** Ready to plan

## Project Memory

- **Authentication Setup:** The user intends to map Firebase Auth closely alongside the Firebase Admin SDK to sidestep traditional React component unmounting issues with generic Next.js token logic. A `users` mirror needs to be established in Firestore right away during Phase 1.
- **Razorpay Strategy:** We are verifying subtotals actively inside Server Actions rather than JS-client cart outputs to prevent frontend value manipulation.
- **Cart Scoping Decision (Phase 02-01):** Cart data and mutations must always use session-verified `users/{uid}/cart`; `/cart` route is forced dynamic to enable cookie access during render. Prices render in INR with `toLocaleString('en-IN')`.
- **Checkout Integration (Phase 02-02):** Razorpay orders are created server-side from Firestore-priced carts, staged in `pendingOrders`, HMAC-verified on return, and persisted to `orders`. `/checkout` is protected and dynamic; login honors `returnUrl` to send users back post-auth.

## Session Continuity

Last session: 2026-03-29
Stopped at: Session resumed, proceeding to Execute Phase 2 (Plan 02-03)
Resume file: None
