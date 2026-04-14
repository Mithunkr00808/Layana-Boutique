# Data Flow & Business Logic

## 1. Product Data Flow

```
                    WRITE PATH                              READ PATH
                    ─────────                               ─────────
Admin Form (FormData)                           Homepage / Collection Page
    │                                                       │
    ▼                                                       ▼
saveCatalogItem()                               getNewArrivals() / getReadyToWearProducts()
[admin/actions.ts]                              [lib/data.ts, unstable_cache]
    │                                                       │
    ├─ assertAdminSession()                                 ├─ adminDb.collection('products').get()
    ├─ productSchema.safeParse()                            ├─ mapProductDoc() — format prices, extract
    ├─ uploadProductMedia() → Cloudinary                    │  fields, apply formatIndianPrice()
    ├─ Build ordered media array                            └─ Sort by updatedAt/createdAt, limit 3
    ├─ batch.set('products/{id}')     ←──── SUMMARY ────────┘
    ├─ batch.set('productDetails/{id}') ←── DETAIL ────►  getProductDetail(id)
    ├─ batch.commit()                                       │
    ├─ Delete removed Cloudinary assets                     ├─ Try productDetails/{id} (full data)
    └─ revalidatePath/revalidateTag                         ├─ Fallback: products/{id} (auto-hydrate)
                                                            └─ Return null if neither exists
```

### Key Design Decision: Dual-Collection Model
Products split across two Firestore collections:
- **`products`**: Lightweight summary (name, price, image, category) for catalog grids
- **`productDetails`**: Extended data (description, materials, sizes, multiple images) for detail pages

This avoids fetching heavy detail data when rendering product lists.

---

## 2. Cart Data Flow

```
Unauthenticated User                    Authenticated User
       │                                        │
       ▼                                        ▼
addCartItem()                            addCartItem()
[cart/actions.ts]                        [cart/actions.ts]
       │                                        │
       ├─ getGuestId()                          ├─ getSessionUid()
       ├─ guestId from cookie                   └─ users/{uid}/cart/{itemId}
       └─ guest-carts/{guestId}/items/{id}          │
                                                     │
LOGIN EVENT ─────────────────────────────────────────┘
       │
       ▼
/api/cart/migrate (POST)            AND/OR    getCartItemsForUser()
       │                                          │
       ├─ verifySessionCookie()                    ├─ mergeGuestToUser() [duplicate logic!]
       ├─ Read guest-carts/{guestId}/items         ├─ Transaction: merge quantities
       ├─ Transaction: merge quantities            └─ Delete guest-carts/{guestId}
       └─ Delete guest-carts/{guestId}
```

### Cart Item ID Convention
`{productId}-{size}` or `{productId}-onesize` — ensures same product in different sizes are separate line items.

---

## 3. Payment & Order Flow

```
CheckoutClient.tsx (Client)          checkout/actions.ts (Server)
       │                                    │
       ├─ Select address                    │
       ├─ Select shipping                   │
       ├─ handlePay() ──────────────────► createOrder()
       │                                    │
       │                                    ├─ Validate input (Zod)
       │                                    ├─ requireSessionUid()
       │                                    ├─ getVerifiedCart(uid)
       │                                    │   ├─ Re-fetch prices from DB
       │                                    │   ├─ Verify stock > 0
       │                                    │   └─ Cap quantity at stock
       │                                    ├─ Validate address ownership
       │                                    ├─ Calculate total (server-side)
       │                                    ├─ razorpay.orders.create()
       │                                    ├─ Store pendingOrders/{orderId}
       │              ◄─────────────────────┤  Return {orderId, amount}
       │                                    │
       ├─ Open Razorpay modal               │
       │   (client-side SDK)                │
       │                                    │
       ├─ On payment success ───────────► verifyPayment()
       │                                    │
       │                                    ├─ Validate input (Zod)
       │                                    ├─ HMAC signature verify
       │                                    │   (timingSafeEqual)
       │                                    ├─ Ownership check (UID match)
       │                                    └─► fulfillOrder()
       │                                        │
       │                                        ├─ Idempotency: check orders
       │                                        ├─ Idempotency: check fulfillments
       │                                        ├─ Load pendingOrder
       │                                        ├─ Resolve address
       │                                        ├─ ATOMIC BATCH:
       │                                        │   ├─ Create orders/{newId}
       │                                        │   ├─ Create orderFulfillments/{rzpId}
       │                                        │   ├─ Deduct products/{id}.quantity
       │                                        │   ├─ Deduct productDetails/{id}.quantity
       │                                        │   └─ Delete pendingOrders/{rzpId}
       │                                        └─ Cart cleanup (non-critical)
       │                                    
       │              ◄─────────────────── {success, orderId}
       └─ router.push(/order/{id}/confirmation)

PARALLEL PATH: Razorpay Webhook ──► /api/webhooks/razorpay
                                        │
                                        ├─ Verify HMAC signature
                                        ├─ Validate Zod schema
                                        ├─ Only process "order.paid"
                                        └─► fulfillOrder() (idempotent)
```

### Idempotency Guarantees
`fulfillOrder()` can be called multiple times safely:
1. First checks existing `orders` where `razorpayOrderId == id`
2. Uses `batch.create()` on fulfillment lock (fails atomically if exists)
3. On `already-exists` error, returns existing order
4. On missing pending order, retries orders query

---

## 4. Wishlist Data Flow

```
WishlistContext (Client)              account/actions.ts (Server)
       │                                    │
       ├─ Optimistic toggle                 │
       │   (instant UI update)              │
       ├─ toggleWishlistItem() ──────────► toggleWishlistItem()
       │                                    │
       │                                    ├─ getSessionUid() / getGuestId()
       │                                    ├─ Check doc exists
       │                                    ├─ Exists? → delete
       │                                    └─ Missing? → create
       │              ◄─────────────────── {success, added}
       │                                    │
       ├─ On error: rollback UI             │
       └─ On success: re-fetch IDs          │
           (getWishlistedIds)
```

---

## 5. Auth Session Flow

```
Firebase Client Auth                   Server
       │                                 │
       ├─ signInWithEmailAndPassword     │
       ├─ onIdTokenChanged fires         │
       ├─ getIdToken() ─────────────► /api/auth/session (POST)
       │                                 │
       │                                 ├─ CSRF check (isSameOriginRequest)
       │                                 ├─ Zod validate body
       │                                 ├─ verifyIdToken()
       │                                 ├─ If signup: create users/{uid} doc
       │                                 ├─ createSessionCookie(5 days)
       │                                 ├─ Set 'session' cookie (httpOnly)
       │                                 └─ Set 'isAdmin' cookie (httpOnly)
       │              ◄──────────────── {status, isAdmin}
       │                                 │
       ├─ /api/cart/migrate (POST)       │
       ├─ setUser(currentUser)           │
       └─ setIsAdmin(claims.admin)       │
```

---

## 6. Site Settings Flow

```
Admin Settings Page                    siteSettings.ts / data.ts
       │                                    │
       ├─ Update hero images               │
       ├─ Update social links              │
       └─ Save to Firestore ──────────► siteSettings/{hero|social}
                                            │
Homepage / Footer                           │
       │                                    │
       └─ getSiteSettings() ◄──────────── Read + migrate
              │                             ├─ Supports legacy single-image format
              └─ Returns multi-image hero   └─ Falls back to defaults
```

### Legacy Migration
`getSiteSettings()` transparently migrates old `{imageUrl, alt}` format to new `{images: [{imageUrl, alt}]}` format on read (no write-back).
