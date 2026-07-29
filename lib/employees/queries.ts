import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { EmployeeListQuery } from "@/lib/validations/employee";

export async function getEmployees(query: EmployeeListQuery) {
  const { q, department, status, page, pageSize, sort, order } = query;

  const where: Prisma.EmployeeWhereInput = {
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

export async function getEmployeeStats() {
  const [total, active, inactive] = await Promise.all([
    prisma.employee.count(),
    prisma.employee.count({ where: { status: "ACTIVE" } }),
    prisma.employee.count({ where: { status: "INACTIVE" } }),
  ]);

  return { total, active, inactive };
}
