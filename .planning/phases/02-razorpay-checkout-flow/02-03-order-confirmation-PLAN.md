---
wave: 3
depends_on: [02-02]
files_modified:
  - src/app/order/[orderId]/confirmation/page.tsx
  - src/lib/data.ts
autonomous: true
requirements: [CHK-04]
---

# Plan 02-03: Order Confirmation Page

<objective>
Create the `/order/[orderId]/confirmation` page that the user is redirected to after successful payment and server-side verification. This completes the checkout flow by showing the user a clear confirmation of their purchase.
</objective>

<tasks>

## Task 1: Add Order Fetching to Data Layer

<task>
<read_first>
- src/lib/data.ts
- src/lib/firebase/admin.ts
</read_first>
<action>
Add a `getOrderById(orderId: string)` function to `src/lib/data.ts`:
1. Verify session cookie → extract uid
2. Fetch from `adminDb.collection("orders").doc(orderId).get()`
3. Validate that `order.userId === uid` (security: users can only see their own orders)
4. Return the order data or null if not found/unauthorized

Define the `Order` TypeScript interface:
```typescript
export interface Order {
  id: string;
  userId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  status: "paid" | "failed";
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  createdAt: any; // Firestore Timestamp
}
```
</action>
<acceptance_criteria>
- `src/lib/data.ts` exports `getOrderById` function
- `src/lib/data.ts` exports `Order` interface
- Function validates `order.userId === uid` for authorization
- Function returns null for non-existent orders or unauthorized access
</acceptance_criteria>
</task>

## Task 2: Create Order Confirmation Page

<task>
<read_first>
- src/app/cart/page.tsx (design reference)
- src/lib/data.ts
</read_first>
<action>
Create `src/app/order/[orderId]/confirmation/page.tsx` as a Server Component:

1. Export `generateMetadata` that returns `{ title: "Order Confirmed" }`
2. Extract `orderId` from params
3. Fetch order via `getOrderById(orderId)`
4. If order is null → redirect to `/account` or show not-found
5. Render confirmation with editorial design language matching the store:

Layout:
```
<Navbar />
<main>
  <header>
    <CheckCircle icon />
    <h1> "Order Confirmed" (serif, editorial) </h1>
    <p> "Thank you for your purchase" </p>
  </header>

  <section "Order Details">
    - Order ID (display orderId)
    - Razorpay Payment ID
    - Date of purchase
  </section>

  <section "Items">
    - Each item: name, variant, size, qty, price (₹)
  </section>

  <section "Shipping Address">
    - Full formatted address
  </section>

  <section "Summary">
    - Subtotal, Shipping, Total (₹)
  </section>

  <div "Actions">
    - "Continue Shopping" → link to /ready-to-wear
    - "View Orders" → link to /account (future: /account/orders)
  </div>
</main>
<Footer />
```

Style: match the boutique aesthetic — serif headings, tracking-wide uppercase labels, muted palette, generous whitespace. Use `var(--color-*)` CSS custom properties from the existing design system.
</action>
<acceptance_criteria>
- `src/app/order/[orderId]/confirmation/page.tsx` exists as Server Component
- Page fetches order by ID and verifies ownership
- Page displays order ID, payment ID, items, address, and total
- Page uses ₹ currency formatting
- Page has "Continue Shopping" and "View Orders" action links
- Page follows editorial design language (serif fonts, whitespace, CSS custom properties)
- Non-existent or unauthorized orders redirect appropriately
</acceptance_criteria>
</task>

</tasks>

<verification_criteria>
- `npm run build` succeeds with the dynamic `[orderId]` route
- Confirmation page renders with all order details
- Unauthorized access to another user's order is blocked
- Page matches boutique aesthetic
</verification_criteria>

<must_haves>
- Order fetching with UID authorization check
- Complete order details display (items, address, totals, Razorpay IDs)
- INR currency display
- Editorial design consistency
</must_haves>
