# Phase 2: Razorpay Checkout Flow - Context

**Gathered:** 2026-03-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Bridge the existing cart (`/cart`) to a secure Razorpay payments model. The "Proceed to Checkout" button navigates to a dedicated `/checkout` page where the user selects a saved address, reviews their order, and pays via the Razorpay modal. Server Actions verify totals independently from Firestore — never trusting client-side cart values. On success, an `orders` document is created, the cart is cleared, and the user is redirected to `/order/[orderId]/confirmation`.

</domain>

<decisions>
## Implementation Decisions

### Checkout Flow & Address Selection
- **D-01:** Clicking "Proceed to Checkout" on `/cart` navigates to a new `/checkout` page — NOT a modal or inline expansion.
- **D-02:** The `/checkout` page presents: (1) address selection from saved addresses (Phase 1's `users/{uid}/addresses` subcollection), (2) a full order review (line items, quantities, prices), and (3) a "Pay Now" button that opens the Razorpay modal.
- **D-03:** Users must be authenticated to access `/checkout`. Unauthenticated users clicking "Proceed to Checkout" should be redirected to `/login` with a return URL back to `/cart`.

### Cart Ownership & Currency
- **D-04:** The current shared `cartItems` collection MUST be scoped to authenticated users in this phase. Cart items should be stored under `users/{uid}/cart` or equivalent user-scoped path.
- **D-05:** All currency display switches from `€` to `₹` (INR). This applies globally: `CartSummary.tsx`, `CartItems.tsx`, product pages, and the checkout page. Razorpay is configured for INR natively.

### Payment UX & Error States
- **D-06:** On payment **failure** → stay on `/checkout`, show inline message "Payment failed. Please try again.", allow instant retry with no state reset. Never redirect on failure.
- **D-07:** On payment **cancel** → show a subtle toast "Payment cancelled". No redirect, no error state, no layout shift.
- **D-08:** Retry flow → must reopen Razorpay modal in one click. All selected address and cart state must be preserved across retries.
- **D-09:** Loading states are REQUIRED:
  - On pay click: soft blur overlay with "Securing your payment…"
  - On verification success callback: soft blur overlay with "Confirming your payment…"
  - Use translucent blur overlays only — NO hard UI blocks, NO abrupt transitions.
- **D-10:** RULE: Never lose user state, never redirect on failure, always show clear progress.

### Post-Payment Confirmation
- **D-11:** On successful Razorpay callback → show "Confirming your payment…" overlay → Server Action verifies signature with Razorpay API → creates `orders` document in Firestore with `status: 'paid'` → clears user's cart → redirects to `/order/[orderId]/confirmation`.
- **D-12:** NEVER clear the cart before server-side payment verification succeeds. Cart clearing is the LAST step before redirect.
- **D-13:** NEVER use a modal or inline success state. Always redirect to a dedicated confirmation page at `/order/[orderId]/confirmation`.

### Server-Side Security (from PROJECT.md)
- **D-14:** Subtotals MUST be recomputed inside the Server Action by fetching `rawPrice` values directly from Firestore `products`/`productDetails` collections — never from the client's cart array. This prevents price manipulation.
- **D-15:** Razorpay payment signature verification uses `razorpay_order_id + razorpay_payment_id + razorpay_signature` validated against the Razorpay secret key server-side.

### Agent's Discretion
- Exact Razorpay SDK integration pattern (standard checkout.js vs custom)
- Order document schema structure in Firestore
- Toast notification implementation (existing library or lightweight custom)
- Specific Framer Motion animation parameters for overlays

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Architecture
- `.planning/PROJECT.md` — Core e-commerce strategy, Razorpay decision rationale
- `.planning/REQUIREMENTS.md` — CHK-01 through CHK-04 acceptance criteria

### Existing Implementation
- `src/app/cart/page.tsx` — Current cart page (entry point for checkout)
- `src/components/CartSummary.tsx` — Current "Proceed to Checkout" button (needs wiring)
- `src/app/cart/actions.ts` — Existing Server Action pattern for cart mutations
- `src/lib/data.ts` — Data fetching layer, cart/product types
- `src/app/account/addresses/page.tsx` — Address CRUD (reuse address fetching for checkout)
- `src/lib/contexts/AuthContext.tsx` — Auth state for gating checkout access
- `src/middleware.ts` — Route protection middleware

### Phase 1 Context (Auth Decisions)
- `.planning/phases/01-auth-persistence/01-CONTEXT.md` — Session strategy (D-02: HTTP cookies via Server Actions)

</canonical_refs>

<specifics>
## Specific Ideas

- The blur overlay loading states should feel premium — consistent with the boutique aesthetic. Think frosted glass, not spinner.
- Toast for cancellation should be minimal — auto-dismiss after 3-4 seconds, non-blocking.
- The `/checkout` page should maintain the editorial design language of the rest of the store (serif headings, generous whitespace, muted palette).

</specifics>

<deferred>
## Deferred Ideas

- Order confirmation email/SMS receipts (CHK-04 — can be handled in Phase 3 with order management)
- Guest checkout flow (V2-01 — explicitly out of scope)

</deferred>

---

*Phase: 02-razorpay-checkout-flow*
*Context gathered: 2026-03-29 via interactive discussion*
