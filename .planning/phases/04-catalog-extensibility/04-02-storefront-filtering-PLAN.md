---
wave: 2
depends_on: [04-01]
files_modified:
  - src/app/ready-to-wear/page.tsx
  - src/components/ProductGrid.tsx
  - src/lib/data.ts
autonomous: true
requirements: [CAT-01]
---

# Plan 04-02: Storefront Filtering with URL Parameters

<objective>
Add category/size filters on Ready-to-Wear with URL param sync (e.g., `?category=outerwear&size=fr38`) and server-side filtering.
</objective>

<tasks>

## Task 1: Data Filtering Support

<task>
<read_first>
- src/lib/data.ts
</read_first>
<action>
Extend `getReadyToWearProducts` (and/or add `getFilteredProducts(filters)`) to accept optional filters: `category`, `size`. For Firebase mode, apply Firestore queries; for mock data, filter array. Return products already filtered.
</action>
<acceptance_criteria>
- Helper accepts filters and returns filtered results in both Firebase and mock modes.
</acceptance_criteria>
</task>

## Task 2: Ready-to-Wear Page with URL Params

<task>
<read_first>
- src/app/ready-to-wear/page.tsx
- src/components/ProductGrid.tsx
</read_first>
<action>
- Parse `searchParams` for `category` and `size`.
- Call filtered data helper with these params.
- Pass current filters to `ProductGrid` for UI state.
</action>
<acceptance_criteria>
- URL params drive server data; navigating with params shows filtered products.
</acceptance_criteria>
</task>

## Task 3: ProductGrid Filter UI

<task>
<read_first>
- src/components/ProductGrid.tsx
</read_first>
<action>
- Add filter controls (category select, size select) that update URL params via router (shallow push).
- Preserve existing styling; keep sort button placeholder unchanged.
</action>
<acceptance_criteria>
- Changing filters updates URL and re-fetches filtered data.
- Controls reflect active selections from URL.
</acceptance_criteria>
</task>

</tasks>

<verification_criteria>
- `npm run build` passes.
- Visiting `/ready-to-wear?category=new-arrivals&size=fr38` returns filtered list.
- UI controls show active filters and update URL on change.
</verification_criteria>

<must_haves>
- Server-side filtering (no client-only filter).
- URL param sync for category and size.
</must_haves>
