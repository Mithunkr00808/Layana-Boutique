# Coding Conventions

## Naming & Organization

### File Naming
- **Pages**: `page.tsx` (Next.js convention)
- **Layouts**: `layout.tsx`
- **Server Actions**: `actions.ts` — colocated with the route that uses them
- **Client Components**: PascalCase filenames matching component name (e.g., `CheckoutClient.tsx`)
- **Utilities/Libraries**: camelCase filenames (e.g., `cloudinary.ts`, `siteSettings.ts`)
- **Types**: Separate `types/` directory for shared interfaces, inline for module-local types

### Component Patterns
- **Functional components** exclusively (no class components)
- **Server Components by default** — no directive needed
- **Client Components** marked with `"use client"` at top of file
- **Server Actions** marked with `"use server"` at top of file
- **Private components**: `_components/` directory convention (e.g., `admin/_components/`)
- **Component props**: Explicit interface/type definitions, passed as named props

### Route Group Conventions
- `(auth)` — groups auth pages without affecting URL
- `(protected)` — wraps admin routes with auth guard layout

## TypeScript Usage

### Current Practice
- **Strict-ish**: TypeScript strict mode enabled but `@typescript-eslint/no-explicit-any` is suppressed via eslint in several files
- **Frequent `any` usage**: `data.ts`, `CheckoutClient.tsx`, `orders.ts` — mostly for Firestore document data
- **Type assertions**: `doc.data() as any` pattern used extensively for Firestore reads
- **Defensive nullish checks**: Extensive use of `??`, `?.`, and fallback defaults

### Typing Standards
- Shared types defined in `src/lib/data.ts` (Product, CartItem, Order, Address, etc.)
- Domain types in `src/types/` (ProductMedia)
- Zod schemas for runtime validation (not just compile-time)
- Server Action return types use discriminated unions: `{ success: true; ... } | { success: false; error: string }`

## Server Actions Pattern

### Consistent Structure
```typescript
"use server";

export async function actionName(input: Type): Promise<ResultType> {
  // 1. Auth guard (requireSessionUid or assertAdminSession)
  // 2. Input validation (Zod parse)
  // 3. Business logic
  // 4. Database mutation
  // 5. Cache revalidation (revalidatePath/revalidateTag)
  // 6. Return typed result
}
```

### Best Practices Observed
- Every admin action starts with `await assertAdminSession()`
- Every user action starts with `getSessionUid()` or `requireSessionUid()`
- Zod validation on all external inputs
- `revalidatePath()` called on relevant routes after mutations
- Try/catch with console.error and graceful error returns

## Error Handling

### Current Strategy
- **Defensive fallbacks**: Functions return empty arrays (`[]`) or `null` on failure, never throw in data fetching
- **Console logging**: All errors logged server-side via `console.error` or `console.warn`
- **User-facing errors**: Returned as string messages in `{ success: false, error: "..." }` objects
- **Error boundary**: `error.tsx` exists at app root but is minimal
- **Loading states**: `loading.tsx` with skeleton screens at app and cart level

### Missing
- No structured error logging (Sentry, etc.)
- No error monitoring or alerting
- Limited error boundary coverage (only root level)

## CSS & Styling

### Framework: Tailwind CSS v4
- Utility-first with CSS custom properties for theming
- `globals.css` defines design tokens via CSS variables (e.g., `--color-primary`, `--color-secondary`)
- `cn()` utility from `src/lib/utils.ts` combining `clsx` + `tailwind-merge`
- shadcn/ui components for foundational primitives

### Typography
- Three font families loaded via `next/font/google`:
  - `Geist` — `--font-sans` (body text)
  - `Noto Serif` — `--font-noto-serif` (headings, editorial)
  - `Manrope` — `--font-manrope` (UI elements)
- Applied via CSS variable classes on `<html>`

### Design System Tokens
- Used consistently as Tailwind arbitrary values: `text-[var(--color-primary)]`
- Common pattern: `border-[var(--color-outline-variant)]/40`
- Surface layers: `--color-surface-container-low`, `--color-surface-container-lowest`

## Price Handling

### Format
- All prices stored as formatted strings with `₹` prefix (e.g., `"₹1,299.00"`)
- Cart items additionally carry `rawPrice: number` for calculations
- `formatIndianPrice()` in `data.ts` handles string→₹ conversion
- Indian locale formatting: `toLocaleString("en-IN")`

### Price Verification
- Server-side price re-fetch in checkout (`getVerifiedPrice()`)
- `getVerifiedCart()` re-reads prices from Firestore, caps at available stock
- Client-submitted prices are **never trusted** for payment creation

## Security Conventions

### CSRF Protection
- All API routes check `isSameOriginRequest(request)` before processing
- Validates `origin` and `referer` headers against allowed origins
- Returns 403 with `csrfRejectedResponse()` on failure

### Cookie Security
- Session cookies: `httpOnly`, `secure` (production), `sameSite: 'lax'`
- 5-day session expiration
- Separate `isAdmin` cookie for client-side admin UI hints

### Content Security Policy
- Strict CSP in `next.config.ts` headers
- Razorpay, Firebase, Cloudinary, Google Fonts allowlisted
- `unsafe-eval` and `unsafe-inline` allowed for script-src (required by Razorpay)
