# Codebase Structure

*Last reviewed: 2026-04-15*

## Total Source Code
- Large Next.js app with App Router storefront + admin surfaces.
- Key hotspot files remain concentrated in checkout, admin actions, and shared data access modules.

## Directory Tree

```
src/
├── app/                          # Next.js App Router (24 pages, 4 API routes)
│   ├── (auth)/                   # Route group — no URL prefix
│   │   ├── layout.tsx            # Shared auth layout
│   │   ├── login/page.tsx        # Email/password login
│   │   ├── signup/page.tsx       # Registration
│   │   └── forgot-password/page.tsx
│   │
│   ├── account/                  # Authenticated user account
│   │   ├── page.tsx              # Dashboard (~10.8KB, largest page)
│   │   ├── actions.ts            # Server Actions: addresses, wishlist, preferences
│   │   ├── addresses/page.tsx
│   │   ├── orders/page.tsx
│   │   ├── preferences/page.tsx
│   │   └── wishlist/page.tsx
│   │
│   ├── admin/                    # Admin dashboard
│   │   ├── layout.tsx            # Minimal passthrough layout
│   │   ├── actions.ts            # Catalog CRUD Server Actions (414 lines)
│   │   ├── cloudinary-actions.ts # Signed upload Server Action
│   │   ├── login/                # Admin login (outside protection)
│   │   │   ├── page.tsx
│   │   │   └── AdminLoginClient.tsx  # Client-side admin login logic
│   │   ├── _components/          # Private admin-only components
│   │   │   └── AdminLoader.tsx
│   │   └── (protected)/          # Route group: requireAdminSession()
│   │       ├── layout.tsx        # Auth guard via requireAdminSession()
│   │       ├── page.tsx          # Dashboard
│   │       ├── catalog/          # List, new, edit pages  
│   │       ├── orders/page.tsx
│   │       ├── customers/page.tsx
│   │       ├── analytics/page.tsx
│   │       ├── settings/page.tsx
│   │       └── [...missing]/page.tsx  # Catch-all
│   │
│   ├── api/                      # API Route Handlers
│   │   ├── auth/session/route.ts # POST: Creates session cookie + user doc
│   │   ├── auth/logout/route.ts  # POST: Clears cookies
│   │   ├── cart/migrate/route.ts # POST: Guest→User cart merge
│   │   └── webhooks/razorpay/route.ts  # POST: Payment webhook
│   │
│   ├── cart/                     # Shopping cart
│   │   ├── page.tsx
│   │   ├── actions.ts            # Cart CRUD Server Actions
│   │   └── loading.tsx
│   │
│   ├── checkout/                 # Payment flow
│   │   ├── page.tsx              # Server Component: auth guard + data
│   │   ├── CheckoutClient.tsx    # Client Component: Razorpay SDK (471 lines)
│   │   └── actions.ts            # createOrder + verifyPayment
│   │
│   ├── collections/[slug]/       # Category pages
│   │   └── page.tsx
│   │
│   ├── order/[orderId]/
│   │   └── confirmation/page.tsx # Post-payment confirmation
│   │
│   ├── product/[id]/             # Product detail
│   │   └── page.tsx
│   │
│   ├── layout.tsx                # Root layout (fonts, providers, footer)
│   ├── page.tsx                  # Homepage
│   ├── globals.css               # Global styles + Tailwind theme
│   ├── error.tsx                 # Global error boundary
│   ├── loading.tsx               # Global loading skeleton
│   ├── not-found.tsx             # 404 page
│   ├── robots.ts                 # Dynamic robots.txt
│   └── sitemap.ts                # Dynamic XML sitemap
│
├── components/                   # Shared React components (20 files + 2 subdirs)
│   ├── Navbar.tsx                # Site navigation
│   ├── Hero.tsx                  # Hero section entry point
│   ├── HeroSlider.tsx            # Image carousel
│   ├── NewArrivals.tsx           # Product grid (latest 3)
│   ├── ProductGrid.tsx           # Full product listing (~8.9KB)
│   ├── ProductDetails.tsx        # Product detail layout (~9.5KB)
│   ├── ProductGallery.tsx        # Media gallery with video support (~7.4KB)
│   ├── RelatedProducts.tsx       # Related product cards
│   ├── CartItems.tsx             # Cart item list (~5.3KB)
│   ├── CartSummary.tsx           # Cart totals
│   ├── AccountSidebar.tsx        # Account navigation sidebar
│   ├── AdminSidebar.tsx          # Admin navigation sidebar
│   ├── WishlistButton.tsx        # Heart toggle button
│   ├── SortSelect.tsx            # Sort dropdown
│   ├── JournalPreview.tsx        # Article cards
│   ├── EditorialReveal.tsx       # Content reveal animation
│   ├── FadeIn.tsx                # Scroll-triggered fade animation
│   ├── Footer.tsx                # Site footer
│   ├── FooterWithData.tsx        # Footer data wrapper
│   ├── ConditionalFooter.tsx     # Footer visibility control
│   ├── seo/
│   │   └── jsonld.tsx            # JSON-LD structured data (Organization, WebSite)
│   └── ui/                       # shadcn/ui primitives (4 files)
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       └── label.tsx
│
├── hooks/
│   └── useWishlist.ts            # Wishlist hook (alternative to context)
│
├── lib/                          # Core business logic
│   ├── data.ts                   # Central data layer (~683 lines — monolith)
│   ├── orders.ts                 # Order fulfillment logic (232 lines)
│   ├── addresses.ts              # Address lookup
│   ├── cloudinary.ts             # Cloudinary SDK wrapper (174 lines)
│   ├── razorpay.ts               # Razorpay client init (7 lines)
│   ├── siteSettings.ts           # Site settings with migration (86 lines)
│   ├── utils.ts                  # cn() utility
│   ├── firebase/
│   │   ├── admin.ts              # Firebase Admin SDK singleton
│   │   ├── config.ts             # Firebase Client SDK singleton
│   │   └── storage.ts            # Firebase Storage upload (legacy)
│   ├── auth/
│   │   ├── session-user.ts       # User session utilities
│   │   └── admin-session.ts      # Admin session utilities
│   ├── catalog/
│   │   └── categories.ts         # Category constants + helpers (80 lines)
│   ├── contexts/
│   │   ├── AuthContext.tsx        # Auth state provider
│   │   └── WishlistContext.tsx    # Wishlist state provider
│   ├── schemas/
│   │   └── product.ts            # Zod product validation schema
│   └── security/
│       └── csrf.ts               # Same-origin request validation
│
├── types/
│   └── product-media.ts          # ProductMedia interface
│
└── proxy.ts                      # Next.js 16 proxy file-convention route protection

## Top-Level Config Files
├── next.config.ts                # Image domains, CSP, security headers, server actions limit
├── package.json                  # Dependencies manifest
├── tsconfig.json                 # TypeScript config
├── eslint.config.mjs             # ESLint config
├── postcss.config.mjs            # PostCSS (Tailwind v4)
├── netlify.toml                  # Netlify build config + secret scan exclusions
├── components.json               # shadcn/ui config
└── AGENTS.md                     # AI agent rules reference

## Helper Directories
├── scripts/                      # Utility scripts (seed-firebase.ts)
├── public/                       # Static assets (favicon, og-image, etc.)
└── .planning/                    # GSD project management
    ├── PROJECT.md                # Project overview & requirements
    ├── ROADMAP.md                # Milestone roadmap
    ├── STATE.md                  # Current state
    ├── MILESTONES.md             # Milestone tracker
    └── codebase/                 # ← This documentation
```

## File Size Hotspots (Largest Source Files)
| File | Lines | Purpose |
|------|-------|---------|
| `src/lib/data.ts` | ~683 | Central data layer (monolith) |
| `src/app/checkout/CheckoutClient.tsx` | 471 | Checkout UI + Razorpay integration |
| `src/app/admin/actions.ts` | 414 | Catalog CRUD with media handling |
| `src/app/account/actions.ts` | 243 | Account management Server Actions |
| `src/lib/orders.ts` | 232 | Order fulfillment logic |
| `src/app/cart/actions.ts` | 197 | Cart Server Actions |
| `src/app/api/webhooks/razorpay/route.ts` | 188 | Payment webhook |
| `src/lib/cloudinary.ts` | 174 | Media upload/delete |
