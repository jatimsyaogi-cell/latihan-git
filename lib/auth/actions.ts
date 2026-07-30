"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createSession, destroySession } from "./session";

const loginSchema = z.object({
  email: z.string().trim().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

const setupSchema = z.object({
  name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100),
  email: z.string().trim().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

export type AuthResult =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

/** Cek apakah sudah ada user di DB. */
export async function hasAnyUser(): Promise<boolean> {
  const count = await prisma.user.count();
  return count > 0;
}

/** Buat akun admin pertama (hanya jika belum ada user). */
export async function setupAdmin(raw: unknown): Promise<AuthResult> {
  const existing = await hasAnyUser();
  if (existing) {
    return { success: false, error: "Sudah ada admin, login saja" };
  }

  const parsed = setupSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validasi gagal",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const hash = await bcrypt.hash(parsed.data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase().trim(),
      password: hash,
    },
  });

  await createSession(user.id, user.email);
  return { success: true };
}

export async function login(raw: unknown): Promise<AuthResult> {
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validasi gagal",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return { success: false, error: "Email atau password salah" };
  }

  const match = await bcrypt.compare(parsed.data.password, user.password);
  if (!match) {
    return { success: false, error: "Email atau password salah" };
  }

  await createSession(user.id, user.email);
  return { success: true };
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/login");
}

export async function resetPassword(raw: unknown): Promise<AuthResult> {
  const parsed = z
    .object({
      email: z.string().trim().email("Email tidak valid"),
      password: z.string().min(6, "Password minimal 6 karakter"),
      confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Password tidak cocok",
      path: ["confirmPassword"],
    })
    .safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      error: "Validasi gagal",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return { success: false, error: "Email tidak ditemukan" };
  }

  const hash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.update({
    where: { email },
    data: { password: hash },
  });

  redirect("/login");
}
