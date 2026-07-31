import { getUsers } from "@/lib/employees/queries";
import { requireSession } from "@/lib/auth/session";
import { canManageUsers } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { EditUserForm } from "@/components/users/edit-user-form";

export const metadata = {
  title: "Edit Akun",
};

type EditUserPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditUserPage({ params }: EditUserPageProps) {
  const session = await requireSession();

  if (!canManageUsers(session.role)) {
    redirect("/employees");
  }

  const { id } = await params;

  // Find user in DB
  const users = await getUsers();
  const user = users.find((u) => u.id === id);

  if (!user) {
    redirect("/users");
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <PageHeader
        title="Edit Akun"
        description={`Perbarui data akun ${user.name}`}
      />
      <EditUserForm user={user} />
    </div>
  );
}