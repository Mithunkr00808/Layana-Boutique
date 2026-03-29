---
phase: 02-razorpay-checkout-flow
plan: 02-01
subsystem: payments
tags: [firebase, firestore, nextjs, server-actions, razorpay-prep]
requires:
  - phase: 01-auth-persistence
    provides: session cookies, UID extraction
provides:
  - user-scoped cart storage at users/{uid}/cart
  - INR price display formatting across cart UI
  - cart mutation helpers (remove/clear) for checkout flow
affects: [checkout, order-confirmation]
tech-stack:
  added: []
  patterns: [user-scoped Firestore collections, INR locale formatting helper]
key-files:
  created: []
  modified:
    - src/lib/data.ts
    - src/app/cart/actions.ts
    - src/app/cart/page.tsx
    - src/components/CartSummary.tsx
    - src/components/CartItems.tsx
    - src/data/mockData.ts
key-decisions:
  - Forced /cart to dynamic rendering to allow session-cookie access without static prerender failures.
patterns-established:
  - User cart data is always fetched/mutated via verified session cookie and users/{uid}/cart path.
  - Cart prices must render in INR using toLocaleString('en-IN').
requirements-completed: [CHK-02]
duration: 8min
completed: 2026-03-29
---

# Phase 02 Plan 01: Cart Scoping & Currency Migration Summary

**Scoped cart data to authenticated users’ Firestore carts and switched all cart pricing to INR with session-verified server actions.**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-29T11:06:00Z
- **Completed:** 2026-03-29T11:14:00Z
- **Tasks:** 4
- **Files modified:** 6

## Accomplishments
- Added session-verified cart data accessors and write helpers targeting `users/{uid}/cart`.
- Updated server actions to support quantity updates, removals, and cart clearing per user with cache revalidation.
- Converted cart UI to INR with Indian locale formatting and removal controls.
- Marked `/cart` as dynamic to avoid static rendering conflicts when reading cookies.

## Task Commits
1. **Task 1: User-scoped data layer** — `a57a5cd`
2. **Task 2: Cart mutations** — `b08396e`
3. **Task 3: INR display & remove CTA** — `e2d25da`
4. **Task 4: Dynamic cart page** — `58d7f35`

**Plan metadata:** will be committed with docs update.

## Files Created/Modified
- `src/lib/data.ts` — session-verified cart fetch/add helpers scoped to users/{uid}/cart.
- `src/app/cart/actions.ts` — user-scoped quantity update, remove, and clear actions with revalidation.
- `src/app/cart/page.tsx` — uses `getCartItemsForUser` and forces dynamic rendering.
- `src/components/CartSummary.tsx` — INR subtotal/total display.
- `src/components/CartItems.tsx` — INR line prices, remove action wiring.
- `src/data/mockData.ts` — mock cart prices converted to INR.

## Decisions Made
- Force `/cart` dynamic rendering to allow session cookies during build (prevents static prerender failure).

## Deviations from Plan

### [Rule 3 - Blocking] Marked /cart as dynamic to bypass static prerender error
- **Found during:** Task 1/4 (build verification)
- **Issue:** Next.js static generation failed because `cookies()` was used on a statically prerendered route.
- **Fix:** Added `export const dynamic = "force-dynamic";` to `/cart` to align with session-cookie access.
- **Files modified:** src/app/cart/page.tsx
- **Verification:** `npm run build` now succeeds; route stays server-rendered.

**Total deviations:** 1 auto-fixed (blocking). **Impact:** Required to allow session-based cart reads; no scope creep.

## Issues Encountered
- Static prerender failure on `/cart` (resolved by deviation above). No remaining issues.

## User Setup Required
None - no new external configuration needed beyond existing Firebase env vars.

## Next Phase Readiness
- Cart is user-scoped and priced in INR; ready for Razorpay checkout (Phase 02-02) and order confirmation (02-03).

---
*Phase: 02-razorpay-checkout-flow*  
*Completed: 2026-03-29*
