import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { AddUserForm } from "@/components/users/add-user-form";
import { getSession, canManageUsers } from "@/lib/auth/session";

export const metadata = {
  title: "Tambah Akun",
};

export default async function NewUserPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (!canManageUsers(session.role)) {
    redirect("/employees");
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <PageHeader
        title="Tambah Akun"
        description="Buat akun baru untuk mengakses sistem."
      />
      <AddUserForm />
    </div>
  );
}
