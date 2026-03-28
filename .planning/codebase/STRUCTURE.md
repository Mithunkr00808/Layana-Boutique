# Structure Reference

```text
/Layana-Boutique
├── .planning/                  # GSD planning system artifacts
│   └── codebase/               # Base codebase mapping
├── public/                     # Static assets (SVGs, favicon)
├── scripts/                    # Utility scripts
│   └── seed-firebase.ts        # Script to seed Firestore data
├── src/                        # Source code
│   ├── app/                    # Next.js App Router (pages, layouts, styles)
│   │   ├── cart/               # Shopping cart experience
│   │   ├── product/            # Dynamic product detail routes ([id])
│   │   ├── ready-to-wear/      # Product category listing
│   │   ├── globals.css         # Tailwind directives and global styles
│   │   └── page.tsx            # Landing page
│   ├── components/             # Reusable UI components
│   │   ├── CartItems.tsx       # Cart line-item management
│   │   ├── ProductDetails.tsx  # Product deep-dive UI
│   │   ├── EditorialReveal.tsx # Premium motion reveal logic
│   │   └── ...                 # Atoms, Molecules, and Features
│   ├── data/                   # Data logic (potentially moved from src/lib)
│   └── lib/                    # Core logic and integrations
│       ├── firebase/           # Firebase client and admin instances
│       └── data.ts             # Data fetching and simulation logic
├── next.config.ts              # Next.js specific configuration
├── package.json                # Project dependencies and scripts
└── tsconfig.json               # TypeScript path and compiler options
```
