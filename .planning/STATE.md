---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: planning
stopped_at: Session resumed, ready to Plan Phase 4
last_updated: "2026-03-29T12:40:00.000Z"
progress:
  total_phases: 4
  completed_phases: 3
  total_plans: 9
  completed_plans: 9
---

# Next.js Server & Client State Tracking

## Current Position

- **Phase:** 04 / 04 — Catalog Extensibility
- **Plans:** 0 / 3 completed (next: 04-01)
- **Status:** Ready to plan

## Project Memory

- **Authentication Setup:** The user intends to map Firebase Auth closely alongside the Firebase Admin SDK to sidestep traditional React component unmounting issues with generic Next.js token logic. A `users` mirror needs to be established in Firestore right away during Phase 1.
- **Razorpay Strategy:** We are verifying subtotals actively inside Server Actions rather than JS-client cart outputs to prevent frontend value manipulation.
- **Cart Scoping Decision (Phase 02-01):** Cart data and mutations must always use session-verified `users/{uid}/cart`; `/cart` route is forced dynamic to enable cookie access during render. Prices render in INR with `toLocaleString('en-IN')`.
- **Checkout Integration (Phase 02-02):** Razorpay orders are created server-side from Firestore-priced carts, staged in `pendingOrders`, HMAC-verified on return, and persisted to `orders`. `/checkout` is protected and dynamic; login honors `returnUrl` to send users back post-auth.
- **Order Management (Phase 03):** Orders persist subtotal/shipping/total with server timestamps and receipt; helpers `getUserOrders`/`getAllOrders` power `/account/orders` and `/admin/orders`.

## Session Continuity

Last session: 2026-03-29
Stopped at: Session resumed, ready to Plan Phase 4
Resume file: None
