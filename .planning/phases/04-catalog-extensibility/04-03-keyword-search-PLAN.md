---
wave: 3
depends_on: [04-02]
files_modified:
  - src/lib/data.ts
  - src/app/ready-to-wear/page.tsx
  - src/components/ProductGrid.tsx
  - src/app/(root)/page.tsx
autonomous: true
requirements: [CAT-02]
---

# Plan 04-03: Keyword Search Across Storefront Catalog

<objective>
Implement text search for products (name/options/category) with debounced client input, server-side filtering, and URL param `q`.
</objective>

<tasks>

## Task 1: Data Search Support

<task>
<read_first>
- src/lib/data.ts
</read_first>
<action>
Add optional `query` parameter to the filtered products helper to perform case-insensitive search on name/options/category. For Firebase, use `.where`/`.orderBy` fallback to fetch and filter in memory if Firestore limitations apply; for mock data, filter array.
</action>
<acceptance_criteria>
- Helper filters results by keyword in both Firebase and mock modes.
</acceptance_criteria>
</task>

## Task 2: Search UI and URL Sync

<task>
<read_first>
- src/components/ProductGrid.tsx
- src/app/ready-to-wear/page.tsx
</read_first>
<action>
- Add search input in ProductGrid toolbar.
- Debounce input (e.g., 300ms) and update URL param `q`; reflect active search in initial render via `searchParams`.
- Combine with existing category/size filters.
</action>
<acceptance_criteria>
- Typing updates URL and triggers filtered search results.
- Loading state or subtle spinner while searching.
</acceptance_criteria>
</task>

## Task 3: Home Hero Search (Optional Enhancement)

<task>
<read_first>
- src/app/(root)/page.tsx
</read_first>
<action>
Add a small search CTA on home hero that deep-links to `/ready-to-wear?q=<term>` (no inline results needed).
</action>
<acceptance_criteria>
- Home search input/link routes with q param and shows results on arrival.
</acceptance_criteria>
</task>

</tasks>

<verification_criteria>
- `npm run build` passes.
- `/ready-to-wear?q=silk` shows only matching products; combined filters still work.
- Home search deep link opens filtered page.
</verification_criteria>

<must_haves>
- URL-driven search; server-side filtering.
- Debounced client input to avoid noisy navigation.
</must_haves>
