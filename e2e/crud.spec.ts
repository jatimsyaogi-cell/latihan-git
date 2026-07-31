import { test, expect } from "./fixtures";

const ADMIN_EMAIL = process.env.PLAYWRIGHT_ADMIN_EMAIL ?? "admin@example.com";
const ADMIN_PASSWORD = process.env.PLAYWRIGHT_ADMIN_PASSWORD ?? "jati123";

test.beforeEach(async ({ page, loginPage }) => {
  await loginPage.login(ADMIN_EMAIL, ADMIN_PASSWORD);
  await expect(page).toHaveURL(/\/employees/);
});

test.describe("CRUD Karyawan", () => {
  test("tambah karyawan baru muncul di list", async ({ page }) => {
    await page.getByRole("link", { name: /Tambah Karyawan/i }).click();
    await expect(page).toHaveURL(/\/employees\/new/);

    const unique = Date.now();
    const name = `Test Karyawan ${unique}`;
    const email = `test${unique}@example.com`;

    await page.getByLabel("NIP").fill(`EMP${unique}`);
    await page.getByLabel("Nama lengkap").fill(name);
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Jabatan").fill("QA Engineer");

    await page.getByRole("button", { name: /Simpan/i }).click();

    // List diurutkan nip asc & dipaginasi, jadi baris baru ada di halaman terakhir.
    // Filter dengan nama unik agar barisnya tampil di halaman 1.
    await expect(page).toHaveURL(/\/employees\/?$/);
    await page.getByPlaceholder(/Cari nama, NIP, atau email/i).fill(name);

    await expect(page.getByRole("row", { name: new RegExp(name, "i") })).toBeVisible();
  });

  test("validasi form menampilkan error", async ({ page }) => {
    await page.getByRole("link", { name: /Tambah Karyawan/i }).click();
    await page.getByRole("button", { name: /Simpan/i }).click();

    await expect(page.getByText(/Nama minimal 2 karakter/i)).toBeVisible();
    await expect(page.getByText(/Email tidak valid/i)).toBeVisible();
  });
});
