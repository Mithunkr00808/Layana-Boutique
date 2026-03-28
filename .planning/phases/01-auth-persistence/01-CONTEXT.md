# Phase 1: Auth & Persistence - Context

**Gathered:** 2026-03-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Securely adapt the Next.js boundary to handle Firebase Auth persistently across pages, enabling the creation of Wishlists and pre-saved Shipping Addresses attached to a UID.
</domain>

<decisions>
## Implementation Decisions

### Authentication Location
- **D-01:** Login and Signup should be hosted on a dedicated route (e.g., `/login`), rather than in a modal overlay, to keep tracking and architecture straightforward.

### Session Strategy
- **D-02:** Next.js Server Actions setting HTTP Cookies will be the sync target for Firebase Client Auth — allowing immediate page refreshing without wiping logged-in state.

### Wishlist & Guest Behavior
- **D-03:** "Anonymous" favoriting of products must fall back gracefully to the browser's `localStorage` API so users aren't aggressively prompted to login immediately. Upon logging in, this array should safely merge/upload to their final Firebase `users/{uid}/wishlists` subcollection.

### Address Complexity
- **D-04:** Shipping address collection is strictly Indian fields internally structured via Zod/React-Hook-Form without advanced/paid Google Maps autocompletion for Version 1.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Foundational Spec
- `.planning/PROJECT.md` — The overall core e-commerce architecture strategy

</canonical_refs>
