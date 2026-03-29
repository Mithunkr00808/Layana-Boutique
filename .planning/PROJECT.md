# Layana Boutique 2.0: Commerce & Accounts

## Context
**What This Is:** A fully functional, authenticated e-commerce experience for Layana Boutique: Firebase Auth-backed accounts with wishlists/addresses, Razorpay checkout with server-verified totals, order visibility for customers and admins, admin image uploads to Firebase Storage, and storefront filtering/search.

**Why It Matters (Core Value):** Customers can complete secure purchases with Razorpay while enjoying personalized accounts; administrators can manage catalog media without developer intervention and shoppers can find products quickly via filters/search.

## Requirements

### Validated (v1.0)
- ✓ **AUTH-01/02/03** — Email/password auth with SSR session persistence and secure logout.
- ✓ **ACC-01/02/03** — Orders page, saved addresses, wishlists tied to UID.
- ✓ **CHK-01/02/03/04** — Razorpay checkout, server recompute, HMAC verification, confirmation page/receipt hook.
- ✓ **ADM-01/02** — Admin orders view plus Firebase Storage image uploads.
- ✓ **CAT-01/02** — Category/size filtering and keyword search.
- ✓ **Product Catalog Engine** — Firestore-backed catalog with safe hydrations.
- ✓ **Interactive Cart** — Server Action-driven cart with INR pricing.
- ✓ **Admin Catalog UI** — Manage product docs/text data.

### Active (next milestones)
- [ ] **V2-01**: Guest Checkouts (Unauthenticated flow)
- [ ] **V2-02**: Cart abandoned email campaigns.
- [ ] **V2-03**: Apple Pay / Direct Wallet Integrations outside Razorpay standard flow.

### Out of Scope
- [ ] Multiple currency support (sticking to INR/Razorpay native standard for V1).
- [ ] Automated shipping carrier integrations (flat rate shipping only for now).

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Razorpay Gateway | Stakeholder-required regional payment flow | ✓ Good |
| Firebase Storage | Keep media within Firebase ecosystem for simplicity and auth alignment | ✓ Good |
| Dynamic render for auth-dependent routes | Enables `cookies()` access on cart/checkout/confirmation | ✓ Good |
| Server-side price recompute before payment | Prevents client tampering and ensures Razorpay charge accuracy | ✓ Good |

---
*Last updated: 2026-03-29 after v1.0 milestone*

## Evolution
This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state
