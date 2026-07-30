import type { Employee } from "@prisma/client";
import { formatDate } from "@/lib/utils";

const COLUMNS = [
  { header: "NIP", value: (e: Employee) => e.nip },
  { header: "Nama", value: (e: Employee) => e.name },
  { header: "Email", value: (e: Employee) => e.email },
  { header: "Telepon", value: (e: Employee) => e.phone ?? "" },
  { header: "Departemen", value: (e: Employee) => e.department },
  { header: "Jabatan", value: (e: Employee) => e.position },
  { header: "Status", value: (e: Employee) => e.status },
  { header: "Tanggal Masuk", value: (e: Employee) => formatDate(e.joinedAt) },
  {
    header: "Dibuat",
    value: (e: Employee) => formatDate(e.createdAt),
  },
] as const;

function escapeCsv(value: string): string {
  if (/[\n",]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function employeesToCsv(employees: Employee[]): string {
  const headerRow = COLUMNS.map((c) => escapeCsv(c.header)).join(",");
  const rows = employees.map((employee) =>
    COLUMNS.map((c) => escapeCsv(c.value(employee))).join(","),
  );

  // BOM agar Excel membaca UTF-8 dengan benar
  return `﻿${[headerRow, ...rows].join("\r\n")}`;
}
