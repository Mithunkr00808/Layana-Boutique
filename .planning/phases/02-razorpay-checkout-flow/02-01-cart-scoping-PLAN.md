---
wave: 1
depends_on: []
files_modified:
  - src/lib/data.ts
  - src/lib/firebase/admin.ts
  - src/app/cart/actions.ts
  - src/app/cart/page.tsx
  - src/components/CartItems.tsx
  - src/components/CartSummary.tsx
  - .env.local
autonomous: true
requirements: [CHK-02]
---

# Plan 02-01: Cart Scoping & Currency Migration

<objective>
Scope the cart to authenticated users (move from global `cartItems` to `users/{uid}/cart`) and switch all currency display from € to ₹ (INR). This is the foundation that the checkout flow depends on — without user-scoped carts, we can't associate orders with users or verify server-side totals per user.
</objective>

<tasks>

## Task 1: Update data.ts — User-Scoped Cart Fetching

<task>
<read_first>
- src/lib/data.ts
- src/lib/firebase/admin.ts
- src/app/api/auth/session/route.ts
</read_first>
<action>
Modify `getCartItems()` in `src/lib/data.ts` to accept a `userId: string` parameter. Change the Firestore query from `adminDb.collection('cartItems').get()` to `adminDb.collection('users').doc(userId).collection('cart').get()`. Keep the existing mock fallback when `FIREBASE_PROJECT_ID` is not set. Add a new `addToCart(userId: string, item: CartItem)` function that writes to `users/{uid}/cart`. Add `getCartItemsForUser()` as the primary export that extracts UID from the session cookie via `adminAuth.verifySessionCookie()`.

Concrete function signature:
```typescript
export async function getCartItemsForUser(): Promise<CartItem[]> {
  // 1. Read session cookie from cookies()
  // 2. Verify with adminAuth.verifySessionCookie(cookie)
  // 3. Extract uid
  // 4. Query adminDb.collection('users').doc(uid).collection('cart').get()
  // 5. Map to CartItem[]
  // 6. Fallback to cartItemsMock if no firebase or no session
}
```
</action>
<acceptance_criteria>
- `src/lib/data.ts` contains function `getCartItemsForUser`
- Function reads from `users/{uid}/cart` collection path
- Function calls `adminAuth.verifySessionCookie` to extract uid
- Function imports `cookies` from `next/headers`
- Mock fallback is preserved when `FIREBASE_PROJECT_ID` is not set
</acceptance_criteria>
</task>

## Task 2: Update cart/actions.ts — User-Scoped Mutations

<task>
<read_first>
- src/app/cart/actions.ts
- src/lib/firebase/admin.ts
</read_first>
<action>
Update `updateCartItemQuantity` in `src/app/cart/actions.ts` to:
1. Extract UID from the session cookie using `adminAuth.verifySessionCookie()`
2. Change the Firestore path from `adminDb.collection("cartItems").doc(id)` to `adminDb.collection("users").doc(uid).collection("cart").doc(id)`
3. Add a `removeCartItem(id: string)` Server Action that deletes from the user-scoped path
4. Add a `clearUserCart(uid: string)` Server Action (needed later for post-payment cart clearing)

All actions must validate the session cookie and return `false` if unauthenticated.
</action>
<acceptance_criteria>
- `src/app/cart/actions.ts` contains `updateCartItemQuantity` that reads from `users/{uid}/cart`
- `src/app/cart/actions.ts` contains `removeCartItem` function
- `src/app/cart/actions.ts` contains `clearUserCart` function
- All three functions call `adminAuth.verifySessionCookie` for auth
- `revalidatePath("/cart")` is called after each mutation
</acceptance_criteria>
</task>

## Task 3: Update CartSummary.tsx & CartItems.tsx — Currency to ₹

<task>
<read_first>
- src/components/CartSummary.tsx
- src/components/CartItems.tsx
</read_first>
<action>
In `src/components/CartSummary.tsx`:
- Line 16: Change `€{subtotal.toFixed(2)}` to `₹{subtotal.toLocaleString('en-IN')}`
- Line 24: Change `€0.00` to `₹0.00`
- Line 29: Change `€{subtotal.toFixed(2)}` to `₹{subtotal.toLocaleString('en-IN')}`

In `src/components/CartItems.tsx`:
- Find all `€` currency symbols and replace with `₹`
- Use `.toLocaleString('en-IN')` for number formatting

Global search for any remaining `€` symbols in `src/` and replace with `₹`.
</action>
<acceptance_criteria>
- `grep -r '€' src/` returns zero results
- `src/components/CartSummary.tsx` contains `₹` for all price displays
- `src/components/CartItems.tsx` contains `₹` for all price displays
- Prices use `.toLocaleString('en-IN')` formatting
</acceptance_criteria>
</task>

## Task 4: Update cart/page.tsx — Use User-Scoped Fetch

<task>
<read_first>
- src/app/cart/page.tsx
- src/lib/data.ts
</read_first>
<action>
Update `src/app/cart/page.tsx` to:
1. Import `getCartItemsForUser` instead of `getCartItems`
2. Call `const activeCart = await getCartItemsForUser();`
3. The rest of the page rendering remains the same
</action>
<acceptance_criteria>
- `src/app/cart/page.tsx` imports `getCartItemsForUser` from `@/lib/data`
- `src/app/cart/page.tsx` calls `getCartItemsForUser()` (no arguments — uid from cookie)
- Page still renders `CartItems` and `CartSummary` with the fetched items
</acceptance_criteria>
</task>

</tasks>

<verification_criteria>
- `npm run build` succeeds with no type errors
- All cart operations use `users/{uid}/cart` Firestore path
- Zero `€` symbols remain in source code
- All `₹` prices use Indian locale formatting
</verification_criteria>

<must_haves>
- User-scoped cart reading from `users/{uid}/cart`
- Server-side UID extraction via session cookie verification
- INR currency display across all cart-related components
</must_haves>
