import { Page } from "@playwright/test";

export class LoginPage {
  constructor(public readonly page: Page) {}

  async goto() {
    await this.page.goto("/login");
  }

  async login(email: string, password: string) {
    await this.page.goto("/login");
    await this.page.getByLabel("Email").fill(email);
    await this.page.getByLabel("Password").fill(password);
    await this.page.getByRole("button", { name: /Masuk/i }).click();
  }

  get emailInput() {
    return this.page.getByLabel("Email");
  }

  get passwordInput() {
    return this.page.getByLabel("Password");
  }

  get submitButton() {
    return this.page.getByRole("button", { name: /Masuk/i });
  }
}
