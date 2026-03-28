# Coding Conventions

## Styles & Standards
- **CSS Framework**: Tailwind CSS is the strict standard, eliminating arbitrary inline CSS.
- **Language Rules**: TypeScript strict typing is encouraged. For rapid prototyping within server actions or internal admin dashboards, `any` is currently accepted but slated for eventual removal under strict mode configurations.
- **Components**: Functional React components with hooks. 

## Best Practices Supported
- **"use server" Directives**: Keep server-only operations strongly separated within dedicated `actions.ts` files inside App Router pathways. Never export server execution logic from client-facing page bodies directly if complexity scales.
- **Progressive Hydration in UI**: Components like the `CartItems.tsx` implement `useTransition` for optimistic or pending states, so users do not experience lagging while backend database mutations are processed. Instead of blocking the whole application, the interactive subset merely displays a loader.

## Error Handling
- Minimal error boundaries exist currently.
- Functions gracefully fall back: `getProductDetail()` will yield a hydrated mock rather than hard-crashing if a specific property was not defined inside the catalog database. Data layers log issues to backend consoles but prevent UI disruption.
