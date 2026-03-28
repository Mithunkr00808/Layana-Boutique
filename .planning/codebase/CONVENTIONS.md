# Conventions Reference

## Coding Style
- **TypeScript**: Consistent use of types (`interface`, `type`) for data structures.
- **Components**: PascalCase filenames for React components (`Navbar.tsx`).
- **File Organization**: Grouped by features and folders (`src/app`, `src/components`, `src/lib`).

## Naming
- **Routes**: Use lowercase for folder-based routing in `src/app`.
- **Utilities**: Suffix utility files with their purpose where possible (`admin.ts`, `config.ts`, `data.ts`).
- **Styles**: `globals.css` for Tailwind directives.

## Styling (Tailwind)
- **Utility-first**: No ad-hoc CSS unless strictly necessary.
- **Animations**: Prefer `framer-motion` over raw CSS transitions for complex UI motion.
- **Next.js Conventions**: App Router patterns, layouts, and server/client separation.

## Linting
- **ESLint**: configured via `eslint.config.mjs` and `eslint-config-next`.
- **Prettier**: Implicitly follows Next.js linting standards.
