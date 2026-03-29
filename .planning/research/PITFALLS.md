# Pitfalls Research: Commerce & Accounts

## Common Mistakes Adding Checkout
- **Trusting the Cart Pricing on Output**: A classic e-commerce mistake is building the Razorpay order request using prices pulled directly from the frontend cart state.
  - *Prevention*: When a user clicks "Checkout", the backend MUST construct the Razorpay order total by re-fetching all Cart IDs fresh from the secure `productDetails` database, discarding any frontend-provided subtotals. This happens instantly in Next.js Server Actions.

## Firebase Auth vs Next.js SSR
- **Cookie vs Token Mismatch**: Firebase Auth runs heavily on the client. Next.js App Router (Server Components) cannot securely read client-side IndexedDB tokens during the SSR phase natively.
  - *Prevention*: You must use standard HTTP cookies synced with Firebase Auth (`firebase-admin` session cookies or Next.js Middleware parsing) so pages like `/account` don't flicker from "Logged Out" -> "Logged In".

## Firebase Storage Configuration
- **Unsecured Buckets**: Uploads without rigid CORS limits or authenticated origins.
  - *Prevention*: Keep the rules strictly defined so only verified UI admin operations or backend server actions (`firebase-admin`) interact with the buckets. You should use Admin SDK strictly to accept the Next.js `FormData` binary.

## Razorpay Verifications
- **Client Side Faking**: Simply completing the Razorpay modal isn't enough.
  - *Prevention*: A backend cryptographic signature verification (via Razorpay's `validatePaymentVerification` util) must be invoked upon checkout returned to ensure user didn't intercept the UI success state.
