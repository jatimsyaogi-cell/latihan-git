"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteEmployee } from "@/lib/employees/actions";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type DeleteEmployeeDialogProps = {
  employeeId: string;
  employeeName: string;
  triggerVariant?: "destructive" | "outline" | "ghost";
  triggerSize?: "default" | "sm" | "icon";
  triggerLabel?: string;
};

export function DeleteEmployeeDialog({
  employeeId,
  employeeName,
  triggerVariant = "destructive",
  triggerSize = "sm",
  triggerLabel = "Hapus",
}: DeleteEmployeeDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteEmployee(employeeId);
      if (result && !result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Karyawan berhasil dihapus");
      setOpen(false);
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant={triggerVariant} size={triggerSize}>
          {triggerLabel}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus karyawan?</AlertDialogTitle>
          <AlertDialogDescription>
            Data <span className="font-medium text-foreground">{employeeName}</span>{" "}
            akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              handleDelete();
            }}
            disabled={isPending}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {isPending ? "Menghapus..." : "Ya, hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
