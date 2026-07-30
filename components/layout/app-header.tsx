import Link from "next/link";
import { Users } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function AppHeader() {
  const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "Pendataan Karyawan";

  return (
    <header className="flex items-center justify-between border-b bg-card px-4 py-3 md:hidden">
      <Link href="/employees" className="flex items-center gap-2 font-semibold">
        <Users className="h-4 w-4" />
        {appName}
      </Link>
      <ThemeToggle />
    </header>
  );
}
