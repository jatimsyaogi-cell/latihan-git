import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { EmployeeListQuery } from "@/lib/validations/employee";

export function buildEmployeeWhere(query: {
  q?: string;
  department?: string;
  status?: EmployeeListQuery["status"];
}): Prisma.EmployeeWhereInput {
  const { q, department, status } = query;

  return {
    AND: [
      q
        ? {
            OR: [
              { name: { contains: q } },
              { nip: { contains: q } },
              { email: { contains: q } },
            ],
          }
        : {},
      department ? { department } : {},
      status ? { status } : {},
    ],
  };
}

export async function getEmployees(query: EmployeeListQuery) {
  const { q, department, status, page, pageSize, sort, order } = query;

  const where = buildEmployeeWhere({ q, department, status });

  const [data, total] = await Promise.all([
    prisma.employee.findMany({
      where,
      orderBy: { [sort]: order },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.employee.count({ where }),
  ]);

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getEmployeeById(id: string) {
  return prisma.employee.findUnique({ where: { id } });
}

export async function getEmployeesForExport(query: {
  q?: string;
  department?: string;
  status?: EmployeeListQuery["status"];
}) {
  const where = buildEmployeeWhere(query);

  return prisma.employee.findMany({
    where,
    orderBy: { name: "asc" },
  });
}

export async function getEmployeeStats() {
  const [total, active, inactive] = await Promise.all([
    prisma.employee.count(),
    prisma.employee.count({ where: { status: "ACTIVE" } }),
    prisma.employee.count({ where: { status: "INACTIVE" } }),
  ]);

  return { total, active, inactive };
}

export type DepartmentStat = {
  department: string;
  total: number;
  active: number;
  inactive: number;
};

export async function getDepartmentStats(): Promise<DepartmentStat[]> {
  // SQLite tidak mendukung groupBy + count dengan filter kondisional bersamaan
  // secara mulus, jadi ambil semua lalu agregat di aplikasi (aman untuk data skala ini).
  const employees = await prisma.employee.findMany({
    select: { department: true, status: true },
  });

  const map = new Map<string, DepartmentStat>();

  for (const employee of employees) {
    const existing = map.get(employee.department) ?? {
      department: employee.department,
      total: 0,
      active: 0,
      inactive: 0,
    };

    existing.total += 1;
    if (employee.status === "ACTIVE") {
      existing.active += 1;
    } else {
      existing.inactive += 1;
    }

    map.set(employee.department, existing);
  }

  return Array.from(map.values()).sort((a, b) =>
    a.department.localeCompare(b.department),
  );
}

/**
 * Buat NIP berurutan berikutnya berdasarkan NIP tertinggi yang ada.
 * Format: EMP001, EMP002, ..., EMP999, EMP1000.
 * Mencari selisih (hole) tidak dilakukan — hanya menambah dari maks.
 */
export async function generateNextNip(): Promise<string> {
  const employees = await prisma.employee.findMany({
    select: { nip: true },
  });

  let max = 0;
  for (const employee of employees) {
    const match = employee.nip.match(/^EMP0*(\d+)$/i);
    if (match) {
      const n = parseInt(match[1], 10);
      if (Number.isFinite(n) && n > max) max = n;
    }
  }

  const next = max + 1;
  return `EMP${String(next).padStart(3, "0")}`;
}

export async function getUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
}

export type UserData = Awaited<ReturnType<typeof getUsers>>[number];
