"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, User, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type PublicUser = {
  id: string;
  name: string;
  role: "SUPER_ADMIN" | "ADMIN" | "VIEWER";
  registeredAt: string | Date;
};

type Stats = {
  total: number;
  superAdmins: number;
  admins: number;
  viewers: number;
};

export default function RegisteredAccountsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "ADMIN" | "VIEWER">("ALL");

  useEffect(() => {
    fetch("/api/registered-accounts")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setStats(data.stats);
          setUsers(data.users);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter((u) => {
    if (filter === "ALL") return true;
    if (filter === "ADMIN") return u.role === "ADMIN" || u.role === "SUPER_ADMIN";
    return u.role === "VIEWER";
  });

  function getRoleLabel(role: string) {
    if (role === "SUPER_ADMIN") return "Super Admin";
    if (role === "ADMIN") return "Admin HR";
    return "Karyawan (Viewer)";
  }

  function getRoleBadgeVariant(role: string) {
    if (role === "SUPER_ADMIN") return "default";
    if (role === "ADMIN") return "secondary";
    return "muted";
  }

  function formatDateID(value: string | Date) {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4">
          <Link href="/login" className="flex items-center gap-2 text-sm font-medium">
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-semibold">Daftar Akun Terdaftar</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Akun yang sudah terdaftar untuk akses aplikasi
            </p>
          </div>
          <Button asChild size="sm">
            <Link href="/register">
              <UserPlus className="h-4 w-4" />
              Daftar
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="mb-8 grid gap-4 sm:grid-cols-4">
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Akun</p>
                    <p className="text-2xl font-semibold">{stats?.total ?? 0}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-950">
                    <ShieldCheck className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Super Admin</p>
                    <p className="text-2xl font-semibold">{stats?.superAdmins ?? 0}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-950">
                    <User className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Admin HR</p>
                    <p className="text-2xl font-semibold">{stats?.admins ?? 0}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="rounded-full bg-emerald-100 p-3 dark:bg-emerald-950">
                    <Users className="h-6 w-6 text-emerald-600 dark:text-emerald-300" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Karyawan</p>
                    <p className="text-2xl font-semibold">{stats?.viewers ?? 0}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filter Tabs */}
            <div className="mb-6 flex gap-2 border-b pb-2">
              <button
                onClick={() => setFilter("ALL")}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  filter === "ALL"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                Semua ({stats?.total ?? 0})
              </button>
              <button
                onClick={() => setFilter("ADMIN")}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  filter === "ADMIN"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                Admin HR ({(stats?.admins ?? 0) + (stats?.superAdmins ?? 0)})
              </button>
              <button
                onClick={() => setFilter("VIEWER")}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  filter === "VIEWER"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                Karyawan ({stats?.viewers ?? 0})
              </button>
            </div>

            {/* Users List */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Akun
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Deskripsi Akses
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          Terdaftar
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filtered.map((user) => (
                        <tr
                          key={user.id}
                          className="transition-colors hover:bg-muted/50"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-medium text-primary">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium">{user.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={getRoleBadgeVariant(user.role)}>
                              {getRoleLabel(user.role)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {user.role === "SUPER_ADMIN"
                              ? "Akses penuh termasuk manajemen user"
                              : user.role === "ADMIN"
                                ? "Bisa mengelola data karyawan"
                                : "Hanya bisa melihat data karyawan"}
                          </td>
                          <td className="px-6 py-4 text-sm text-muted-foreground">
                            {formatDateID(user.registeredAt)}
                          </td>
                        </tr>
                      ))}
                      {filtered.length === 0 && (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-6 py-8 text-center text-muted-foreground"
                          >
                            Tidak ada akun dengan filter ini
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>

      <footer className="border-t bg-card py-4">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground">
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            ← Kembali ke Login
          </Link>
          <span className="mx-2">|</span>
          <Link
            href="/register"
            className="font-medium text-primary hover:underline"
          >
            Daftar Akun Baru
          </Link>
        </div>
      </footer>
    </div>
  );
}