# Testing State

## Current Ecosystem

### Automated Tests: None
No formalized testing framework (Jest, Vitest, Playwright, Cypress) is installed or configured. The project has zero test files.

### Manual Validation
The project relies entirely on:
- Manual UAT (User Acceptance Testing)
- Console error monitoring during development
- Defensive data fallbacks acting as implicit integration tests

### Defensive Fallbacks as Safety Net
- `getProductDetail()` has a 2-tier fallback: productDetails → products → null
- Cart operations return `false` or empty arrays on failure
- Order functions use `??` chains with safe defaults for every field
- `formatIndianPrice()` gracefully handles malformed price strings

### Risk Assessment

| Critical Path | Coverage | Risk Level |
|----------------|----------|------------|
| Checkout → Payment → Fulfillment | Manual only | **HIGH** |
| Auth Login → Session Cookie → Protected Routes | Manual only | **HIGH** |
| Admin → Catalog CRUD → Media Upload | Manual only | **MEDIUM** |
| Cart → Guest/User Merge | Manual only | **MEDIUM** |
| Product Listing → Detail → Cart Add | Manual only | **LOW** |

## Recommended Testing Strategy

### Phase 1: E2E Critical Paths (Playwright)
Priority tests for the payment and auth flows:
1. **Checkout flow**: Login → Add to cart → Checkout → Razorpay mock → Confirmation
2. **Auth flow**: Signup → Login → Session persistence → Logout → Route protection
3. **Admin flow**: Admin login → Catalog create/edit/delete → Media upload
4. **Cart merge**: Guest cart → Login → Verify merged items

### Phase 2: Integration Tests (Vitest)
Server Action testing with Firebase Admin SDK mocks:
1. `fulfillOrder()` idempotency
2. `createOrder()` price verification
3. `verifyPayment()` HMAC validation
4. `saveCatalogItem()` media ordering
5. Address CRUD operations

### Phase 3: Component Tests
React Testing Library for interactive components:
1. `CheckoutClient` payment states
2. `CartItems` quantity updates
3. `ProductGallery` media switching
4. `WishlistContext` optimistic UI

## Key Testing Considerations
- Firebase Admin SDK requires mocking (no emulator configured)
- Razorpay SDK loading requires browser environment
- Server Actions need special test harness (async form submission simulation)
- Cloudinary uploads need mock or test account
