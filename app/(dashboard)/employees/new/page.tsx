import { PageHeader } from "@/components/layout/page-header";
import { EmployeeForm } from "@/components/employees/employee-form";

export const metadata = {
  title: "Tambah Karyawan",
};

export default function NewEmployeePage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <PageHeader
        title="Tambah Karyawan"
        description="Isi data karyawan baru. NIP dan email harus unik."
      />
      <EmployeeForm mode="create" />
    </div>
  );
}
