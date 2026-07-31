import { test, expect } from "./fixtures";

const ADMIN_EMAIL = process.env.PLAYWRIGHT_ADMIN_EMAIL ?? "admin@example.com";
const ADMIN_PASSWORD = process.env.PLAYWRIGHT_ADMIN_PASSWORD ?? "jati123";

test.beforeEach(async ({ page, loginPage }) => {
  await loginPage.login(ADMIN_EMAIL, ADMIN_PASSWORD);
  await expect(page).toHaveURL(/\/employees/);
});

test.describe("Daftar Karyawan", () => {
  test("menampilkan tabel karyawan setelah login", async ({ employeesPage }) => {
    await employeesPage.expectVisible();
    await expect(employeesPage.page.getByRole("table")).toBeVisible();
  });

  test("search memfilter hasil", async ({ employeesPage }) => {
    await employeesPage.expectVisible();
    await employeesPage.search("andi");

    // Baris yang cocok tetap muncul
    await expect(employeesPage.page.getByText("andi", { exact: false }).first()).toBeVisible();
  });

  test("filter departemen menampilkan hasil", async ({ employeesPage }) => {
    await employeesPage.expectVisible();
    await employeesPage.page.getByRole("combobox").first().click();
    await employeesPage.page.getByRole("option", { name: /Engineering/i }).click();

    // Tabel masih tampil
    await expect(employeesPage.page.getByRole("table")).toBeVisible();
  });
});
