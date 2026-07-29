import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function EmployeeNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-4 py-20 text-center">
      <h2 className="text-xl font-semibold">Karyawan tidak ditemukan</h2>
      <p className="text-sm text-muted-foreground">
        Data yang Anda cari tidak ada atau sudah dihapus.
      </p>
      <Button asChild>
        <Link href="/employees">Kembali ke daftar</Link>
      </Button>
    </div>
  );
}
