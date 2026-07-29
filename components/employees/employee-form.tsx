"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { Employee } from "@prisma/client";
import {
  employeeFormSchema,
  type EmployeeFormValues,
} from "@/lib/validations/employee";
import { DEPARTMENTS, STATUS_LABELS } from "@/lib/constants";
import { toDateInputValue } from "@/lib/utils";
import { createEmployee, updateEmployee } from "@/lib/employees/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type EmployeeFormProps = {
  mode: "create" | "edit";
  employee?: Employee;
};

export function EmployeeForm({ mode, employee }: EmployeeFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      nip: employee?.nip ?? "",
      name: employee?.name ?? "",
      email: employee?.email ?? "",
      phone: employee?.phone ?? "",
      department: (employee?.department as EmployeeFormValues["department"]) ?? "Engineering",
      position: employee?.position ?? "",
      status: employee?.status ?? "ACTIVE",
      joinedAt: employee?.joinedAt
        ? new Date(employee.joinedAt)
        : new Date(),
    },
  });

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const department = watch("department");
  const status = watch("status");
  const joinedAt = watch("joinedAt");

  function applyFieldErrors(
    fieldErrors?: Record<string, string[] | undefined>,
  ) {
    if (!fieldErrors) return;
    Object.entries(fieldErrors).forEach(([field, messages]) => {
      if (!messages?.[0]) return;
      setError(field as keyof EmployeeFormValues, {
        type: "server",
        message: messages[0],
      });
    });
  }

  function onSubmit(values: EmployeeFormValues) {
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createEmployee(values)
          : await updateEmployee(employee!.id, values);

      if (result && !result.success) {
        applyFieldErrors(result.fieldErrors);
        toast.error(result.error);
        return;
      }

      toast.success(
        mode === "create"
          ? "Karyawan berhasil ditambahkan"
          : "Data karyawan berhasil diperbarui",
      );
    });
  }

  const cancelHref =
    mode === "edit" && employee
      ? `/employees/${employee.id}`
      : "/employees";

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Form Tambah Karyawan" : "Form Edit Karyawan"}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="nip">NIP</Label>
            <Input id="nip" placeholder="EMP013" {...register("nip")} />
            {errors.nip ? (
              <p className="text-sm text-destructive">{errors.nip.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nama lengkap</Label>
            <Input id="name" placeholder="Nama karyawan" {...register("name")} />
            {errors.name ? (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@perusahaan.com"
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telepon</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="08xxxxxxxxxx"
              {...register("phone")}
            />
            {errors.phone ? (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Departemen</Label>
            <Select
              value={department}
              onValueChange={(value) =>
                setValue("department", value as EmployeeFormValues["department"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih departemen" />
              </SelectTrigger>
              <SelectContent>
                {DEPARTMENTS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.department ? (
              <p className="text-sm text-destructive">
                {errors.department.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Jabatan</Label>
            <Input
              id="position"
              placeholder="Software Engineer"
              {...register("position")}
            />
            {errors.position ? (
              <p className="text-sm text-destructive">
                {errors.position.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(value) =>
                setValue("status", value as EmployeeFormValues["status"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status ? (
              <p className="text-sm text-destructive">{errors.status.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="joinedAt">Tanggal masuk</Label>
            <Input
              id="joinedAt"
              type="date"
              value={toDateInputValue(joinedAt)}
              onChange={(event) =>
                setValue("joinedAt", new Date(event.target.value), {
                  shouldValidate: true,
                })
              }
            />
            {errors.joinedAt ? (
              <p className="text-sm text-destructive">
                {errors.joinedAt.message}
              </p>
            ) : null}
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-2 border-t px-6 py-4">
          <Button asChild type="button" variant="outline" disabled={isPending}>
            <Link href={cancelHref}>Batal</Link>
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? "Menyimpan..."
              : mode === "create"
                ? "Simpan"
                : "Update"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
