# Testing Reference

## Current Status
> [!WARNING]
> No automated testing framework (Jest, Vitest, Playwright, etc.) was detected in the base repository.

## Recommendations
- **Unit Testing**: Add [Vitest](https://vitest.dev/) for testing business logic and Firebase utilities.
- **E2E Testing**: Add [Playwright](https://playwright.dev/) to verify critical user paths such as Cart additions and Checkout.
- **CI/CD**: Integrate test runs into the deployment pipeline to maintain boutique-level quality.
- **Manual Verification**: Currently, validation relies on manual browser testing and `npx get-shit-done-cc` status checks.
