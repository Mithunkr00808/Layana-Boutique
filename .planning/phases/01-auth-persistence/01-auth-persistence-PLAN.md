---
wave: 1
depends_on: []
files_modified: []
autonomous: true
requirements: [AUTH-01, AUTH-02, AUTH-03, ACC-02, ACC-03]
---

# Phase 1: Auth & Persistence - Verification Plan

<objective>
To verify that the existing codebase (which was pulled in from `main` remotely) fully implements Phase 1. As noted in the `01-RESEARCH.md`, the components already exist for Auth, Session Management, Address Collection, and Wishlist behavior. This plan does not require writing new features, but merely verifying the project builds correctly and conforms to Phase 1's goal before we mark the phase as executed.
</objective>

<verification_criteria>
- The project compiles correctly (`npm run build`).
- The necessary authentication routes/components are present.
- The project has no egregious errors regarding Firebase Admin and Client SDK definitions in `src/app/api/auth/session/route.ts` and `src/app/(auth)/*`.
</verification_criteria>

<must_haves>
- `npm run build` must succeed to ensure the codebase state is stable for Phase 2.
</must_haves>

---

## Task 1: Verify Inherited Codebase Integrity

<task>
<action>
Verify that the Layana Boutique application builds cleanly. Execute `npm run build` at the project root to guarantee the remote commits did not introduce immediate environment or build regressions. Since `f8fd66a` added the auth pages and session APIs, building the Next.js app validates the type safety and structural integrity of the implementation.
</action>
<read_first>
- `package.json`
- `.planning/phases/01-auth-persistence/01-RESEARCH.md`
</read_first>
<automated>
npm run build
</automated>
<acceptance_criteria>
- Output of `npm run build` contains "Compiled successfully" or "Route (app)" mapping and exits with a 0 code.
- No severe unhandled compilation errors related to Firebase or standard Next.js routing.
</acceptance_criteria>
</task>
