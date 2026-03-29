---
phase: 02-razorpay-checkout-flow
plan: 02-02
subsystem: payments
tags: [razorpay, checkout, server-actions, hmac, firestore]
requires:
  - phase: 02-razorpay-checkout-flow
    provides: user-scoped cart totals from 02-01
provides:
  - Razorpay order creation + signature verification pipeline
  - Pending order staging and paid order persistence
  - Checkout UI with address selection and payment states
affects: [order-confirmation, cart]
tech-stack:
  added: [razorpay]
  patterns: [pendingOrders staging, HMAC verification, returnUrl-aware auth redirect]
key-files:
  created:
    - src/app/checkout/page.tsx
    - src/app/checkout/CheckoutClient.tsx
    - src/app/checkout/actions.ts
  modified:
    - src/lib/data.ts
    - src/components/CartSummary.tsx
    - src/middleware.ts
    - src/app/(auth)/login/page.tsx
key-decisions:
  - Force `/checkout` to render dynamically so session cookies can be read server-side.
  - Honor `returnUrl`/`callbackUrl` on login to send users back to protected routes post-auth.
patterns-established:
  - Checkout totals are always computed server-side from Firestore products/details before payment.
  - Razorpay verification uses HMAC SHA256 on `order_id|payment_id` with server secret.
requirements-completed: [CHK-01, CHK-03]
duration: 24min
completed: 2026-03-29
---

# Phase 02 Plan 02: Checkout & Razorpay Integration Summary

**Built the end-to-end Razorpay checkout: server-side order creation with verified totals, HMAC signature verification, staged order persistence, and a client flow with address selection, overlays, and retryable payment states.**

## Performance

- **Duration:** 24 min
- **Started:** 2026-03-29T11:20:00Z
- **Completed:** 2026-03-29T11:44:00Z
- **Tasks:** 6
- **Files modified:** 7

## Accomplishments
- Added server actions for `createOrder` and `verifyPayment` that recompute cart totals from Firestore and stage pending orders before clearing carts.
- Implemented checkout page and client UI with address selection, Razorpay modal launch, HMAC verification, and overlay states (creating/verifying/failed).
- Guarded `/checkout` behind middleware with returnUrl-aware redirect and wired cart CTA to navigate to checkout.

## Task Commits
1. **Install & utility** — `ffe26e2`
2. **Server actions & checkout UI** — `44c74e4`
3. **Route guard & navigation wiring** — `134408e`

**Plan metadata:** will be committed with docs update.

## Files Created/Modified
- `src/app/checkout/actions.ts` — Razorpay order creation and HMAC verification server actions.
- `src/app/checkout/page.tsx` — Dynamic server component fetching cart and addresses, rendering checkout.
- `src/app/checkout/CheckoutClient.tsx` — Client flow with address radios, Razorpay modal, payment states, toast.
- `src/lib/data.ts` — Added server-side address fetch helper.
- `src/components/CartSummary.tsx` — Button now routes to `/checkout`.
- `src/middleware.ts` — Protects `/checkout`, includes `returnUrl` for redirects.
- `src/app/(auth)/login/page.tsx` — Respects `returnUrl`/`callbackUrl` after login.

## Decisions Made
- Force `/checkout` dynamic rendering to allow session cookie access.
- Preserve and honor `returnUrl` so authenticated users return directly to the originally requested route.

## Deviations from Plan

### [Rule 3 - Blocking] Force dynamic rendering for checkout
- **Found during:** Build verification
- **Issue:** Static prerender failed because `cookies()` is used.
- **Fix:** Added `export const dynamic = "force-dynamic"` to `/checkout`.
- **Verification:** `npm run build` passes; route marked dynamic in build output.

### [Rule 1 - Bug] Redirect users back to requested route after login
- **Found during:** Middleware update
- **Issue:** Login page always pushed `/account`, ignoring return path.
- **Fix:** Login now reads `returnUrl`/`callbackUrl` query params to route users back (e.g., `/checkout`).
- **Verification:** Manual reasoning; middleware now sets `returnUrl` for protected routes.

**Total deviations:** 2 (1 blocking, 1 bug). **Impact:** Required for build success and correct post-login flow; no scope creep.

## Issues Encountered
- Static prerender error on `/checkout` (resolved by dynamic render flag).

## User Setup Required
None beyond Razorpay keys already noted in `.env.local`.

## Next Phase Readiness
- Razorpay flow implemented; proceed to Phase 02-03 order confirmation page to surface paid orders to users.

---
*Phase: 02-razorpay-checkout-flow*  
*Completed: 2026-03-29*
