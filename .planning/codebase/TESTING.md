# Testing State

## Current Ecosystem
Currently, no formalized automatic testing framework (like Jest or Playwright) is active within the application. The project relies extensively on manual "UAT" (User Acceptance Testing) workflows to verify component mounting, routing accuracy, and database integration integrity.

## Mock Fallbacks acts as Tests
The `src/data/mockData.ts` effectively serves as a continuous integration harness. Since Firebase fetch tools in `src/lib/data.ts` conditionally fallback to `productDetailMock` when IDs mismatch or the environment forgets `FIREBASE_PROJECT_ID`, the UI can be functionally validated without external dependency stability.

## Future Testing Integrations
- Given the heavily nested Next.js React Server Components structure, E2E Testing natively (Cypress or Playwright) will likely be needed to appropriately test the Server Actions boundary calls.
