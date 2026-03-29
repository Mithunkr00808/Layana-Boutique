# Commerce & Accounts Requirements

## v1 Requirements

### Authentication
- [ ] **AUTH-01**: User can sign up/login with Email and Password.
- [ ] **AUTH-02**: Auth state is maintained securely across server restarts and navigations (SSR).
- [ ] **AUTH-03**: Users can log out securely ending their session cookie.

### Accounts
- [ ] **ACC-01**: Authenticated user can view past orders successfully placed.
- [ ] **ACC-02**: Authenticated user can save commonly used Shipping Addresses to quickly populate checkout.
- [ ] **ACC-03**: User can save out-of-cart "Wishlist" items securely linked to their account.

### Checkout & Payment
- [x] **CHK-01**: Users can enter a shipping address and be redirected directly to a Razorpay gateway.
- [x] **CHK-02**: Backend Server Action compiles correct Subtotals dynamically from Firestore rules (un-fakable).
- [x] **CHK-03**: Backend securely verifies the Razorpay payment signature from successful callback response data.
- [x] **CHK-04**: An order confirmation email/SMS receipt is triggered post-purchase (optional depending on Razorpay setup).

### Admin Panel
- [ ] **ADM-01**: Added "Order History" view to the backend admin dashboard to inspect verified purchases.
- [ ] **ADM-02**: The `ProductForm` utilizes a `<input type="file" />` that streams directly to a Firebase Storage bucket, natively returning an HTTPS img URL to store inside `productDetails`.

### Catalog & Search
- [ ] **CAT-01**: Filtering capability by native properties (Category, Size).
- [ ] **CAT-02**: Implementation of Keyword search for products.

---
## v2 Requirements (Deferred)
- [ ] **V2-01**: Guest Checkouts (Unauthenticated flow)
- [ ] **V2-02**: Cart abandoned email campaigns.
- [ ] **V2-03**: Apple Pay / Direct Wallet Integrations outside Razorpay standard flow.

## Out of Scope
- [ ] International shipping rate calculation (Flat rate Indian distribution for V1).
- [ ] Multi-currency support.

## Traceability
*To be filled by the roadmapper agent*
