import Link from "next/link";
import { Button } from "@/components/ui/button";

type EmployeePaginationProps = {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  searchParams: Record<string, string | undefined>;
};

function buildHref(
  page: number,
  searchParams: Record<string, string | undefined>,
) {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  params.set("page", String(page));
  return `/employees?${params.toString()}`;
}

export function EmployeePagination({
  page,
  totalPages,
  total,
  pageSize,
  searchParams,
}: EmployeePaginationProps) {
  if (total === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Menampilkan {from}–{to} dari {total} karyawan
      </p>
      <div className="flex items-center gap-2">
        <Button
          asChild
          variant="outline"
          size="sm"
          disabled={page <= 1}
          className={page <= 1 ? "pointer-events-none opacity-50" : undefined}
        >
          <Link href={buildHref(Math.max(1, page - 1), searchParams)}>
            Sebelumnya
          </Link>
        </Button>
        <span className="text-sm text-muted-foreground">
          Halaman {page} / {totalPages}
        </span>
        <Button
          asChild
          variant="outline"
          size="sm"
          disabled={page >= totalPages}
          className={
            page >= totalPages ? "pointer-events-none opacity-50" : undefined
          }
        >
          <Link href={buildHref(Math.min(totalPages, page + 1), searchParams)}>
            Berikutnya
          </Link>
        </Button>
      </div>
    </div>
  );
}
