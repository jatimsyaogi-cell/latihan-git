import { NextResponse } from "next/server";
import { getEmployeesForExport } from "@/lib/employees/queries";
import { employeeListQuerySchema } from "@/lib/validations/employee";
import { employeesToCsv } from "@/lib/employees/csv";

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const normalized = {
    q: firstValue(searchParams.get("q") ?? undefined),
    department: firstValue(searchParams.get("department") ?? undefined),
    status: firstValue(searchParams.get("status") ?? undefined),
  };

  const parsed = employeeListQuerySchema.safeParse({
    q: normalized.q,
    department: normalized.department,
    status: normalized.status,
  });

  const filters = parsed.success ? parsed.data : {};
  const employees = await getEmployeesForExport({
    q: filters.q,
    department: filters.department,
    status: filters.status,
  });

  const csv = employeesToCsv(employees);
  const stamp = new Date().toISOString().slice(0, 10);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="karyawan-${stamp}.csv"`,
    },
  });
}
