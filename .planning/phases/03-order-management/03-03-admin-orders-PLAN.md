---
wave: 3
depends_on: [03-01]
files_modified:
  - src/app/admin/layout.tsx
  - src/app/admin/orders/page.tsx
  - src/lib/data.ts
autonomous: true
requirements: [ADM-01]
---

# Plan 03-03: Admin Orders Table

<objective>
Add an admin orders view that lists all orders with totals, payment references, and user IDs, consistent with existing admin catalog styling.
</objective>

<tasks>

## Task 1: Admin Orders Listing

<task>
<read_first>
- src/app/admin/layout.tsx
- src/app/admin/catalog/page.tsx
- src/lib/data.ts
</read_first>
<action>
Create `src/app/admin/orders/page.tsx` (Server Component, `dynamic = "force-dynamic"`):
- Fetch orders via `getAllOrders()` sorted by created date desc.
- Table columns: Order ID, User ID, Payment ID, Status, Total (₹), Created date.
- Action/link to view details (can be same page anchor or future detail route).
</action>
<acceptance_criteria>
- Table renders all orders; totals display in INR; dates formatted.
- Handles missing totals/createdAt by showing fallback “—” and computed totals when needed.
</acceptance_criteria>
</task>

## Task 2: Navigation Hookup

<task>
<read_first>
- src/app/admin/layout.tsx
</read_first>
<action>
Add an “Orders” nav link alongside Catalog/Storefront pointing to `/admin/orders`.
</action>
<acceptance_criteria>
- Admin header shows Orders link; navigation works.
</acceptance_criteria>
</task>

</tasks>

<verification_criteria>
- `npm run build` passes.
- Admin orders page renders with data and no client JS errors.
</verification_criteria>

<must_haves>
- All orders visible to admin.
- INR totals and clear payment references.
- Layout matches existing admin table aesthetic.
</must_haves>
