# Stack Research: Commerce & Accounts

## Technologies Assessed
For integrating Commerce (Checkout) and Accounts (Auth & Wishlists) into a Next.js + Firebase application:

### Authentication & Storage
- **Auth Provider**: Firebase Authentication (Specifically `@firebase/auth` on client, `firebase-admin` on server).
  - *Rationale*: Reusing your current Firebase payload is logical. It prevents introducing external dependencies like NextAuth or Supabase simply for logins, while natively bridging with your Firestore DB rules if needed.
- **Image Storage**: Firebase Cloud Storage.
  - *Rationale*: Allows native image blobs to upload seamlessly alongside the admin actions directly using the `firebase-admin` SDK or Client SDK. 

### Payment Processing
- **Gateway**: Razorpay.
  - *Rationale*: You specifically mandated Razorpay. It has great react-based wrappers and handles INR natively.
  - *Integration Method*: Use the official `razorpay` node SDK for creating server-side orders via Server Actions, and a lightweight script loader (like `react-use-razorpay` or native script tags) on the client for the checkout modal.

### State & Logic
- **Forms**: React Hook Form with Zod (optional but recommended for robust checkout address validation) or simply native `formData` with Next.js Server Actions (current paradigm).
