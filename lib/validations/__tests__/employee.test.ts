import { describe, it, expect } from "vitest";
import {
  employeeFormSchema,
  employeeCreateSchema,
  employeeIdSchema,
  employeeListQuerySchema,
} from "../employee";

const validEmployee = {
  name: "Andi Wijaya",
  email: "andi@example.com",
  phone: "081234567890",
  department: "Engineering",
  position: "Software Engineer",
  status: "ACTIVE",
  joinedAt: new Date("2023-01-15"),
};

describe("employeeFormSchema", () => {
  it("validates a correct employee payload", () => {
    const result = employeeFormSchema.safeParse({
      ...validEmployee,
      nip: "EMP001",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = employeeFormSchema.safeParse({
      ...validEmployee,
      nip: "EMP001",
      name: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.name).toBeDefined();
    }
  });

  it("rejects invalid email", () => {
    const result = employeeFormSchema.safeParse({
      ...validEmployee,
      nip: "EMP001",
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email).toBeDefined();
    }
  });

  it("rejects unknown department", () => {
    const result = employeeFormSchema.safeParse({
      ...validEmployee,
      nip: "EMP001",
      department: "UnknownDept",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.department).toBeDefined();
    }
  });

  it("rejects invalid status", () => {
    const result = employeeFormSchema.safeParse({
      ...validEmployee,
      nip: "EMP001",
      status: "PENDING",
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty phone", () => {
    const result = employeeFormSchema.safeParse({
      ...validEmployee,
      nip: "EMP001",
      phone: "",
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty avatarUrl", () => {
    const result = employeeFormSchema.safeParse({
      ...validEmployee,
      nip: "EMP001",
      avatarUrl: "",
    });
    expect(result.success).toBe(true);
  });
});

describe("employeeCreateSchema", () => {
  it("accepts empty nip (auto-generated on server)", () => {
    const result = employeeCreateSchema.safeParse({
      ...validEmployee,
      nip: "",
    });
    expect(result.success).toBe(true);
  });

  it("accepts missing nip entirely", () => {
    const { nip, ...withoutNip } = { ...validEmployee, nip: "EMP001" };
    const result = employeeCreateSchema.safeParse(withoutNip);
    expect(result.success).toBe(true);
  });

  it("accepts provided nip", () => {
    const result = employeeCreateSchema.safeParse({
      ...validEmployee,
      nip: "EMP200",
    });
    expect(result.success).toBe(true);
  });
});

describe("employeeIdSchema", () => {
  it("accepts any non-empty id string", () => {
    const result = employeeIdSchema.safeParse("ckzp0x2mh0000abcd1234efgh");
    expect(result.success).toBe(true);
  });

  it("rejects empty string", () => {
    const result = employeeIdSchema.safeParse("");
    expect(result.success).toBe(false);
  });
});

describe("employeeListQuerySchema", () => {
  it("parses valid query params", () => {
    const result = employeeListQuerySchema.safeParse({
      q: "andi",
      department: "Engineering",
      status: "ACTIVE",
      page: 2,
      pageSize: 10,
      sort: "name",
      order: "asc",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.q).toBe("andi");
    }
  });

  it("applies defaults for empty query", () => {
    const result = employeeListQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.pageSize).toBe(10);
      expect(result.data.sort).toBe("nip");
      expect(result.data.order).toBe("asc");
    }
  });

  it("coerces string page to number", () => {
    const result = employeeListQuerySchema.safeParse({ page: "3" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
    }
  });

  it("rejects negative page", () => {
    const result = employeeListQuerySchema.safeParse({ page: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects pageSize over 50", () => {
    const result = employeeListQuerySchema.safeParse({ pageSize: 100 });
    expect(result.success).toBe(false);
  });
});
