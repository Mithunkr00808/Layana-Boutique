# Codebase Stack

## Core Technologies
- **Language**: TypeScript 5.x (strict-ish mode, `any` suppressed via eslint in data.ts/checkout)
- **Framework**: Next.js 16.2.1 (App Router)
- **UI Library**: React 19.2.4 (Server Components by default, selective `"use client"`)
- **CSS Framework**: Tailwind CSS v4 (via `@tailwindcss/postcss`)
- **Form Handling**: React Hook Form 7.72 + `@hookform/resolvers` (zod binding)
- **Validation**: Zod 4.3.6 (server actions, API routes, schemas)
- **Animation**: Framer Motion 12.38.0
- **Icons**: Lucide React 1.8.0
- **UI Primitives**: shadcn/ui 4.2.0 (Button, Dialog, Input, Label only)

## State & Data
- **Database / Backend**: Firebase Firestore (via `firebase-admin` 13.7.0 server-side)
- **Auth Provider**: Firebase Auth (client: `firebase` 12.11.0, server: session cookies via Admin SDK)
- **Media Storage**: Cloudinary (primary, v2 SDK 2.9) + Firebase Storage (legacy fallback)
- **Payment Gateway**: Razorpay (SDK 2.9.6, key-based init)
- **State Management**: React Context (`AuthContext`, `WishlistContext`) + local `useState`/`useTransition`

## Infrastructure
- **Hosting**: Netlify (configured in `netlify.toml`)
- **Build**: `next build` → `.next` output
- **Dev**: `next dev`
- **Script Execution**: `tsx` 4.21 (for seed scripts)
- **Linting**: ESLint 9 + `eslint-config-next`

## Key Dependencies
| Package | Version | Purpose |
|---------|---------|---------|
| `firebase` | 12.11.0 | Client-side auth + Firestore init |
| `firebase-admin` | 13.7.0 | Server-side Firestore, Auth, Storage |
| `cloudinary` | 2.9.0 | Media upload, transformation, deletion |
| `razorpay` | 2.9.6 | Payment order creation + HMAC verification |
| `framer-motion` | 12.38.0 | Page transitions, scroll animations |
| `zod` | 4.3.6 | Schema validation across Server Actions |
| `class-variance-authority` | 0.7.1 | Component variant styling (shadcn) |
| `clsx` / `tailwind-merge` | Latest | Conditional className composition |
| `tw-animate-css` | 1.4.0 | Tailwind animation utilities |

## Environment Variables

### Server-only (never exposed to browser)
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
- `FIREBASE_STORAGE_BUCKET`
- `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

### Client-side (`NEXT_PUBLIC_*`)
- `NEXT_PUBLIC_FIREBASE_*` (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId)
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- `NEXT_PUBLIC_SITE_URL`
