# Features Research: Commerce & Accounts

## Authentication & Accounts (ACC)
**Table Stakes:**
- Login/Signup via Email and Password.
- Secure Session Management (persisting auth state across full-page reloads using cookies or Firebase tokens).

**Differentiators:**
- Personal "Wishlists" saved directly into the user's Firestore document.
- Saved Addresses to drastically accelerate checkout times for returning buyers.

## Commerce & Checkout (CHK)
**Table Stakes:**
- Transition from the existing "Bag" to a secure Address Input -> Payment Flow.
- Razorpay order creation & payment verification (preventing malicious frontend manipulation of prices).
- Converting a successful payment into a realized `Order` document within Firestore.

**Anti-features (Out of scope V1):**
- Split payments or layaway.
- Abandoned cart recovery campaigns.

## Catalog Management (ADM)
**Table Stakes:**
- Admin UI must accept native image files (PNG/JPG) vs text-only URL inputs.
- Auto-uploading of the image to Firebase Storage and appending the permanent download URL back to the product details payload.

## Catalog UI (CAT)
**Table Stakes:**
- Search bar querying the `products` cache.
- Category filters (Dresses, Outerwear, etc.) and Size filters.
