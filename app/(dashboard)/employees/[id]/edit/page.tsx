import { notFound } from "next/navigation";
import { getEmployeeById } from "@/lib/employees/queries";
import { PageHeader } from "@/components/layout/page-header";
import { EmployeeForm } from "@/components/employees/employee-form";

export const metadata = {
  title: "Edit Karyawan",
};

type EditEmployeePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditEmployeePage({
  params,
}: EditEmployeePageProps) {
  const { id } = await params;
  const employee = await getEmployeeById(id);

  if (!employee) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <PageHeader
        title="Edit Karyawan"
        description={`Perbarui data ${employee.name}`}
      />
      <EmployeeForm mode="edit" employee={employee} />
    </div>
  );
}
