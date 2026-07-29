import Link from "next/link";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  title?: string;
  description?: string;
  showAction?: boolean;
};

export function EmptyState({
  title = "Belum ada data karyawan",
  description = "Tambahkan karyawan pertama untuk mulai mengelola data.",
  showAction = true,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card px-6 py-16 text-center">
      <div className="mb-4 rounded-full bg-muted p-3">
        <Users className="h-6 w-6 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {showAction ? (
        <Button asChild className="mt-6">
          <Link href="/employees/new">Tambah Karyawan</Link>
        </Button>
      ) : null}
    </div>
  );
}
