# External Integrations

## 1. Firebase Firestore (Primary Database)

### Client-Side SDK (`src/lib/firebase/config.ts`)
- Initializes Firebase App from `NEXT_PUBLIC_FIREBASE_*` environment variables
- Exports: `app`, `db`, `auth`
- Browser-only validation warns if API key is missing
- Deduplicates initialization via `getApps().length` check

### Server-Side Admin SDK (`src/lib/firebase/admin.ts`)
- Initializes once via `admin.apps.length` guard
- Uses service account credentials: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
- Handles `\\n` → `\n` conversion for private key from .env
- Exports: `adminDb`, `adminAuth`, `adminStorage`

### Firestore Collection Schema

```
Root collections:
├── products/                       # Product summaries (catalog listing)
│   └── {productId}
│       ├── id, name, price, discountPrice, quantity
│       ├── category, image, alt, isLimited, options
│       ├── hasVideo, mediaCount
│       └── createdAt, updatedAt
│
├── productDetails/                 # Extended product data (detail page)
│   └── {productId}
│       ├── id, sku, categoryPath, name, price, discountPrice
│       ├── quantity, description, materials[], sustainability
│       ├── images[] (ProductMedia objects)
│       ├── sizes[] ({label, available}), hasSizes
│       └── createdAt, updatedAt
│
├── articles/                       # Journal/blog articles
│   └── {articleId}
│       └── id, label, title, excerpt, image, alt
│
├── orders/                         # Finalized orders
│   └── {orderId}
│       ├── userId, razorpayOrderId, razorpayPaymentId
│       ├── razorpaySignature, receipt, status
│       ├── items[], subtotal, shipping, total, currency
│       ├── address{}, amount (paise)
│       └── createdAt (server timestamp)
│
├── pendingOrders/                  # Pre-payment temporary orders
│   └── {razorpayOrderId}
│       ├── uid, items[], subtotal, shippingCost, shippingMethod
│       ├── amount, currency, addressId, status
│       └── createdAt
│
├── orderFulfillments/              # Idempotency locks for fulfillment
│   └── {razorpayOrderId}
│       ├── orderId, status, paymentId
│       └── createdAt, updatedAt
│
├── users/                          # User profiles + nested data
│   └── {uid}
│       ├── firstName, lastName, fullName, email, phone
│       ├── createdAt
│       ├── preferences {visibility, newsletter, twoFactor, updatedAt}
│       ├── addresses[] (legacy array model)
│       │
│       ├── addresses/              # Subcollection (newer model)
│       │   └── {addressId} → {fullName, phone, streetAddress, city, state, postalCode, addressType}
│       │
│       ├── cart/                   # User's active cart
│       │   └── {itemId} → {id, productId, name, variant, size, quantity, price, rawPrice, image, alt}
│       │
│       └── wishlist/               # User's saved items
│           └── {productId} → {name, variant, size, price, rawPrice, image, alt, updatedAt}
│
├── guest-carts/                    # Anonymous cart storage
│   └── {guestId}
│       └── items/
│           └── {itemId} → same shape as user cart
│
├── guest-wishlists/                # Anonymous wishlist storage
│   └── {guestId}
│       └── items/
│           └── {productId} → same shape as user wishlist
│
└── siteSettings/                   # CMS-like settings
    ├── hero → {images[] or legacy imageUrl/alt}
    └── social → {instagram, facebook, email}
```

### Address Storage Migration
The codebase supports **two concurrent address storage models**:
1. **Legacy**: `users/{uid}.addresses[]` — array field on the user document
2. **Modern**: `users/{uid}/addresses/{addressId}` — subcollection

Both models are read transparently by `getUserAddresses()` and `getUserAddressById()`. New addresses are currently written to the legacy array model via `addAddress()`.

---

## 2. Cloudinary (Media CDN)

### Configuration (`src/lib/cloudinary.ts`)
- Server-side only via `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- Folder structure: `layana/products/{category}/` and `layana/site/`
- Supports both image and video uploads with `resource_type: "auto"`

### Upload Flows
1. **Server-side upload**: `uploadProductMedia()` converts File → Buffer → upload_stream
2. **Client-side signed upload**: `cloudinary-actions.ts` generates time-limited signed params

### Media Asset Lifecycle
- Upload returns full `ProductMedia` object with `publicId`, format, dimensions, bytes
- Video assets auto-generate poster thumbnails via `buildCloudinaryVideoPosterUrl()`
- Deletion via `deleteCloudinaryAsset()` on product edit/delete

---

## 3. Razorpay (Payments)

### Configuration (`src/lib/razorpay.ts`)
- Singleton instance: `new Razorpay({ key_id, key_secret })`
- Non-null assertion on env vars (will crash if missing)

### Client Integration
- Razorpay Checkout JS loaded via `next/script` in `CheckoutClient.tsx`
- Theme color: `#1B1C1C` (dark brand color)
- On modal dismiss: payment state reset to idle

### Webhook (`/api/webhooks/razorpay`)
- HMAC-SHA256 signature verification with constant-time comparison
- Zod schema validation of webhook payload
- Only processes `order.paid` events; acknowledges all others with 200
- Returns 500 on server errors (triggers Razorpay retry)

### Security Features
- **Server-side price recomputation**: `getVerifiedCart()` re-fetches prices from Firestore, never trusts client
- **Stock capping**: Quantities capped at available inventory
- **HMAC verification**: Both client verify and webhook verify use `crypto.timingSafeEqual`
- **Ownership check**: Pending order UID must match authenticated user

---

## 4. Firebase Storage (Legacy Media)

### Configuration (`src/lib/firebase/storage.ts`)
- Uses client-side Firebase SDK
- Uploads to `product-images/` path with UUID prefix
- Returns download URL
- **Status**: Superseded by Cloudinary but still exported

---

## 5. External APIs

### Postal PIN Code Lookup
- `CheckoutClient.tsx` calls `https://api.postalpincode.in/pincode/{pin}` for auto-filling city/state from PIN code
- Client-side only, best-effort (fails silently)

---

## 6. Hosting & Delivery (Netlify)

### Configuration (`netlify.toml`)
- Build command: `npm run build`
- Publish directory: `.next`
- Secret scan exclusions configured for public Firebase/Razorpay identifiers
- `.planning/` directory excluded from secret scanning

### Security Headers (`next.config.ts`)
Applied globally to all routes:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- **Content Security Policy**: Allowlists for Razorpay, Firebase, Cloudinary, Google Fonts

### Additional Security (`src/proxy.ts`)
- `X-DNS-Prefetch-Control: on`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(self)`
- HSTS header (production only, in proxy)
