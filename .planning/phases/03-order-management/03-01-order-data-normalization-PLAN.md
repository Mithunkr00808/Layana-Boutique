---
wave: 1
depends_on: []
files_modified:
  - src/app/checkout/actions.ts
  - src/lib/data.ts
autonomous: true
requirements: [CHK-04]
---

# Plan 03-01: Order Data Normalization & Queries

<objective>
Normalize stored order documents for reliable totals/sorting and add helpers to query orders for users and admins.
</objective>

<tasks>

## Task 1: Enhance Order Persistence

<task>
<read_first>
- src/app/checkout/actions.ts
</read_first>
<action>
Update `verifyPayment` persistence payload to include:
- `subtotal`: sum of line item `rawPrice * quantity` (INR)
- `shipping`: hardcode 0 for now
- `total`: `subtotal + shipping` (INR)
- `createdAt`: Firestore server timestamp (use `admin.firestore.FieldValue.serverTimestamp()`)
- `receipt`: mirror `razorpayPaymentId` for display/reference

Keep existing Razorpay IDs/signature fields. Ensure paise values stored by Razorpay are not lost: if `amount` (paise) exists, still store `total` in INR for convenience.
</action>
<acceptance_criteria>
- New orders contain `subtotal`, `shipping`, `total`, `createdAt`, and `receipt`.
- Existing fields (razorpayOrderId/paymentId/signature, items) remain.
</acceptance_criteria>
</task>

## Task 2: Add Order Query Helpers

<task>
<read_first>
- src/lib/data.ts
- src/lib/firebase/admin.ts
</read_first>
<action>
Add helpers:
- `getUserOrders(limit?: number)`: session-cookie → uid, fetch `orders` where `userId == uid`, order by `createdAt` desc, map totals to INR numbers, include items and address, default limit reasonable (e.g., 20).
- `getAllOrders()`: fetch all orders ordered by `createdAt` desc for admin views; include userId, payment IDs, totals.
Both helpers must tolerate legacy docs lacking `total/createdAt` by computing totals from items and using null-friendly dates.
</action>
<acceptance_criteria>
- Helpers return arrays of orders with numeric totals and ISO dates/Date objects suitable for display.
- Unauthorized access in `getUserOrders` returns an empty array (not throwing).
</acceptance_criteria>
</task>

</tasks>

<verification_criteria>
- Creating a new order via checkout persists subtotal/shipping/total/createdAt/receipt.
- `getUserOrders` returns only the current user's orders, sorted newest first.
- `getAllOrders` returns all orders, sorted newest first.
</verification_criteria>

<must_haves>
- Server timestamps on orders.
- INR totals stored and queryable.
- UID scoping for user-facing queries.
</must_haves>
