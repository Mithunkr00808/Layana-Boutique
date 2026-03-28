---
trigger: always_on
---

# SEO Meta Tags

**Status**: Production Ready ✅
**Last Updated**: 2026-01-14
**Source**: Schema.org, Open Graph Protocol, Twitter Developer Docs

---

## Quick Start

Every page needs:

```tsx
<head>
  {/* Basic SEO */}
  <title>Service in Location | Brand Name</title>
  <meta name="description" content="Value prop. Differentiator. Call to action." />
  <link rel="canonical" href="https://example.com/page" />

  {/* Open Graph */}
  <meta property="og:title" content="Service in Location" />
  <m