# Security Audit

*Last reviewed: 2026-04-15*

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

#### 1. CSP Still Permissive (`unsafe-eval` + `unsafe-inline`)
- **File**: `next.config.ts`
- **Impact**: XSS blast radius is higher than a strict nonce/hash CSP.
- **Context**: Razorpay checkout and development tooling often drive this choice.
- **Fix**: Move toward a stricter production CSP (nonce-based where feasible) and keep permissive directives only when demonstrably required.

#### 2. No Rate Limiting on Auth/Mutation Surfaces
- **Files**: `src/app/api/auth/session/route.ts`, `src/app/api/cart/migrate/route.ts`, webhook and server action entrypoints
- **Impact**: Brute-force, abuse bursts, and elevated operational load risk.
- **Fix**: Add IP/user scoped rate limiting (edge middleware or API-layer limiter).

### MEDIUM Priority

#### 3. Admin UI Hint Cookie Can Become Stale
- **File**: `src/app/api/auth/session/route.ts`
- `isAdmin` cookie is set for 5 days and used as a UI hint.
- **Impact**: Minor UX inconsistency if admin claim changes mid-session.
- **Mitigation**: Server-side admin checks are authoritative and already enforced.
- **Fix**: Consider removing `isAdmin` cookie and deriving role state from verified session responses.

#### 4. Address Storage Model Migration Still Incomplete
- **Files**: `src/app/account/actions.ts`, `src/lib/addresses.ts`
- Writes still go to `users/{uid}.addresses[]` while reads support both array and subcollection.
- **Impact**: data consistency and long-term maintenance risk.
- **Fix**: finish migration to `users/{uid}/addresses/{addressId}` and backfill old data.

#### 5. No Structured Security Telemetry
- **Current**: `console.error`/`console.warn` logging only.
- **Impact**: difficult incident forensics, slow mean-time-to-detect.
- **Fix**: add structured logs and alerting for auth failures, checkout failures, and webhook anomalies.

### LOW Priority

#### 6. Runtime Razorpay Secret Validation Is Now Correct (Resolved)
- **File**: `src/lib/razorpay.ts`
- The prior non-null assertion concern is fixed via lazy initialization with explicit env validation.

#### 7. Webhook Returns 200 for Non-Fulfillment Errors
**File**: `src/app/api/webhooks/razorpay/route.ts` lines 174-178
- When `fulfillOrder` returns `{ success: false }`, the webhook returns 200.
- This prevents Razorpay retries, which is intentional for non-retryable errors.
- **Concern**: If the error is transient, the order will never be fulfilled by webhook.
- **Monitoring**: Needs alerting on webhook fulfillment failures.

#### 8. External API Call Timeout Handling Is Implemented (Resolved)
**File**: `src/app/checkout/CheckoutClient.tsx` line 154
- PIN lookup uses `AbortController` + timeout guard.

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
| 🔴 HIGH | Tighten production CSP policy | Medium | XSS hardening |
| 🟡 MEDIUM | Add rate limiting | 2 hours | Brute force protection |
| 🟡 MEDIUM | Complete address model migration | Medium | Data consistency |
| 🟡 MEDIUM | Add structured telemetry/alerting | Medium | Incident response |
| 🟢 LOW | Add admin audit logging | 2 hours | Compliance |
