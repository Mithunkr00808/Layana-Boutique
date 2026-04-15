# Tech Debt, Concerns & Improvement Opportunities

*Last reviewed: 2026-04-15*

## 🔴 Critical Issues

### 1. `data.ts` Monolith (~683 lines)
**File**: `src/lib/data.ts`
- Contains type definitions, price formatting, product queries, cart operations, address lookups, order queries, and site settings — all in one file.
- Mixed concerns: Type definitions, data access, business logic, and formatting utilities.
- **Risk**: Merge conflicts, cognitive overload, testing difficulty.
- **Suggested Split**:
  - `src/lib/types/` — Shared interfaces (Product, Order, CartItem, etc.)
  - `src/lib/products.ts` — Product queries
  - `src/lib/cart.ts` — Cart operations
  - `src/lib/orders.ts` — Already partially extracted
  - `src/lib/formatters.ts` — Price & date formatting

### 2. Testing Gap on Revenue-Critical Flows
- No formal test framework is installed yet (no Playwright/Vitest/Jest/Cypress usage in app code).
- Checkout/auth/catalog flows are validated manually.
- **Risk**: regressions in payment/auth can reach production.
- **Fix**: add E2E smoke tests for checkout + auth first, then integration tests for `createOrder`/`verifyPayment`/`fulfillOrder`.

### 3. Address Storage Model Inconsistency
**Files**: `src/app/account/actions.ts`, `src/lib/addresses.ts`, `src/lib/data.ts`
- Two concurrent models: document array (`users/{uid}.addresses[]`) and subcollection (`users/{uid}/addresses/`)
- New addresses are still written to the legacy array model in `addAddress()`
- Reads attempt both models in `getUserAddresses()` and `getUserAddressById()`
- **Risk**: Data fragmentation, inconsistent behavior, migration complexity.
- **Fix**: Complete migration to subcollection model, update write operations.

### 4. Duplicate `SiteSettings` Types (Mostly Resolved, monitor imports)
**Conflict between**:
- `src/lib/data.ts` → `SiteSettings.hero = { imageUrl: string; alt: string }` (single image)
- `src/lib/siteSettings.ts` → `SiteSettings.hero = { images: HeroImage[]; imageUrl?: string; alt?: string }` (multi-image with migration)
- In-file comments indicate duplicate `getSiteSettings` shape conflicts were cleaned up, but legacy type shape still exists in `data.ts`.
- **Fix**: keep `SiteSettings` contract in one module and remove old shape from `data.ts`.

---

## 🟡 Important Concerns

### 5. `unstable_cache` Usage (Acceptable for Next.js 16)
**File**: `src/lib/data.ts`
- Using Next.js `unstable_cache` which is, by definition, not stable API.
- Currently used for `getNewArrivals`, `getReadyToWearProducts`, `getJournalArticles`, `getSiteSettings`.
- **Risk**: future API changes in Next.js.
- **Note**: currently standard in Next 16, but keep this on upgrade checklist.

### 6. No Rate Limiting / Abuse Controls
- No clear per-route rate limiting for auth, session creation, or mutation-heavy operations.
- **Risk**: brute force and operational abuse.
- **Fix**: add edge/API-level rate limits with per-IP and per-user policies.

---

## 🟢 Minor Issues & Improvements

### 7. `getRelatedProducts()` Returns Semi-Arbitrary Results
**File**: `src/lib/data.ts` line 355
```typescript
const snapshot = await adminDb.collection('products').limit(4).get();
```
- No ordering or category filtering — returns first 4 documents in Firestore's natural order.
- **Fix**: Filter by same category, exclude current product.

### 8. `@ts-expect-error` Suppressions
**File**: `src/app/admin/actions.ts` (lines 358, 405)
```typescript
// @ts-expect-error - Next.js internal type mismatch
revalidateTag("products");
```
- Indicates type mismatch between project types and Next.js internals.
- May break silently if Next.js types change.

### 9. ESLint Suppression Header
**File**: `src/lib/data.ts` line 1
```typescript
/* eslint-disable @typescript-eslint/no-explicit-any */
```
- Blanket suppression of `any` typing across the entire data layer.
- **Fix**: Gradually replace `any` with proper Firestore document types.

### 10. Admin `isAdmin` Cookie
**File**: `src/app/api/auth/session/route.ts`
- Sets a separate `isAdmin` cookie (HTTP-only) alongside the session cookie.
- This cookie is set at login and never re-validated until session expires (5 days).
- If admin claim is revoked, the cookie will be stale.
- **Impact**: Low — server-side checks still enforce admin access.

### 11. Hardcoded Shipping Logic
**File**: `src/app/checkout/actions.ts`
```typescript
const SHIPPING_COSTS: Record<string, number> = {
  standard: 0,
  express: 250,
};
```
- Shipping costs, methods, and display labels are scattered across `CheckoutClient.tsx` and `actions.ts`.
- **Fix**: Centralize in a config or Firestore settings document.

### 12. `selectSummaryImage()` — Video Poster Fallback
**File**: `src/app/admin/actions.ts`
- When the first media item is a video, the summary image uses the video's poster URL.
- If no poster is available and no publicId exists, the summary image becomes an empty string.
- **Risk**: Product listing shows broken/missing thumbnail for video-first products.

---

## Architectural Debt Summary

| Priority | Issue | Impact | Effort |
|----------|-------|--------|--------|
| 🔴 | data.ts monolith | Maintainability | Medium |
| 🔴 | No automated tests on critical flows | Regression risk | Medium |
| 🟡 | Address model inconsistency | Data integrity | Medium |
| 🟡 | No rate limiting | Security/abuse risk | Medium |
| 🟡 | Duplicate SiteSettings shape risk | Type confusion | Low |
| 🟢 | Related products not filtered | UX quality | Low |
| 🟢 | eslint any suppression | Type safety | Medium |
