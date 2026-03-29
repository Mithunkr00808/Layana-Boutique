# Research Summary: Commerce & Accounts

## Key Findings

**Stack:**
- Firebase Auth mapped to `firebase-admin` session cookies.
- Razorpay for payments alongside a cryptographically validated backend Next.js API route / Server Action.
- Firebase Client Cloud Storage + `firebase-admin` bucket writes.

**Table Stakes:**
- Order Validation: Prices must never be trusted from the client UI. The backend dictates Razorpay subtotals by fetching `productDetails` dynamically during checkout.
- Persistent cross-browser User Auth (avoiding SSR token issues).
- Wishlist logic binding directly to Auth User's subcollections.
- Proper search filtering params logic in Next.js Server Components.

**Watch Out For:**
- Client-side checkout forging: the actual "paid" order state must happen after Razorpay cryptographic signature verification securely sent down via API callbacks.
- File upload buffers must be safely transmitted to Firebase Storage using `adminDb.bucket()` streams.
