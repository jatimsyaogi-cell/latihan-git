"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, ShieldCheck, UserCheck, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/layout/logout-button";
import { useEffect, useState } from "react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
};

export function AppSidebar() {
  const pathname = usePathname();
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "Pendataan Karyawan";
  const [role, setRole] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    void fetch("/api/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.role) setRole(data.role);
      })
      .catch(() => null);
  }, []);

  const navItems: NavItem[] = [
    { href: "/employees", label: "Karyawan", icon: Users },
    { href: "/activities", label: "Riwayat Aktivitas", icon: History, exact: true },
    { href: "/registered-accounts", label: "Daftar Akun", icon: UserCheck, exact: true },
    ...(mounted && role === "SUPER_ADMIN"
      ? [{ href: "/users", label: "Akun Pengguna", icon: ShieldCheck, exact: true } as NavItem]
      : []),
  ];

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-card md:flex md:flex-col">
      <div className="border-b px-6 py-5">
        <Link href="/employees" className="block">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Internal HR
          </p>
          <p className="mt-1 text-lg font-semibold leading-tight">{appName}</p>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4 space-y-3">
        <ThemeToggle />
        <LogoutButton />
      </div>
    </aside>
  );
}
