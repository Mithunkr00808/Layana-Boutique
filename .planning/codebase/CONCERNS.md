# Tech Debt, Concerns & Improvement Opportunities

## 🔴 Critical Issues

### 1. Missing Root Middleware
**File**: `src/proxy.ts` exists but **no `middleware.ts`** at project root.
- The `proxy()` function and `config.matcher` are exported but never wired up as Next.js middleware.
- Route protection (redirecting unauthenticated users from `/account`, `/checkout`, `/admin`) **may not be active** at the edge.
- Server-side auth checks in layouts (`requireAdminSession()`, `getSessionUid()`) serve as fallback, but these execute after routing/rendering begins.
- **Fix**: Create `middleware.ts` at project root that imports and delegates to `proxy()`.

### 2. `data.ts` Monolith (745 lines)
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

### 3. Duplicate `SiteSettings` Types
**Conflict between**:
- `src/lib/data.ts` → `SiteSettings.hero = { imageUrl: string; alt: string }` (single image)
- `src/lib/siteSettings.ts` → `SiteSettings.hero = { images: HeroImage[]; imageUrl?: string; alt?: string }` (multi-image with migration)
- Two independent `getSiteSettings()` functions exist with different return shapes.
- **Risk**: Wrong function imported in a component leads to subtle UI bugs or build errors.

### 4. Duplicate `mapOrder` / Order Mapping Logic
**Files**: `src/lib/data.ts` (lines 614–667) and `src/lib/data.ts` (lines 557–611)
- `getOrderById()` and `mapOrder()` contain nearly identical order-mapping logic but are separate implementations.
- Same pattern repeated for subtotal/shipping/total calculations with fallback chains.
- **Fix**: Extract shared `normalizeOrder()` helper.

---

## 🟡 Important Concerns

### 5. Server Actions Body Size Limit: 500MB
**File**: `next.config.ts` → `serverActions.bodySizeLimit: "500mb"`
- This is extremely permissive. Server Actions shouldn't receive payloads anywhere near this size.
- Media uploads now use Cloudinary (either server-side buffering or client-side signed uploads).
- **Risk**: DoS vector — a malicious client could flood the server with massive payloads.
- **Recommended**: Reduce to `10mb` or lower, since Cloudinary handles large files.

### 6. Non-null Assertion on Razorpay Keys
**File**: `src/lib/razorpay.ts`
```typescript
key_id: process.env.RAZORPAY_KEY_ID!,
key_secret: process.env.RAZORPAY_KEY_SECRET!,
```
- Will crash at module load time if env vars are missing (no graceful error).
- **Fix**: Add runtime validation or lazy initialization.

### 7. Address Storage Model Inconsistency
**Files**: `src/app/account/actions.ts`, `src/lib/addresses.ts`, `src/lib/data.ts`
- Two concurrent models: document array (`users/{uid}.addresses[]`) and subcollection (`users/{uid}/addresses/`)
- New addresses are written to the **legacy array model** in `addAddress()`
- Reads attempt both models in `getUserAddresses()` and `getUserAddressById()`
- **Risk**: Data fragmentation, inconsistent behavior, migration complexity.
- **Fix**: Complete migration to subcollection model, update write operations.

### 8. `unstable_cache` Usage
**File**: `src/lib/data.ts`
- Using Next.js `unstable_cache` which is, by definition, not stable API.
- Currently used for `getNewArrivals`, `getReadyToWearProducts`, `getJournalArticles`, `getSiteSettings`.
- **Risk**: Breaking changes in future Next.js versions.
- **Note**: This is standard practice for Next.js 14-16 but should be monitored.

### 9. Guest Cart → User Cart Merge Race Condition
**Files**: `src/lib/data.ts` (getCartItemsForUser), `src/app/api/cart/migrate/route.ts`
- Cart merge happens in **two places**: `getCartItemsForUser()` and `/api/cart/migrate`.
- `AuthContext` fires `/api/cart/migrate` on login.
- `getCartItemsForUser()` independently runs `mergeGuestToUser()` if `guestId` cookie exists.
- **Risk**: Both could execute simultaneously, potentially duplicating quantity increments.
- **Fix**: Remove merge logic from `getCartItemsForUser()` and rely solely on the API route (or vice versa).

---

## 🟢 Minor Issues & Improvements

### 10. No Formal Testing
- No Jest, no Playwright, no Cypress
- Mock data fallbacks serve as informal integration tests
- **Recommended**: Start with Playwright E2E tests for critical paths (checkout, auth)

### 11. `getRelatedProducts()` Returns Random Products
**File**: `src/lib/data.ts` line 355
```typescript
const snapshot = await adminDb.collection('products').limit(4).get();
```
- No ordering or category filtering — returns first 4 documents in Firestore's natural order.
- **Fix**: Filter by same category, exclude current product.

### 12. `@ts-expect-error` Suppressions
**File**: `src/app/admin/actions.ts` (lines 358, 405)
```typescript
// @ts-expect-error - Next.js internal type mismatch
revalidateTag("products");
```
- Indicates type mismatch between project types and Next.js internals.
- May break silently if Next.js types change.

### 13. ESLint Suppression Header
**File**: `src/lib/data.ts` line 1
```typescript
/* eslint-disable @typescript-eslint/no-explicit-any */
```
- Blanket suppression of `any` typing across the entire data layer.
- Same in `CheckoutClient.tsx`.
- **Fix**: Gradually replace `any` with proper Firestore document types.

### 14. Admin `isAdmin` Cookie
**File**: `src/app/api/auth/session/route.ts`
- Sets a separate `isAdmin` cookie (HTTP-only) alongside the session cookie.
- This cookie is set at login and never re-validated until session expires (5 days).
- If admin claim is revoked, the cookie will be stale.
- **Impact**: Low — server-side checks still enforce admin access.

### 15. Hardcoded Shipping Logic
**File**: `src/app/checkout/actions.ts`
```typescript
const SHIPPING_COSTS: Record<string, number> = {
  standard: 0,
  express: 250,
};
```
- Shipping costs, methods, and display labels are scattered across `CheckoutClient.tsx` and `actions.ts`.
- **Fix**: Centralize in a config or Firestore settings document.

### 16. `proxy.ts` Not Active as Middleware
The `proxy.ts` file applies security headers duplicatively:
- `next.config.ts` also applies X-Frame-Options, X-Content-Type-Options, etc.
- Even if middleware is working, headers would be set twice (Next.js config + middleware).
- **Fix**: Choose one location for security headers.

### 17. `selectSummaryImage()` — Video Poster Fallback
**File**: `src/app/admin/actions.ts`
- When the first media item is a video, the summary image uses the video's poster URL.
- If no poster is available and no publicId exists, the summary image becomes an empty string.
- **Risk**: Product listing shows broken/missing thumbnail for video-first products.

---

## Architectural Debt Summary

| Priority | Issue | Impact | Effort |
|----------|-------|--------|--------|
| 🔴 | Missing middleware.ts | Route protection gaps | Low |
| 🔴 | Duplicate SiteSettings types | Type confusion | Low |
| 🔴 | data.ts monolith | Maintainability | Medium |
| 🟡 | 500MB body size limit | Security (DoS) | Low |
| 🟡 | Address model inconsistency | Data integrity | Medium |
| 🟡 | Cart merge race condition | Data duplication | Medium |
| 🟡 | Non-null assertion (razorpay) | Startup crash | Low |
| 🟢 | No testing framework | Regression risk | High |
| 🟢 | Related products not filtered | UX quality | Low |
| 🟢 | eslint any suppression | Type safety | Medium |
