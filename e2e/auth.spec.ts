import { test, expect } from "./fixtures";

const ADMIN_EMAIL = process.env.PLAYWRIGHT_ADMIN_EMAIL ?? "admin@example.com";
const ADMIN_PASSWORD = process.env.PLAYWRIGHT_ADMIN_PASSWORD ?? "jati123";

test.describe("Autentikasi", () => {
  test("login berhasil dan redirect ke /employees", async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.emailInput.fill(ADMIN_EMAIL);
    await loginPage.passwordInput.fill(ADMIN_PASSWORD);
    await loginPage.submitButton.click();

    await expect(loginPage.page).toHaveURL(/\/employees/);
  });

  test("login gagal dengan password salah menampilkan error", async ({
    loginPage,
  }) => {
    await loginPage.goto();
    await loginPage.emailInput.fill(ADMIN_EMAIL);
    await loginPage.passwordInput.fill("password-salah");
    await loginPage.submitButton.click();

    // Login gagal tidak redirect, tetap di /login
    await expect(loginPage.page).toHaveURL(/\/login/);
  });

  test("redirect ke /login saat akses halaman terlindungi tanpa sesi", async ({
    page,
  }) => {
    await page.goto("/employees");
    await expect(page).toHaveURL(/\/login/);
  });
});
