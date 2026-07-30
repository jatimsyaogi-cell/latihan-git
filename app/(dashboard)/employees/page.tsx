import Link from "next/link";
import { Download, Plus } from "lucide-react";
import { getEmployees, getEmployeeStats, getDepartmentStats } from "@/lib/employees/queries";
import { employeeListQuerySchema } from "@/lib/validations/employee";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeFilters } from "@/components/employees/employee-filters";
import { EmployeeTable } from "@/components/employees/employee-table";
import { DepartmentStats } from "@/components/employees/department-stats";
import { EmployeePagination } from "@/components/employees/employee-pagination";
import { Suspense } from "react";

export const metadata = {
  title: "Daftar Karyawan",
};

type EmployeesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function EmployeesPage({
  searchParams,
}: EmployeesPageProps) {
  const raw = await searchParams;
  const normalized = {
    q: firstValue(raw.q),
    department: firstValue(raw.department),
    status: firstValue(raw.status),
    page: firstValue(raw.page),
    pageSize: firstValue(raw.pageSize),
    sort: firstValue(raw.sort),
    order: firstValue(raw.order),
  };

  const parsedParams = employeeListQuerySchema.safeParse(normalized);
  const params = parsedParams.success
    ? parsedParams.data
    : employeeListQuerySchema.parse({});
  const [result, stats, departmentStats] = await Promise.all([
    getEmployees(params),
    getEmployeeStats(),
    getDepartmentStats(),
  ]);

  const hasActiveFilters = Boolean(
    params.q || params.department || params.status,
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <PageHeader
        title="Daftar Karyawan"
        description="Kelola data karyawan: cari, filter, tambah, ubah, dan hapus."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" disabled={result.total === 0}>
              <Link
                href={`/employees/export?${new URLSearchParams({
                  ...(params.q ? { q: params.q } : {}),
                  ...(params.department ? { department: params.department } : {}),
                  ...(params.status ? { status: params.status } : {}),
                }).toString()}`}
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Link>
            </Button>
            <Button asChild>
              <Link href="/employees/new">
                <Plus className="h-4 w-4" />
                Tambah Karyawan
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{stats.active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Nonaktif
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{stats.inactive}</p>
          </CardContent>
        </Card>
      </div>

      <DepartmentStats stats={departmentStats} />

      <Suspense fallback={null}>
        <EmployeeFilters />
      </Suspense>

      <EmployeeTable
        data={result.data}
        hasActiveFilters={hasActiveFilters}
      />

      <EmployeePagination
        page={result.page}
        totalPages={result.totalPages}
        total={result.total}
        pageSize={result.pageSize}
        searchParams={{
          q: params.q || undefined,
          department: params.department,
          status: params.status,
          pageSize: String(params.pageSize),
          sort: params.sort,
          order: params.order,
        }}
      />
    </div>
  );
}
