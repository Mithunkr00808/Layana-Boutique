# Codebase Structure

## Directory Overview
The primary working directory is the standard Next.js `src` tree.

- `src/app/` - The Next.js App Router namespace.
  - `admin/` - Holds all backend GUI interfaces for managing catalogs.
  - `cart/` - Holds cart listing UI and `actions.ts` for database cart mutation.
  - `product/[id]/` - Holds the dynamic product rendering details.
- `src/components/` - Shared and reusable React UI Components. Includes presentation models like `CartItems.tsx`, `CartSummary.tsx` and `NewArrivals.tsx`. Admin components specifically reside closer to implementation, e.g. `src/app/admin/catalog/_components/ProductForm.tsx`.
- `src/data/` - Holds hard-coded fallback files (i.e. `mockData.ts`) used as placeholders during build time or missing DB queries.
- `src/lib/` - Holding core API logic.
  - `firebase/` - Firebase client/admin initializations (`config.ts`, `admin.ts`).
  - `data.ts` - Central wrapper mapping queries to DB objects.

## Helper Directories
- `scripts/` - Ad-hoc utilities like `seed-firebase.ts` used to originally bootstrap the DB via Firebase batches.
