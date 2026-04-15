# Architecture

*Last reviewed: 2026-04-15*

## Core Pattern
- **App Router Architecture**: Next.js `app/` directory with Server Components by default. Client Components (`"use client"`) are used only for interactive state management (AuthContext, WishlistContext, CheckoutClient, cart mutations, admin forms).
- **Server Actions for Mutations**: All write operations are performed via Server Actions (`"use server"`) in dedicated `actions.ts` files. This pattern keeps mutations isolated and server-only.
- **Proxy-Based Edge Gate**: The project uses `src/proxy.ts` (Next.js 16 file convention) with `config.matcher` for edge-level route gating. Route protection then gets reinforced by server-side verification in layouts/actions.

## Authentication Architecture

### Two-Layer Auth Model
1. **Client-Side (Firebase Auth SDK)**: `AuthContext` listens to `onIdTokenChanged` events. When a user signs in, the ID token is sent to `/api/auth/session` to create an HTTP-only session cookie.
2. **Server-Side (Firebase Admin SDK)**: All server operations verify the session cookie via `adminAuth.verifySessionCookie()`. Two session utility modules:
   - `session-user.ts`: General user sessions (`getSessionUid`, `requireSessionUid`)
   - `admin-session.ts`: Admin-only sessions (`getAdminSession`, `requireAdminSession`, `assertAdminSession`). Checks `decoded.admin` custom claim.

### Admin Protection
- **Layout-Level**: `admin/(protected)/layout.tsx` calls `requireAdminSession()` which redirects to `/admin/login` if not admin.
- **Action-Level**: Every admin Server Action begins with `await assertAdminSession()`.
- **Edge-Level**: `proxy.ts` checks for session cookie existence on admin routes.
- **Custom Claims**: Admin role is enforced via Firebase custom claims (`decoded.admin === true`).

### Guest Cart System
- Unauthenticated users get a `guestId` cookie (UUID) stored in HTTP-only cookie.
- Guest cart items stored in `guest-carts/{guestId}/items/` Firestore collection.
- On login, `/api/cart/migrate` merges guest items into the user's cart with quantity accumulation via Firestore transaction.
- Post-merge, guest cart documents and the `guestId` cookie are cleaned up.

## Data Fetching & Flow

### Data Layer (`src/lib/data.ts` — 745 lines)
The central data access layer is a monolithic file containing:
- **Type definitions**: `Product`, `ProductDetail`, `CartItem`, `Address`, `Order`, `SiteSettings`
- **Cached queries**: `getNewArrivals`, `getReadyToWearProducts`, `getJournalArticles` use `unstable_cache` with named keys and tags
- **Direct queries**: Cart operations, order fetches, address lookups use uncached admin SDK calls
- **Defensive hydration**: `getProductDetail()` has a 2-tier fallback: tries `productDetails/{id}` first, falls back to `products/{id}` with auto-generated mock descriptions

### Price Formatting
All prices stored as strings with `₹` prefix (e.g., `"₹1,299.00"`). The `formatIndianPrice()` helper converts raw numeric strings to Indian locale formatting. Cart items additionally store `rawPrice` as a numeric field for calculations.

### Cache Strategy
- **`unstable_cache`** with named tags: `products`, `articles`
- **`revalidatePath`** on mutations: targets specific paths (`/admin/catalog`, `/collections/sarees`, `/product/{id}`)
- **`revalidateTag`** for broader invalidation of product-related caches
- **`force-dynamic`** on auth-dependent pages: checkout, account

### Data Access Shape
- `src/lib/data.ts` remains a central data access module (~683 lines), still carrying mixed concerns (types + reads + mapping + format helpers).
- Order fulfillment has been cleanly extracted into `src/lib/orders.ts`.
- Address reads are abstracted in `src/lib/addresses.ts`, while writes still target legacy user-document address arrays.

## Payment Flow (Razorpay)

### Order Lifecycle
```
Client selects items → CheckoutClient → createOrder (Server Action)
  → Server recomputes prices from DB (NO client price trust)
  → Server validates address ownership
  → Razorpay API creates order
  → Store in pendingOrders/{razorpayOrderId}
  → Return orderId + amount to client
  → Client opens Razorpay modal
  → On success: verifyPayment (Server Action)
    → HMAC signature verification (timing-safe)
    → Ownership verification (pendingOrder UID match)
    → fulfillOrder() — idempotent atomic fulfillment
  → Webhook: /api/webhooks/razorpay also calls fulfillOrder()
```

### Fulfillment (`src/lib/orders.ts` — `fulfillOrder()`)
Designed for dual-invocation safety (client verify + webhook):
1. **Idempotency guard**: Checks if `orders` collection already has this `razorpayOrderId`
2. **Fulfillment lock**: Uses `orderFulfillments/{razorpayOrderId}` with `batch.create()` (fails if exists)
3. **Atomic batch**: Creates order doc, deducts inventory (with existence guards), deletes pending doc
4. **Non-critical cart cleanup**: Done outside the batch to prevent order rollback on cart failure
5. **Error recovery**: On `already-exists` batch errors, gracefully returns existing order

## Media Pipeline

### Cloudinary Integration
- **Server-side uploads**: `uploadProductMedia()` buffers files and uploads via Cloudinary stream API
- **Client-side uploads**: `cloudinary-actions.ts` provides signed upload parameters via `getCloudinarySignature()`
- **Auto-detection**: `resource_type: "auto"` allows both image and video uploads
- **Video poster**: Auto-generates poster URLs for video assets
- **Cleanup**: Deleted media assets are removed from Cloudinary via `deleteCloudinaryAsset()`

### Legacy Firebase Storage
- `src/lib/firebase/storage.ts` still exports `uploadImage()` for Firebase Storage
- Used as fallback when Cloudinary is not configured

## Routing

### Storefront Routes
| Route | Type | Purpose |
|-------|------|---------|
| `/` | Static/ISR | Homepage with hero, new arrivals, journal |
| `/collections/[slug]` | Dynamic | Category catalog (sarees, kurties, kids-wear) |
| `/product/[id]` | Dynamic | Product detail page |
| `/cart` | Dynamic | Shopping cart with guest support |
| `/checkout` | Force-dynamic | Authenticated checkout flow |
| `/order/[orderId]/confirmation` | Dynamic | Post-payment confirmation |

### Auth Routes (Route Group `(auth)`)
| Route | Purpose |
|-------|---------|
| `/login` | Email/password sign-in |
| `/signup` | Account registration |
| `/forgot-password` | Password reset |

### Account Routes
| Route | Purpose |
|-------|---------|
| `/account` | Dashboard overview |
| `/account/orders` | Order history |
| `/account/addresses` | Saved addresses |
| `/account/preferences` | Profile settings |
| `/account/wishlist` | Wishlisted items |

### Admin Routes (Protected via `(protected)` route group)
| Route | Purpose |
|-------|---------|
| `/admin/login` | Admin login (outside protection) |
| `/admin` | Dashboard |
| `/admin/catalog` | Product management |
| `/admin/catalog/new` | Create product |
| `/admin/catalog/[id]/edit` | Edit product |
| `/admin/orders` | All orders |
| `/admin/customers` | Customer list |
| `/admin/analytics` | Analytics dashboard |
| `/admin/settings` | Site settings (hero, social) |
| `/admin/[...missing]` | Catch-all for unknown admin routes |

### API Routes
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/session` | POST | Create session cookie from Firebase ID token |
| `/api/auth/logout` | POST | Clear session cookies |
| `/api/cart/migrate` | POST | Merge guest cart → user cart |
| `/api/webhooks/razorpay` | POST | Razorpay payment webhook |
