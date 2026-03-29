# Phase 2: Razorpay Checkout Flow — Validation Strategy

## Automated Checks
- `npm run build` — Must succeed after each plan execution (build gate)
- `grep -r '€' src/` — Must return zero results (currency migration complete)
- Route compilation: `/checkout`, `/order/[orderId]/confirmation` must appear in build output

## Manual Verification (Browser)
1. **Cart Scoping:** Add items as logged-in user → items appear in user's cart only
2. **Currency:** All prices display in ₹ with Indian locale formatting
3. **Checkout Flow:** Click "Proceed to Checkout" → navigates to `/checkout`
4. **Auth Gate:** Visit `/checkout` while logged out → redirects to `/login`
5. **Address Selection:** Saved addresses appear as radio group on checkout
6. **Payment Flow:**
   - Click "Pay Now" → blur overlay "Securing your payment…"
   - Razorpay modal opens with correct INR amount
   - Cancel payment → toast "Payment cancelled", no redirect
   - Complete payment → blur overlay "Confirming your payment…" → redirect to confirmation
7. **Confirmation Page:** Shows order ID, items, address, total in ₹
8. **Cart Clearing:** Cart is empty ONLY after visiting confirmation page (never before verification)

## Security Checks
- Server Action recomputes prices from Firestore (inspect `checkout/actions.ts`)
- HMAC SHA256 signature verification (inspect `checkout/actions.ts`)
- `RAZORPAY_KEY_SECRET` never appears in client bundles
- Session cookie verification on all checkout/order Server Actions
