import { expect, test } from "@playwright/test";

test.describe("auth and checkout smoke", () => {
  test("login page renders sign-in heading", async ({ page }) => {
    const response = await page.goto("/login");
    expect(response?.ok()).toBeTruthy();
    await expect(page.getByRole("heading", { name: "Sign in to your account" })).toBeVisible();
  });

  test("checkout redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/checkout");
    await expect(page).toHaveURL(/\/login\?returnUrl=%2Fcheckout/);
  });
});

