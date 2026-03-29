---
wave: 2
depends_on: [03-01]
files_modified:
  - src/app/account/orders/page.tsx
  - src/lib/data.ts
  - src/middleware.ts
autonomous: true
requirements: [ACC-01]
---

# Plan 03-02: Customer Order History Page

<objective>
Surface the authenticated user’s past orders at `/account/orders`, styled in the boutique editorial language, using server-side data with UID scoping.
</objective>

<tasks>

## Task 1: Build Orders Page (Server Component)

<task>
<read_first>
- src/app/account/page.tsx
- src/lib/data.ts
- src/middleware.ts
</read_first>
<action>
Create `src/app/account/orders/page.tsx` (Server Component, `dynamic = "force-dynamic"`):
- Fetch orders via `getUserOrders()`.
- If unauthenticated, middleware handles redirect; page assumes user.
- Empty state: friendly message + CTA to `/ready-to-wear`.
- List cards: order id, payment id, status pill, date, item count, total (₹), and expandable item list (name, size, qty, line total).
- Provide links to `/order/[orderId]/confirmation` and back to shopping.
</action>
<acceptance_criteria>
- Authenticated users see only their orders.
- INR formatting throughout.
- Empty state renders when no orders.
- Links resolve correctly; page uses boutique fonts/spacings consistent with `/account`.
</acceptance_criteria>
</task>

## Task 2: Protect Route in Middleware

<task>
<read_first>
- src/middleware.ts
</read_first>
<action>
Add `/account/orders` to protected routes. Ensure login redirect preserves `returnUrl=/account/orders`.
</action>
<acceptance_criteria>
- Unauthenticated access to `/account/orders` redirects to login with returnUrl set.
</acceptance_criteria>
</task>

</tasks>

<verification_criteria>
- `npm run build` passes.
- Logged-out user redirected to login; logged-in user sees their orders sorted by date.
- Totals and line items match Firestore data; INR formatted.
</verification_criteria>

<must_haves>
- UID-scoped orders.
- Boutique editorial styling.
- Resilient to missing totals/createdAt (fallback gracefully).
</must_haves>
