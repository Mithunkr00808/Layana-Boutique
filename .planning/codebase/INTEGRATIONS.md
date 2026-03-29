# External Integrations

## Database Integration: Firebase Firestore
The application heavily relies on Google Firebase for real-time and server-rendered data persistence.

### 1. Client-Side Firebase SDK (`src/lib/firebase/config.ts`)
- **Usage**: Initializes the connection to the Firebase backend.
- **Config**: Relies on Next.js public environment variables starting with `NEXT_PUBLIC_FIREBASE_`.

### 2. Server-Side Firebase Admin SDK (`src/lib/firebase/admin.ts`)
- **Usage**: Handles privileged database operations entirely on the Node.js backend to bypass client rules securely. 
- **Key implementation**: Translates `\n` characters mapped in `.env.local` to standard newlines for the `FIREBASE_PRIVATE_KEY` during initialization.

## Hosting & Delivery
- Designed to be deployed on Vercel or any Node.js environment supporting Next.js Server Actions.

## Key Subsystems
- **Data Hydration**: Handled locally via `src/lib/data.ts`. The backend checks Firebase; if full details are missing (i.e. summary catalog items vs full models), the system dynamically populates defaults to prevent application crashes.
