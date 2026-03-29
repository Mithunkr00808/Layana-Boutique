---
wave: 1
depends_on: []
files_modified:
  - src/app/admin/catalog/_components/ProductForm.tsx
  - src/app/admin/actions.ts
  - src/lib/firebase/config.ts
  - src/lib/firebase/storage.ts
  - .env.local
autonomous: true
requirements: [ADM-02]
---

# Plan 04-01: Admin Product Image Uploads via Firebase Storage

<objective>
Enable admins to upload product images directly to Firebase Storage and persist the secure download URL into `productDetails.images` and `products.image`.
</objective>

<tasks>

## Task 1: Storage Client Utility

<task>
<read_first>
- src/lib/firebase/config.ts
</read_first>
<action>
Add `src/lib/firebase/storage.ts` exporting a singleton `storage` and helper `uploadImage(file: File): Promise<string>` that:
- Uses `getStorage(app)` from Firebase client SDK.
- Uploads to `product-images/{uuid}-{originalName}`.
- Calls `getDownloadURL` to return the HTTPS URL.
Ensure `config.ts` exports initialized app compatible with storage import.
</action>
<acceptance_criteria>
- `storage` is reusable; upload helper returns a download URL.
</acceptance_criteria>
</task>

## Task 2: ProductForm File Input + Upload Flow

<task>
<read_first>
- src/app/admin/catalog/_components/ProductForm.tsx
- src/app/admin/actions.ts
</read_first>
<action>
- Replace image URL text input with file input (accept images). Keep optional URL fallback for editing existing products.
- On submit, if a File is provided, call `uploadImage` client-side before `saveCatalogItem`; pass resulting URL in `FormData` (field `image`).
- Show lightweight upload progress/disabled state while uploading.
</action>
<acceptance_criteria>
- Admin can choose a file and form submits with resulting Storage URL.
- Existing edit flow still works (prefills existing image URL).
</acceptance_criteria>
</task>

## Task 3: Persist URL in Admin Action

<task>
<read_first>
- src/app/admin/actions.ts
</read_first>
<action>
- Ensure `image` value from FormData is used for both summary `products` doc and detail `productDetails.images[0].src`.
- Keep alt text as before; no other fields change.
</action>
<acceptance_criteria>
- Stored product documents reflect the new URL from upload.
</acceptance_criteria>
</task>

## Task 4: Env & Config Check

<task>
<read_first>
- .env.local
</read_first>
<action>
Document required Storage env vars (`NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`) and verify existing config references them; add placeholders if missing.
</action>
<acceptance_criteria>
- `.env.local` contains Storage bucket key (placeholder acceptable).
</acceptance_criteria>
</task>

</tasks>

<verification_criteria>
- `npm run build` passes.
- Uploading an image results in a valid HTTPS URL in both `products` and `productDetails`.
- Editing a product with no new file keeps prior URL.
</verification_criteria>

<must_haves>
- Firebase Storage upload path with unique filenames.
- Download URL persisted in product docs.
- Graceful UX state during upload.
</must_haves>
