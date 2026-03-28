# Architecture Reference

## Routing & Layouts
- **Next.js App Router**: Uses `src/app` for file-based routing.
- **Root Layout**: `src/app/layout.tsx` defines the shell of the application (Navbar, Footer, etc.).
- **Nested Routes**: `src/app/cart`, `src/app/product/[id]`, `src/app/ready-to-wear`.

## Components
- **Server Components (Default)**: Used for initial page rendering and Firebase data fetching.
- **Client Components (`'use client'`)**: Used for interactive sections like the cart, product galleries, and reveal animations.
- **Component Colocation**: UI components are centralized in `src/components`, grouped by feature (Cart, Product, Journal).

## Data Flow
- **Direct Database Access**: Pages and Server Components fetch data directly from Firestore via `db` in `src/lib/data.ts`.
- **Firebase Admin SDK**: Used in custom scripts (e.g., seeding) and potentially in API routes for secure operations.
- **Prop Drilling vs State**: Primarily props-driven for standard pages; interactive UI components manage local state.

## Styling & Theme
- **Tailwind CSS 4**: Modern utility-first CSS.
- **Theme Config**: Defined in `globals.css` and `next.config.ts`.
- **Aesthetics**: Premium, modern boutique design with a focus on editorial-style layouts and smooth transitions (Framer Motion).
