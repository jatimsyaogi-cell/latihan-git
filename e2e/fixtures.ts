import { test as base, expect } from "@playwright/test";
import { LoginPage } from "./pages/login";
import { EmployeesPage } from "./pages/employees";

export type TestFixtures = {
  loginPage: LoginPage;
  employeesPage: EmployeesPage;
};

export const test = base.extend<TestFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  employeesPage: async ({ page }, use) => {
    await use(new EmployeesPage(page));
  },
});

export { expect } from "@playwright/test";