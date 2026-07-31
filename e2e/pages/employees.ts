import { Page, expect } from "@playwright/test";

export class EmployeesPage {
  constructor(public readonly page: Page) {}

  async goto() {
    await this.page.goto("/employees");
  }

  async expectVisible() {
    await expect(this.page.getByRole("heading", { name: /Karyawan/i })).toBeVisible();
  }

  get searchInput() {
    return this.page.getByPlaceholder(/Cari nama, NIP, atau email/i);
  }

  get addButton() {
    return this.page.getByRole("link", { name: /Tambah Karyawan/i });
  }

  async search(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(400); // debounce
  }
}
