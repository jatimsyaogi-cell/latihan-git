export const DEPARTMENTS = [
  "Human Resources",
  "Engineering",
  "Finance",
  "Marketing",
  "Operations",
  "Sales",
] as const;

export type Department = (typeof DEPARTMENTS)[number];

export const STATUS_LABELS = {
  ACTIVE: "Aktif",
  INACTIVE: "Nonaktif",
} as const;

export type EmployeeStatusValue = keyof typeof STATUS_LABELS;
