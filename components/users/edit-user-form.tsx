"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { AlertDialogAction } from "@/components/ui/alert-dialog";
import { AlertDialogCancel } from "@/components/ui/alert-dialog";
import { AlertDialogContent } from "@/components/ui/alert-dialog";
import { AlertDialogDescription } from "@/components/ui/alert-dialog";
import { AlertDialogFooter } from "@/components/ui/alert-dialog";
import { AlertDialogHeader } from "@/components/ui/alert-dialog";
import { AlertDialogTitle } from "@/components/ui/alert-dialog";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";

const ROLE_OPTIONS = [
  { value: "SUPER_ADMIN", label: "Super Admin" },
  { value: "ADMIN", label: "Admin" },
  { value: "VIEWER", label: "Viewer" },
] as const;

const schema = z
  .object({
    name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100),
    email: z.string().trim().email("Email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter").optional().or(z.literal("")),
    confirmPassword: z.string().optional().or(z.literal("")),
    role: z.enum(["SUPER_ADMIN", "ADMIN", "VIEWER"]),
  })
  .refine(
    (data) => {
      if (data.password && data.password.length >= 6) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "Password tidak cocok",
      path: ["confirmPassword"],
    },
  );

type Values = z.infer<typeof schema>;

type EditUserFormProps = {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
};

export function EditUserForm({ user }: EditUserFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name,
      email: user.email,
      password: "",
      confirmPassword: "",
      role: user.role,
    },
  });

  const role = watch("role");

  function onSubmit(values: Values) {
    setServerError(null);
    startTransition(async () => {
      const payload = { ...values };
      if (!payload.password || payload.password.length < 6) {
        delete payload.password;
        delete payload.confirmPassword;
      } else {
        delete payload.confirmPassword;
      }

      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.fieldErrors) {
          Object.entries(data.fieldErrors).forEach(([field, messages]) => {
            const msg = Array.isArray(messages) ? messages[0] : undefined;
            if (msg) {
              setError(field as keyof Values, { message: msg });
            }
          });
        }
        toast.error(data.error ?? "Gagal memperbarui akun");
        setServerError(data.error ?? "Gagal memperbarui akun");
        return;
      }

      toast.success("Akun berhasil diperbarui");
      window.location.reload();
    });
  }

  function handleDelete() {
    startDeleteTransition(async () => {
      const response = await fetch(`/api/users/${user.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error ?? "Gagal menghapus akun");
        return;
      }

      toast.success("Akun berhasil dihapus");
      window.location.href = "/users";
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Akun</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name">Nama</Label>
            <Input id="name" placeholder="Nama pengguna" {...register("name")} />
            {errors.name ? (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password baru</Label>
            <Input
              id="password"
              type="password"
              placeholder="Kosongkan jika tidak ingin mengubah"
              autoComplete="new-password"
              {...register("password")}
            />
            {errors.password ? (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi password baru</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword ? (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Role</Label>
            <Select
              value={watch("role") || user.role}
              onValueChange={(value) =>
                setValue("role", value as Values["role"], { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih role" />
              </SelectTrigger>
              <SelectContent>
                {[
                  { value: "SUPER_ADMIN", label: "Super Admin" },
                  { value: "ADMIN", label: "Admin" },
                  { value: "VIEWER", label: "Viewer" },
                ].map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.role ? (
              <p className="text-sm text-destructive">{errors.role.message}</p>
            ) : null}
          </div>

          {serverError ? (
            <p className="text-sm text-destructive md:col-span-2">
              {serverError}
            </p>
          ) : null}
        </CardContent>

        <CardFooter className="flex justify-end gap-2 border-t px-6 py-4">
          <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="destructive"
                disabled={isDeletePending}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                {isDeletePending ? "Menghapus..." : "Hapus akun"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hapus akun?</AlertDialogTitle>
                <AlertDialogDescription>
                  Akun <span className="font-medium">{user.name}</span> ({user.email})
                  akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeletePending}
                  className="bg-destructive text-white hover:bg-destructive/90"
                >
                  Ya, hapus
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <User className="h-4 w-4 mr-1" />
            )}
            Simpan perubahan
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}