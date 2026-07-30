import type { DepartmentStat } from "@/lib/employees/queries";
import { DEPARTMENTS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type DepartmentStatsProps = {
  stats: DepartmentStat[];
};

export function DepartmentStats({ stats }: DepartmentStatsProps) {
  // Gabungkan departemen tanpa karyawan agar tampil 0
  const byDepartment = new Map(
    stats.map((stat) => [stat.department, stat]),
  );

  const rows = DEPARTMENTS.map((department) => {
    const stat = byDepartment.get(department) ?? {
      department,
      total: 0,
      active: 0,
      inactive: 0,
    };
    return stat;
  });

  const grandTotal = rows.reduce((sum, row) => sum + row.total, 0);
  const maxTotal = Math.max(1, ...rows.map((row) => row.total));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistik per Departemen</CardTitle>
        <CardDescription>
          Sebaran {grandTotal} karyawan aktif &amp; nonaktif per departemen.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {rows.map((row) => {
          const width = Math.round((row.total / maxTotal) * 100);
          return (
            <div key={row.department} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{row.department}</span>
                <span className="tabular-nums text-muted-foreground">
                  <span className="text-emerald-600">{row.active} aktif</span>
                  {" · "}
                  <span className="text-slate-500">{row.inactive} nonaktif</span>
                  {" · "}
                  <span className="font-medium text-foreground">
                    {row.total} total
                  </span>
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full bg-primary transition-all",
                    row.total === 0 && "opacity-20",
                  )}
                  style={{ width: `${width}%` }}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
