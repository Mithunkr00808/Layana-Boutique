# Integrations Reference

## Firebase
The application relies heavily on Firebase for data storage and potential authentication.

### Client-side Connection
- **Config**: `src/lib/firebase/config.ts`
- **Instance**: Initialized using standard `firebase/app` and `firebase/firestore`.
- **Usage**: Exported `db` instance is used in Client Components for real-time updates or simple reads where Server Components aren't suitable.
- **Environment Variables**:
  - `NEXT_PUBLIC_FIREBASE_API_KEY`
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - ...all prefixed with `NEXT_PUBLIC` for client access.

### Admin SDK (Server-side)
- **Config**: `src/lib/firebase/admin.ts`
- **Instance**: Initialized using `firebase-admin/app` and `firebase-admin/firestore`.
- **Credential**: Uses `admin.credential.cert(...)` likely with an environment variable pointing to a service account JSON or direct credential strings.
  - **Variable**: `FIREBASE_ADMIN_CREDENTIALS` or `FIREBASE_SERVICE_ACCOUNT_KEY`.
- **Usage**: Used for seeding scripts and secure server-only data fetching in Server Components where bypassing client-side rules is required.

## Data Utilities
- **Seeding**: `scripts/seed-firebase.ts` provides a mechanism to populate Firestore with sample boutique products and collections.
- **Mocking**: `src/lib/data.ts` contains fallback logic or sample data structures used before full database integration.
