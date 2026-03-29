# Roadmap: Commerce & Accounts

## Overview
**4 phases** | **14 requirements mapped**

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|------------------|
| 1 | Auth & Persistence | Establish global session state, wishlists, and address saving | AUTH-01, AUTH-02, AUTH-03, ACC-02, ACC-03 | 4 |
| 2 | Razorpay Checkout Flow | Secure server-side dynamic cart checkout and crypto verification | CHK-01, CHK-02, CHK-03, CHK-04 | 4 |
| 3 | Order Management | Integrate Order fulfillment into both User Profile and Admin Panel | ADM-01, ACC-01 | 3 |
| 4 | Catalog Extensibility | Native image uploading and storefront advanced search filtering | ADM-02, CAT-01, CAT-02 | 3 |

---

## Phase Details

### Phase 1: Auth & Persistence
**Goal**: Securely adapt the Next.js boundary to handle Firebase Auth persistently across pages, enabling the creation of Wishlists and pre-saved Shipping Addresses attached to a UID.
**Requirements**: AUTH-01, AUTH-02, AUTH-03, ACC-02, ACC-03
**UI hint**: yes
**Success criteria**:
1. User can successfully sign up/login and remains auth'd completely after a hard browser refresh.
2. User can navigate to an `/account` page securely.
3. User can favorite/unfavorite a product on the catalog and view it in a wishlist.
4. User can create, edit, and select an Indian shipping address.

### Phase 2: Razorpay Checkout Flow
**Goal**: Bridge the native `Bag` to a secure payments model using Razorpay API, verifying totals actively via the server rather than trusting the React array.
**Requirements**: CHK-01, CHK-02, CHK-03, CHK-04
**UI hint**: yes
**Success criteria**:
1. Clicking 'Checkout' redirects to Razorpay modal with correct INR pricing (calculated strictly back-end).
2. The UI handles payment cancellation gracefully.
3. Successful completion triggers a Server Action hitting Razorpay's Verification API securely.
4. A new "Order" document is fired into Firestore denoting `status: 'paid'`.

### Phase 3: Order Management
**Goal**: Surface the `orders` collection efficiently to both the end-user (for their receipts) and the Admin (for fulfillment).
**Requirements**: ADM-01, ACC-01
**UI hint**: yes
**Success criteria**:
1. End user `/account/orders` page displays their past history tied exactly to their UID.
2. The backend `/admin` namespace features a new `orders` generic table showing all purchases.
3. Razorpay Reference IDs/Receipts are printed clearly on both UI views.

### Phase 4: Catalog Extensibility
**Goal**: Overhaul catalog management by removing remote text-based `https://` URLs for images using Firebase Storage instead, alongside building dynamic storefront URL Param search features.
**Requirements**: ADM-02, CAT-01, CAT-02
**UI hint**: yes
**Success criteria**:
1. Admin `ProductForm` utilizes a native OS file uploader.
2. Firebase Storage bucket generates a persistant IMG token flawlessly appended as `ProductDetail.images`.
3. Storefront URL actively updates via `?category=x&size=y`, dynamically re-filtering the items cleanly.
