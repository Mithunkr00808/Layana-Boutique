# Concerns Reference

## Tech Debt
- **No Automated Testing**: High risk for regressions during new feature development or refactoring.
- **Firebase Mix**: Usage of both `firebase-admin` and `firebase` client SDKs needs clear boundaries to prevent accidental client-side exposure of admin credentials.

## Security
- **Environment Variables**: Verify that all Firebase keys are strictly managed via `.env` and never hardcoded in the repository.
- **Validation**: Ensure Firestore Security Rules are in place, as client-side code (`src/lib/firebase/config.ts`) bypasses server-side checks.

## Architecture
- **Data Fetching Consistency**: The project currently fetching data in `src/lib/data.ts` should be monitored to ensure it scales as the product catalog grows.
