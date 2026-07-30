"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
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

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Admin HR" },
  { value: "VIEWER", label: "Karyawan (Viewer)" },
] as const;

const schema = z
  .object({
    name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100),
    email: z.string().trim().email("Email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
    role: z.enum(["ADMIN", "VIEWER"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });

type Values = z.infer<typeof schema>;

export default function RegisterPage() {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "VIEWER",
    },
  });

  const role = watch("role");

  function onSubmit(values: Values) {
    setServerError(null);
    startTransition(async () => {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
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
        toast.error(data.error ?? "Gagal membuat akun");
        setServerError(data.error ?? "Gagal membuat akun");
        return;
      }

      setSuccess(true);
      toast.success("Akun berhasil dibuat! Silakan login.");
    });
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <UserPlus className="h-6 w-6" />
            </div>
            <CardTitle>Akun Berhasil Dibuat</CardTitle>
            <CardDescription>
              Silakan login dengan email dan password yang sudah didaftarkan.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/login">Masuk Sekarang</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <UserPlus className="h-6 w-6" />
          </div>
          <CardTitle>Buat Akun Baru</CardTitle>
          <CardDescription>
            Daftar untuk mengakses aplikasi pendataan karyawan
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama lengkap</Label>
              <Input
                id="name"
                placeholder="Nama Anda"
                {...register("name")}
              />
              {errors.name ? (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                autoComplete="email"
                {...register("email")}
              />
              {errors.email ? (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minimal 6 karakter"
                autoComplete="new-password"
                {...register("password")}
              />
              {errors.password ? (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi password</Label>
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

            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={role}
                onValueChange={(value) =>
                  setValue("role", value as Values["role"], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role ? (
                <p className="text-sm text-destructive">{errors.role.message}</p>
              ) : null}
            </div>

            {serverError ? (
              <p className="text-sm text-destructive">{serverError}</p>
            ) : null}
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              Daftar
            </Button>
          </CardFooter>
        </form>
        <div className="border-t px-6 py-4 text-center text-sm space-y-1">
          <div>
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Masuk
            </Link>
          </div>
          <div>
            <Link
              href="/registered-accounts"
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Lihat akun yang sudah terdaftar
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
