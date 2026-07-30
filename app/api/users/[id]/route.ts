import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth/session";

const updateUserSchema = z
  .object({
    name: z.string().trim().min(2, "Nama minimal 2 karakter").max(100),
    email: z.string().trim().email("Email tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter").optional().or(z.literal("")),
    confirmPassword: z.string().optional().or(z.literal("")),
    role: z.enum(["SUPER_ADMIN", "ADMIN", "VIEWER"]),
  })
  .refine(
    (data) => {
      if (data.password && data.password || !data.confirmPassword) return true;
      return data.password === data.confirmPassword;
    },
    {
      message: "Password tidak cocok",
      path: ["confirmPassword"],
    },
  );

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  }

  const { id } = await params;

  const body = await request.json();
  const parsed = updateUserSchema.safeParse(body);

  if (!parsed.success) {
    const fields = parsed.error.flatten().fieldErrors;
    return NextResponse.json(
      { error: "Validasi gagal", fieldErrors: fields },
      { status: 422 },
    );
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
  }

  const email = parsed.data.email.toLowerCase().trim();

  if (email !== existing.email) {
    const conflict = await prisma.user.findUnique({ where: { email } });
    if (conflict) {
      return NextResponse.json(
        { error: "Email sudah digunakan", fieldErrors: { email: ["Email sudah digunakan"] } },
        { status: 409 },
      );
    }
  }

  const updateData: any = {
    name: parsed.data.name,
    email,
    role: parsed.data.role,
  };

  if (parsed.data.password && parsed.data.password.length >= 6) {
    updateData.password = await bcrypt.hash(parsed.data.password, 10);
  }

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
  }

  // Prevent deleting self
  if (existing.id === session.userId) {
    return NextResponse.json(
      { error: "Tidak bisa menghapus akun sendiri" },
      { status: 400 },
    );
  }

  await prisma.user.delete({ where: { id } });

  return NextResponse.json({ success: true });
}