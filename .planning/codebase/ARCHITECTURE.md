# Architecture

## Core Pattern
- **App Router Architecture:** Utilizing the Next.js `app` directory for Server Components by default. React boundaries (`"use client"`) are used only when interactive state management (such as form submission or useTransition hooks in the cart/admin) is necessary.
- **Server Actions for Mutations:** For forms, DB updates (like Cart updates or adding inventory), asynchronous Next.js Server Actions are invoked (e.g. `src/app/cart/actions.ts` & `src/app/admin/actions.ts`) to immediately update Firebase cleanly and call `revalidatePath`.

## Data Fetching & Flow
- **Data Hydration Strategy:** The data entry layer acts defensively (`src/lib/data.ts`). Whenever a `ProductDetail` fetch fails but a `Product` summary exists, the application populates a safe default object locally to render seamlessly on the frontend without database side effects.
- **Backend Data Storage:** Separated into concurrent writes: 
  - `products`: Simplified summary index used for catalog and listing rendering.
  - `productDetails`: Extended object used for individual views involving massive arrays of sizing, images, and editorial descriptions.

## Routing
- `/` - Main storefront handled statically or via ISR.
- `/cart` - User checkout and item summary area, heavily interactive with `useTransition` state updates.
- `/product/[id]` - Dynamic route fetching detailed product definitions.
- `/admin` - Backend dashboard workspace protected with parallel routing logic.
