import { getUsers } from "@/lib/employees/queries";
import { requireSession } from "@/lib/auth/session";
import { canManageUsers } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserPlus, User } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Akun Pengguna",
};

export default async function UsersPage() {
  const session = await requireSession();

  if (!canManageUsers(session.role)) {
    redirect("/employees");
  }

  const users = await getUsers();

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <PageHeader
        title="Akun Pengguna"
        description="Kelola akun pengguna sistem. Hanya Super Admin yang bisa mengelola."
        actions={
          <Button asChild>
            <Link href="/users/new">
              <UserPlus className="h-4 w-4" />
              Tambah Akun
            </Link>
          </Button>
        }
      />

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {getRoleLabel(user.role)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/users/${user.id}/edit`}>
                        <User className="h-4 w-4 mr-1" />
                        Edit
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function getRoleLabel(role: string) {
  const labels: Record<string, string> = {
    SUPER_ADMIN: "Super Admin",
    ADMIN: "Admin",
    VIEWER: "Viewer",
  };
  return labels[role] ?? role;
}

function getRoleBadgeVariant(role: string) {
  switch (role) {
    case "SUPER_ADMIN":
      return "default";
    case "ADMIN":
      return "secondary";
    case "VIEWER":
      return "muted";
    default:
      return "outline";
  }
}
