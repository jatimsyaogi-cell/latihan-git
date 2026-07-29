import type { EmployeeStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABELS } from "@/lib/constants";

export function EmployeeStatusBadge({ status }: { status: EmployeeStatus }) {
  return (
    <Badge variant={status === "ACTIVE" ? "success" : "muted"}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
