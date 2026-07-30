import Link from "next/link";
import { notFound } from "next/navigation";
import { getEmployeeById } from "@/lib/employees/queries";
import { formatDate } from "@/lib/utils";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmployeeAvatar } from "@/components/employees/employee-avatar";
import { EmployeeStatusBadge } from "@/components/employees/employee-status-badge";
import { DeleteEmployeeDialog } from "@/components/employees/delete-employee-dialog";

export const metadata = {
  title: "Detail Karyawan",
};

type EmployeeDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EmployeeDetailPage({
  params,
}: EmployeeDetailPageProps) {
  const { id } = await params;
  const employee = await getEmployeeById(id);

  if (!employee) {
    notFound();
  }

  const fields = [
    { label: "NIP", value: employee.nip },
    { label: "Nama", value: employee.name },
    { label: "Email", value: employee.email },
    { label: "Telepon", value: employee.phone || "—" },
    { label: "Departemen", value: employee.department },
    { label: "Jabatan", value: employee.position },
    { label: "Tanggal masuk", value: formatDate(employee.joinedAt) },
    { label: "Dibuat", value: formatDate(employee.createdAt) },
    { label: "Diperbarui", value: formatDate(employee.updatedAt) },
  ];

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <PageHeader
        title={employee.name}
        description={`Detail data karyawan · ${employee.nip}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/employees">Kembali</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href={`/employees/${employee.id}/edit`}>Edit</Link>
            </Button>
            <DeleteEmployeeDialog
              employeeId={employee.id}
              employeeName={employee.name}
              triggerVariant="destructive"
              triggerSize="default"
            />
          </div>
        }
      />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-4">
            <EmployeeAvatar
              name={employee.name}
              src={employee.avatarUrl}
              size={72}
            />
            <div>
              <CardTitle className="text-xl">{employee.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {employee.position} · {employee.department}
              </p>
            </div>
          </div>
          <EmployeeStatusBadge status={employee.status} />
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            {fields.map((field) => (
              <div key={field.label} className="space-y-1">
                <dt className="text-sm text-muted-foreground">{field.label}</dt>
                <dd className="font-medium">{field.value}</dd>
              </div>
            ))}
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}
