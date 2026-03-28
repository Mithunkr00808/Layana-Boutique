# Codebase Stack

## Core Technologies
- **Language**: TypeScript (using tsx for script execution)
- **Framework**: Next.js 16.2.1
- **UI Library**: React 19.2.4
- **CSS Framework**: Tailwind CSS v4

## State & Data
- **Database/Backend**: Firebase Firestore (via `firebase` and `firebase-admin` v13)
- **State Management**: React Hooks (`useState`, `useTransition`) combined with Next.js Server Actions.

## Key Dependencies
- `firebase` (12.11.0): Client-side Firebase SDK for auth and basic setup.
- `firebase-admin` (13.7.0): Server-side Firebase Admin SDK used in Server Actions.
- `framer-motion` (12.38.0): Library for UI animations.
- `lucide-react`: Minimalist icon library.
- `@tailwindcss/postcss`: Required for Tailwind v4 integration.

## Configuration
- Environment variables securely manage Firebase keys for both client (`NEXT_PUBLIC_FIREBASE_*`) and Admin SDK (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`).
