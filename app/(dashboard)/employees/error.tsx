"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function EmployeesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-4 py-20 text-center">
      <h2 className="text-xl font-semibold">Terjadi kesalahan</h2>
      <p className="text-sm text-muted-foreground">
        Gagal memuat data karyawan. Coba muat ulang halaman.
      </p>
      <Button onClick={reset}>Coba lagi</Button>
    </div>
  );
}
