# Layana Boutique 2.0: Commerce & Accounts

## Context
**What This Is:** A massive expansion to the Layana Boutique architecture. Evolving the platform from a static-like brochure with a cart into a fully functional, self-serving e-commerce engine with authenticated users, secure payments, search features, and a scalable admin panel.

**Why It Matters (Core Value):** Customers need a secure way to actually purchase items (Razorpay) while retaining a personalized experience (Accounts & Wishlists). Administrators need true independence from the codebase, requiring native image uploads (Firebase Storage) rather than static URLs.

## Requirements

### Validated
- ✓ **Product Catalog Engine** — Live catalog pulling from `products` and `productDetails` Firestore collections with safe hydrations.
- ✓ **Interactive Cart** — Real-time synced cart additions using Next.js Server Actions.
- ✓ **Admin Catalog UI** — A secure backend to manage product documents and text data.
- ✓ **SEC-01**: User Authentication (Login, Signup) tracking session state globally. *(Validated in Phase 1)*
- ✓ **ACC-01**: User Accounts Dashboard (Saved shipping addresses, Wishlist management). *(Validated in Phase 1)*

### Active
- [ ] **CHK-01**: Razorpay Checkout Integration securely processing payments.
- [ ] **ORD-01**: Post-checkout Order Confirmation and user email receipts.
- [ ] **ADM-01**: Order management listing in the existing Admin Panel.
- [ ] **ADM-02**: Native Firebase Storage integration on the Admin `ProductForm` to upload real images instead of external URLs.
- [ ] **CAT-01**: Advanced storefront filtering (categories, size, price hooks) and direct text searching.

### Out of Scope
- [ ] Multiple currency support (Sticking to INR/Razorpay native standard for V1)
- [ ] Automated shipping carrier integrations (e.g. FedEx/DHL) — flat rate/free shipping logic only for now.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Razorpay Gateway | Specifically chosen by stakeholder for regional payment flow | — Pending |
| Firebase Storage | Already deep into the Firebase ecosystem (Firestore), provides seamless native integration without AWS buckets | — Pending |

---
*Last updated: Today after initialization*

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
