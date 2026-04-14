# Security Audit

*Last reviewed: 2026-04-13*

## ✅ Security Strengths

| Area | Implementation | Quality |
|------|----------------|---------|
| **Session Management** | Firebase Admin `createSessionCookie()` with HTTP-only, secure, sameSite:lax cookies | ✅ Strong |
| **Admin Protection** | Triple-layer: proxy redirects + layout auth guard + action-level `assertAdminSession()` | ✅ Strong |
| **CSRF Prevention** | Same-origin validation on all API routes via `isSameOriginRequest()` | ✅ Good |
| **Payment Security** | Server-side price recomputation, HMAC signature verification, timing-safe comparison | ✅ Excellent |
| **Fulfillment Safety** | Idempotent `fulfillOrder()` with atomic batch + fulfillment locks | ✅ Excellent |
| **Input Validation** | Zod schemas on API routes, Server Actions, and webhook payloads | ✅ Good |
| **Security Headers** | X-Frame-Options, X-Content-Type-Options, HSTS, Referrer-Policy, CSP | ✅ Good |
| **Cloudinary Signed Uploads** | Admin-only signed upload parameters with session check | ✅ Good |
| **Cookie Security** | `httpOnly`, `secure` (prod), `sameSite: 'lax'`, 5-day expiry | ✅ Good |
| **Private Key Handling** | `\\n` → `\n` conversion for Firebase private key in env | ✅ Correct |

## ⚠️ Security Concerns

### HIGH Priority

#### 1. Missing Root Middleware — Route Protection Gap
- **File**: `src/proxy.ts` exists but not wired as `middleware.ts`
- **Impact**: Edge-level route protection may not be active. Unauthenticated users might momentarily load protected route RSC HTML before server-side checks redirect them.
- **Mitigation**: Server-side guards (`requireAdminSession()`, `getSessionUid()`) provide backend enforcement.
- **Fix**: Create `middleware.ts` at root: `export { proxy as middleware, config } from './src/proxy';`

#### 2. Server Actions Body Size: 500MB
- **File**: `next.config.ts` line 6 — `bodySizeLimit: "500mb"`
- **Impact**: Denial-of-service vector. A malicious client can send 500MB payloads to any Server Action.
- **Exploitation**: Simple HTTP POST to any Server Action endpoint with massive body.
- **Fix**: Reduce to `10mb` or less. Media uploads go through Cloudinary, not Server Actions.

#### 3. CSP Allows `unsafe-eval` and `unsafe-inline`
- **File**: `next.config.ts` line 42
- **Impact**: Weakens XSS protection. `unsafe-eval` allows `eval()` execution; `unsafe-inline` allows inline scripts.
- **Reason**: Razorpay SDK likely requires `unsafe-eval`. Next.js dev mode requires both.
- **Fix**: Use nonce-based CSP for production. Keep `unsafe-eval` only if Razorpay demands it.

### MEDIUM Priority

#### 4. Non-null Assertions on Payment Secrets
- **File**: `src/lib/razorpay.ts`
```typescript
key_id: process.env.RAZORPAY_KEY_ID!,
key_secret: process.env.RAZORPAY_KEY_SECRET!,
```
- **Impact**: Server crash at module load if env vars missing. Uncaught error reveals stack trace.
- **Fix**: Validate env vars at startup and throw descriptive error.

#### 5. Admin Cookie Staleness
- **Session route** sets `isAdmin` cookie that persists for 5 days.
- If admin permissions are revoked between logins, client-side UI still shows admin features.
- **Mitigation**: Server-side checks prevent actual admin actions.
- **Fix**: Don't cache admin status in a cookie; check claims on each request.

#### 6. Guest Cart Indefinite Persistence
- Guest carts in `guest-carts/{guestId}` are never cleaned up unless the user logs in.
- **Impact**: Firestore storage accumulation from abandoned guest sessions.
- **Fix**: Implement a scheduled Cloud Function to purge stale guest carts (>30 days).

#### 7. No Rate Limiting
- No rate limiting on API routes or Server Actions.
- **Impact**: Login brute force, cart spam, webhook replay attacks.
- **Mitigation**: Razorpay webhook has signature verification.
- **Fix**: Add rate limiting middleware (e.g., Upstash Redis or in-memory for simple cases).

### LOW Priority

#### 8. Webhook Returns 200 for Non-Fulfillment Errors
**File**: `src/app/api/webhooks/razorpay/route.ts` lines 174-178
- When `fulfillOrder` returns `{ success: false }`, the webhook returns 200.
- This prevents Razorpay retries, which is intentional for non-retryable errors.
- **Concern**: If the error is transient, the order will never be fulfilled by webhook.
- **Monitoring**: Needs alerting on webhook fulfillment failures.

#### 9. No Audit Logging
- Admin actions (catalog changes, order management) have no audit trail.
- `console.error` is the only logging mechanism.
- **Fix**: Add structured logging (e.g., Firestore `auditLog` collection).

#### 10. External API Call Without Timeout
**File**: `src/app/checkout/CheckoutClient.tsx` line 154
- PIN code lookup to `api.postalpincode.in` has no timeout or abort controller.
- **Impact**: Low — client-side only, best-effort.

## Authentication Flow Security Analysis

```
[Login Form] → Firebase Auth (client)
    ↓
[ID Token] → POST /api/auth/session
    ↓
[CSRF Check] — Validates same-origin request
    ↓
[Token Verify] — adminAuth.verifyIdToken()
    ↓
[Session Cookie] — createSessionCookie (5-day, httpOnly, secure, lax)
    ↓
[Server Actions] — verifySessionCookie(cookie, checkRevoked=true)
```

**Analysis**: This flow is secure. The `checkRevoked: true` flag means revoked tokens are caught immediately. Session cookies are signed by Firebase and HTTP-only, preventing client-side access.

## Payment Security Analysis

```
[Cart Items] → Client sends addressId + shippingMethod
    ↓
createOrder() → Server refetches ALL prices from Firestore
    ↓                Client prices are NEVER trusted
[Verified Total] → Razorpay.orders.create(amount in paise)
    ↓
[Razorpay Modal] → User completes payment
    ↓
verifyPayment() → HMAC-SHA256 verification
    ↓               crypto.timingSafeEqual (constant-time)
[Ownership Check] → pendingOrder.uid === session.uid
    ↓
fulfillOrder() → Atomic batch with idempotency guard
```

**Analysis**: Payment security is excellent. The key principle — **server-side price recomputation** — prevents price manipulation attacks. HMAC verification uses cryptographically secure comparison.

## Recommendation Summary

| Priority | Fix | Effort | Impact |
|----------|-----|--------|--------|
| 🔴 HIGH | Create root `middleware.ts` | 5 min | Route protection |
| 🔴 HIGH | Reduce body size limit to 10mb | 1 min | DoS prevention |
| 🟡 MEDIUM | Remove non-null assertions on payment keys | 10 min | Crash prevention |
| 🟡 MEDIUM | Add rate limiting | 2 hours | Brute force protection |
| 🟡 MEDIUM | Implement guest cart cleanup | 1 hour | Storage costs |
| 🟢 LOW | Add audit logging | 2 hours | Compliance |
| 🟢 LOW | Nonce-based CSP | 3 hours | XSS hardening |
