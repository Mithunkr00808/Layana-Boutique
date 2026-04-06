# Phase 2: Razorpay Checkout Flow - Research

## Domain & Integration Pattern

### Razorpay Standard Checkout — 3-Step Flow
1. **Server → Create Order:** Use `razorpay` npm package. Call `razorpay.orders.create({ amount, currency: "INR", receipt })` from a Server Action. Amount is in **paise** (multiply by 100).
2. **Client → Open Modal:** Load `https://checkout.razorpay.com/v1/checkout.js` via `next/script`. Instantiate `new Razorpay(options)` with the `order_id` from step 1 and call `rzp.open()`.
3. **Server → Verify Signature:** The `handler` callback receives `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }`. Verify server-side using HMAC SHA256: `crypto.createHmac("sha256", KEY_SECRET).update(order_id + "|" + payment_id).digest("hex")` and compare against the signature.

### Required Dependencies
- `razorpay` — Server-side SDK for order creation
- `checkout.js` — Client-side script loaded via `next/script` (no npm install needed)

### Environment Variables Needed
```
NEXT_PUBLIC_RAZORPAY_KEY_ID=YOUR_RAZORPAY_KEY_ID    # Exposed to client (key_id only)
RAZORPAY_KEY_SECRET=YOUR_RAZORPAY_KEY_SECRET                      # Server-only, NEVER exposed
```

## Codebase Integration Points

### Existing Patterns to Follow
- **Server Actions:** `src/app/cart/actions.ts` uses `"use server"` + `adminDb` — new checkout actions follow same pattern
- **Firebase Admin:** `src/lib/firebase/admin.ts` exports `adminDb` and `adminAuth` — reuse for order creation
- **Auth Context:** `src/lib/contexts/AuthContext.tsx` — use for auth gating on checkout
- **Middleware:** `src/middleware.ts` — extend to protect `/checkout` route

### Cart Scoping Challenge
Current `getCartItems()` reads from a shared global `cartItems` collection. Must migrate to user-scoped:
- **New path:** `users/{uid}/cart` subcollection
- **Impact:** `getCartItems()` in `data.ts` needs uid parameter, `CartItems.tsx` and `CartSummary.tsx` need updating
- **Server Action for cart updates** in `cart/actions.ts` needs uid scoping

### Currency Switch
`CartSummary.tsx` line 16 uses `€{subtotal.toFixed(2)}` — must become `₹{subtotal.toLocaleString('en-IN')}`.
Same for `CartItems.tsx` which displays individual item prices.

## Architecture Decision: Server Action vs API Route

**Server Actions (recommended for this project):**
- Already established pattern in `cart/actions.ts`
- No CORS/fetch overhead
- Direct access to `adminDb` and `adminAuth`
- Order creation + verification both fit the Server Action model

**API Route (only if webhooks needed):**
- Razorpay webhooks POST to a URL — requires `/api/webhooks/razorpay` route
- Webhook is a reliability backup (handles cases where client drops connection after payment)
- Can be added later; not strictly required for V1 MVP

## Order Document Schema (Proposed)
```typescript
interface Order {
  id: string;                    // Auto-generated
  userId: string;                // From auth session
  razorpayOrderId: string;       // From orders.create
  razorpayPaymentId: string;     // From handler callback
  razorpaySignature: string;     // For audit trail
  items: CartItem[];             // Snapshot of cart at purchase time
  subtotal: number;              // Server-computed from Firestore prices
  shipping: number;              // 0 for "Complimentary"
  total: number;                 // subtotal + shipping
  currency: "INR";
  status: "paid" | "failed";
  shippingAddress: Address;      // Snapshot of selected address
  createdAt: Timestamp;
}
```

## Validation Architecture
- **Criteria 1 (CHK-01):** Clicking checkout from `/cart` navigates to `/checkout` where a Razorpay modal opens with correct INR pricing computed server-side.
- **Criteria 2 (CHK-02):** Server Action recomputes subtotal from Firestore `products` collection, never trusting client values.
- **Criteria 3 (CHK-03):** After payment success, Server Action verifies HMAC SHA256 signature and only creates order if valid.
- **Criteria 4 (CHK-04):** A Firestore document in `orders` collection is created with `status: 'paid'` after successful verification.

## RESEARCH COMPLETE
