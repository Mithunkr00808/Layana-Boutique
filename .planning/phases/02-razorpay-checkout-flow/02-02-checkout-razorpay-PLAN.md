---
wave: 2
depends_on: [02-01]
files_modified:
  - src/lib/razorpay.ts
  - src/app/checkout/page.tsx
  - src/app/checkout/actions.ts
  - src/app/checkout/CheckoutClient.tsx
  - src/middleware.ts
  - src/components/CartSummary.tsx
  - package.json
  - .env.local
autonomous: true
requirements: [CHK-01, CHK-02, CHK-03]
---

# Plan 02-02: Checkout Page & Razorpay Integration

<objective>
Build the `/checkout` page with address selection, order review, and Razorpay payment modal. Implement the complete 3-step payment flow: (1) Server Action creates Razorpay order with server-computed totals, (2) Client opens Razorpay checkout modal, (3) Server Action verifies payment signature using HMAC SHA256. Includes all loading states (blur overlays) and error/cancel handling per user decisions D-06 through D-10.
</objective>

<tasks>

## Task 1: Install Razorpay SDK & Create Utility

<task>
<read_first>
- package.json
- .env.local
- src/lib/firebase/admin.ts
</read_first>
<action>
1. Run `npm install razorpay`
2. Create `src/lib/razorpay.ts`:
```typescript
import Razorpay from "razorpay";

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});
```
3. Add to `.env.local`:
```
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_placeholder
RAZORPAY_KEY_ID=rzp_test_placeholder
RAZORPAY_KEY_SECRET=placeholder_secret
```
Note: `NEXT_PUBLIC_RAZORPAY_KEY_ID` is the client-exposed key_id. `RAZORPAY_KEY_SECRET` is server-only.
</action>
<acceptance_criteria>
- `package.json` contains `"razorpay"` in dependencies
- `src/lib/razorpay.ts` exists and exports `razorpay` instance
- `src/lib/razorpay.ts` uses `process.env.RAZORPAY_KEY_ID` (NOT the NEXT_PUBLIC variant for server-side)
- `.env.local` contains `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_ID`, and `RAZORPAY_KEY_SECRET`
</acceptance_criteria>
</task>

## Task 2: Create Checkout Server Actions

<task>
<read_first>
- src/lib/razorpay.ts
- src/lib/data.ts
- src/app/cart/actions.ts
- src/lib/firebase/admin.ts
</read_first>
<action>
Create `src/app/checkout/actions.ts` with "use server" directive containing:

**`createOrder(addressId: string)`:**
1. Verify session cookie → extract uid
2. Fetch user's cart from `users/{uid}/cart`
3. For EACH cart item, fetch `rawPrice` from `adminDb.collection('products')` or `adminDb.collection('productDetails')` — NEVER trust the cart's rawPrice
4. Compute `subtotal` from Firestore-fetched prices × quantities
5. Call `razorpay.orders.create({ amount: subtotal * 100, currency: "INR", receipt: "receipt_" + Date.now() })`
6. Store the `razorpay_order_id` along with computed line items in a temporary `pendingOrders/{orderId}` document
7. Return `{ orderId: order.id, amount: order.amount, currency: order.currency }`

**`verifyPayment(data: { razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string, addressId: string })`:**
1. Verify session cookie → extract uid
2. Compute expected signature: `crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!).update(data.razorpay_order_id + "|" + data.razorpay_payment_id).digest("hex")`
3. Compare against `data.razorpay_signature` — if mismatch, return `{ success: false, error: "Invalid signature" }`
4. Fetch the pending order from `pendingOrders/{razorpay_order_id}` to get the verified line items
5. Fetch the selected address from `users/{uid}/addresses/{addressId}`
6. Create order document in `orders` collection with `status: "paid"`, items snapshot, address snapshot, all Razorpay IDs
7. Clear user's cart: delete all docs in `users/{uid}/cart`
8. Delete the `pendingOrders` doc (cleanup)
9. Return `{ success: true, orderId: orderDoc.id }`
</action>
<acceptance_criteria>
- `src/app/checkout/actions.ts` contains `"use server"` directive
- `createOrder` function fetches prices from Firestore products collection, NOT from cart items
- `createOrder` calls `razorpay.orders.create` with amount in paise (× 100)
- `verifyPayment` uses `crypto.createHmac("sha256", ...)` with `order_id + "|" + payment_id`
- `verifyPayment` creates document in `orders` collection with `status: "paid"`
- `verifyPayment` calls cart clearing AFTER order creation (never before)
- Both functions verify session cookie via `adminAuth.verifySessionCookie`
</acceptance_criteria>
</task>

## Task 3: Create Checkout Page (Server Component)

<task>
<read_first>
- src/app/cart/page.tsx
- src/lib/data.ts
- src/app/account/addresses/page.tsx
</read_first>
<action>
Create `src/app/checkout/page.tsx` as a Server Component:

1. Export metadata: `{ title: "Checkout", description: "Complete your purchase" }`
2. Fetch user's cart items via `getCartItemsForUser()`
3. Fetch user's saved addresses from `users/{uid}/addresses` (create a `getUserAddresses()` function in `data.ts` if not already present)
4. If cart is empty, redirect to `/cart`
5. If no saved addresses, show a prompt to add one (link to `/account/addresses`)
6. Render the `CheckoutClient` component (Task 4) passing `items`, `addresses`, and server-computed `subtotal`
7. Follow the editorial design language: Navbar, serif headings, generous whitespace, muted palette matching `CartPage`

Layout structure:
```
<Navbar />
<main>
  <header> "Checkout" (serif, editorial) </header>
  <div grid 12-col>
    <CheckoutClient items={items} addresses={addresses} subtotal={subtotal} />
  </div>
</main>
<Footer />
```
</action>
<acceptance_criteria>
- `src/app/checkout/page.tsx` exists as a Server Component (no "use client")
- File exports `metadata` with title "Checkout"
- Page fetches cart items and addresses server-side
- Page redirects to `/cart` if cart is empty (using `redirect` from `next/navigation`)
- Page renders `CheckoutClient` with items, addresses, and subtotal props
- Page includes `<Navbar />` and `<Footer />`
</acceptance_criteria>
</task>

## Task 4: Create CheckoutClient Component

<task>
<read_first>
- src/components/CartSummary.tsx
- src/app/checkout/actions.ts
- src/app/account/addresses/page.tsx
</read_first>
<action>
Create `src/app/checkout/CheckoutClient.tsx` as a "use client" component:

**Props:** `{ items: CartItem[], addresses: Address[], subtotal: number }`

**Sections:**
1. **Address Selection** — Radio group of saved addresses. Each shows name, street, city, state, pincode. "Add new address" link to `/account/addresses?return=/checkout`.
2. **Order Review** — Line items list showing name, variant, size, quantity, price (₹). Subtotal, shipping ("Complimentary"), total.
3. **Pay Now Button** — Disabled until address is selected.

**Payment Flow on "Pay Now" click:**
1. Set `paymentState` to `"creating"` → show blur overlay with "Securing your payment…"
2. Call `createOrder(selectedAddressId)` Server Action
3. On success: instantiate `new Razorpay(options)` and call `rzp.open()`
4. Remove the "creating" overlay when Razorpay modal opens

**Razorpay options:**
```typescript
{
  key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  amount: order.amount,
  currency: order.currency,
  order_id: order.id,
  name: "Layana Boutique",
  description: "Your curated selection",
  handler: async (response) => {
    setPaymentState("verifying"); // "Confirming your payment…"
    const result = await verifyPayment({ ...response, addressId });
    if (result.success) {
      router.push(`/order/${result.orderId}/confirmation`);
    } else {
      setPaymentState("failed");
    }
  },
  modal: {
    ondismiss: () => {
      showToast("Payment cancelled"); // subtle, auto-dismiss
      setPaymentState("idle");
    }
  },
  theme: { color: "#1B1C1C" } // match boutique dark primary
}
```

**States:**
- `idle` — normal checkout form
- `creating` — blur overlay: "Securing your payment…"
- `verifying` — blur overlay: "Confirming your payment…"
- `failed` — inline message "Payment failed. Please try again." + "Retry" button that reopens Razorpay in one click (preserves all state)

**Blur overlay:** translucent backdrop-blur with centered text, Framer Motion fade in/out. No hard blocks.

**Toast:** lightweight auto-dismiss after 4 seconds for "Payment cancelled". Fixed bottom-right, subtle slide-in animation.

Load Razorpay script via `<Script src="https://checkout.razorpay.com/v1/checkout.js" />`.
</action>
<acceptance_criteria>
- `src/app/checkout/CheckoutClient.tsx` exists with `"use client"` directive
- Component renders address selection radio group
- Component renders order review with ₹ prices
- Component imports and calls `createOrder` and `verifyPayment` from `./actions`
- Component loads `https://checkout.razorpay.com/v1/checkout.js` via `next/script`
- Component has 4 payment states: idle, creating, verifying, failed
- "creating" state shows blur overlay with "Securing your payment…"
- "verifying" state shows blur overlay with "Confirming your payment…"
- "failed" state shows inline "Payment failed. Please try again." with retry button
- `modal.ondismiss` handler sets state to idle and shows toast
- `handler` callback calls `verifyPayment` then `router.push` on success
- Retry button reopens Razorpay without resetting address or cart state
</acceptance_criteria>
</task>

## Task 5: Wire CartSummary "Proceed to Checkout" Button

<task>
<read_first>
- src/components/CartSummary.tsx
</read_first>
<action>
Update `src/components/CartSummary.tsx`:
1. Import `useRouter` from `next/navigation`
2. Wire the "Proceed to Checkout" button's `onClick` to `router.push("/checkout")`
3. Disable the button when `items.length === 0`
</action>
<acceptance_criteria>
- `src/components/CartSummary.tsx` imports `useRouter` from `next/navigation`
- "Proceed to Checkout" button calls `router.push("/checkout")` on click
- Button is disabled when items array is empty
</acceptance_criteria>
</task>

## Task 6: Protect /checkout Route in Middleware

<task>
<read_first>
- src/middleware.ts
</read_first>
<action>
Update `src/middleware.ts` to add `/checkout` to the list of protected routes that require authentication. If no session cookie is present, redirect to `/login?returnUrl=/checkout`.
</action>
<acceptance_criteria>
- `src/middleware.ts` protects `/checkout` route
- Unauthenticated access to `/checkout` redirects to `/login`
- Redirect includes `returnUrl=/checkout` query parameter
</acceptance_criteria>
</task>

</tasks>

<verification_criteria>
- `npm run build` succeeds
- `/checkout` page renders address selection and order review
- Razorpay SDK loads via Script tag
- Server Action computes totals from Firestore prices (not client values)
- Payment signature verification uses HMAC SHA256
- All 4 payment states function correctly (idle, creating, verifying, failed)
- Cart is cleared only after successful verification
- Unauthenticated users are redirected from `/checkout`
</verification_criteria>

<must_haves>
- Server-side price recomputation (CHK-02)
- Razorpay modal opens with correct INR pricing (CHK-01)
- HMAC SHA256 signature verification (CHK-03)
- Order document created with status "paid" (CHK-04 partial)
- Blur overlay loading states per user decisions D-09
- No state loss on failure/cancel per user decisions D-06, D-07, D-08, D-10
</must_haves>
