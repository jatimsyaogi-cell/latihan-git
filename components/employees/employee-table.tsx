import Link from "next/link";
import type { Employee } from "@prisma/client";
import { formatDate } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { EmployeeStatusBadge } from "@/components/employees/employee-status-badge";
import { DeleteEmployeeDialog } from "@/components/employees/delete-employee-dialog";
import { EmptyState } from "@/components/employees/empty-state";

type EmployeeTableProps = {
  data: Employee[];
  hasActiveFilters?: boolean;
};

export function EmployeeTable({
  data,
  hasActiveFilters = false,
}: EmployeeTableProps) {
  if (data.length === 0) {
    return (
      <EmptyState
        title={
          hasActiveFilters
            ? "Tidak ada hasil"
            : "Belum ada data karyawan"
        }
        description={
          hasActiveFilters
            ? "Coba ubah kata kunci atau filter pencarian."
            : "Tambahkan karyawan pertama untuk mulai mengelola data."
        }
        showAction={!hasActiveFilters}
      />
    );
  }

  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>NIP</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead className="hidden md:table-cell">Email</TableHead>
            <TableHead className="hidden lg:table-cell">Departemen</TableHead>
            <TableHead className="hidden lg:table-cell">Jabatan</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden xl:table-cell">Masuk</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell className="font-medium">{employee.nip}</TableCell>
              <TableCell>
                <div className="font-medium">{employee.name}</div>
                <div className="text-xs text-muted-foreground md:hidden">
                  {employee.email}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {employee.email}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {employee.department}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {employee.position}
              </TableCell>
              <TableCell>
                <EmployeeStatusBadge status={employee.status} />
              </TableCell>
              <TableCell className="hidden xl:table-cell">
                {formatDate(employee.joinedAt)}
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/employees/${employee.id}`}>Detail</Link>
                  </Button>
                  <Button asChild variant="secondary" size="sm">
                    <Link href={`/employees/${employee.id}/edit`}>Edit</Link>
                  </Button>
                  <DeleteEmployeeDialog
                    employeeId={employee.id}
                    employeeName={employee.name}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
