# Codebase Stack

*Last reviewed: 2026-04-15*

## Core Technologies
- **Language**: TypeScript 5.9.x (strict-ish mode, selective `any` suppressions remain)
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

## Current Version Posture

`npm outdated` shows the stack is modern and healthy, with only incremental updates pending:

- **Core framework/runtime**
  - `next` 16.2.1 → 16.2.3 (patch)
  - `react` / `react-dom` 19.2.4 → 19.2.5 (patch)
- **Backend/auth/data**
  - `firebase` 12.11.0 → 12.12.0
  - `firebase-admin` 13.7.0 → 13.8.0
- **Tooling**
  - `eslint-config-next` 16.2.1 → 16.2.3
  - `react-hook-form` 7.72.0 → 7.72.1
  - `dotenv` 17.4.1 → 17.4.2
- **Not recommended yet**
  - `typescript` 5.9.3 → 6.0.2 (major; defer until Next.js ecosystem guidance stabilizes for TS 6)

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

## Industry-Standard Fit Assessment

### Keep as-is (strong fit)
- Next.js App Router + React 19 + TypeScript
- Firebase Auth session-cookie model with Admin SDK server verification
- Firestore + Server Actions for mutation-heavy BFF pattern
- Razorpay order lifecycle with server-side price recomputation and HMAC verification
- Tailwind v4 + shadcn primitives for fast UI iteration

### Upgrade soon (low-risk maintenance)
- Apply the available patch/minor upgrades listed above.
- Add a testing stack baseline (`playwright` for E2E + `vitest` for server utility tests).
- Add observability (Sentry or OpenTelemetry + structured logs) for production incidents.

### No stack replacement needed now
- There is no evidence requiring migration away from Next.js/Firebase/Razorpay/Tailwind.
- Current risks are implementation/process maturity gaps (testing, monitoring, data-model consistency), not core stack mismatch.
