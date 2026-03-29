# Architecture Research: Commerce & Accounts

## Data Flow
The system needs to introduce several new domain models in Firestore:

- `users` (Managed actively by Firebase Auth, but a companion Firestore document is needed to map shipping addresses, metadata, and auth tokens natively to SSR rules).
- `wishlists` (Can be embedded on the `user` doc or maintained as a subcollection `users/{uid}/wishlists/{product_id}`).
- `orders` (Created initially as "pending" before sending to Razorpay. Upon webhook or successful client callback verification, transitions to "paid" status).

## Component Boundaries
- **Storefront & UI Filters:** The product index will need to shift from simple static lists to dynamically filtered query maps. This involves a client-side URL search parameter router (using Next.js `useSearchParams` and standard Link tags) and Server Actions fetching dynamic Firebase payloads.
- **Admin File Uploads:** A new Firebase Storage bucket path `catalog/`. The admin `ProductForm` triggers standard HTML file inputs. A server action can securely take that buffer, upload to Firebase Storage by generating a public Download URL, and append it normally into `productDetails`.
- **Checkout Flow Context**: Managing a cart tied to a user token vs anonymous sessions requires migrating local cookies/anonymous IPs over to Firebase UID upon authentication.
