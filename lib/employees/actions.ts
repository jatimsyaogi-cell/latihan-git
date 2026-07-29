"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import {
  employeeFormSchema,
  employeeIdSchema,
} from "@/lib/validations/employee";

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string[] | undefined>;
    };

function mapPrismaError(error: unknown): ActionResult {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    const target = error.meta?.target;
    const fields = Array.isArray(target) ? target : [];
    const fieldErrors: Record<string, string[]> = {};

    if (fields.includes("nip")) {
      fieldErrors.nip = ["NIP sudah digunakan"];
    }
    if (fields.includes("email")) {
      fieldErrors.email = ["Email sudah digunakan"];
    }

    if (Object.keys(fieldErrors).length > 0) {
      return {
        success: false,
        error: "Data duplikat",
        fieldErrors,
      };
    }

    return { success: false, error: "Data sudah ada di sistem" };
  }

  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  ) {
    return { success: false, error: "Data karyawan tidak ditemukan" };
  }

  return { success: false, error: "Gagal menyimpan data" };
}

export async function createEmployee(raw: unknown): Promise<ActionResult> {
  const parsed = employeeFormSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validasi gagal",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.employee.create({
      data: {
        ...parsed.data,
        phone: parsed.data.phone || null,
      },
    });
  } catch (error) {
    return mapPrismaError(error);
  }

  revalidatePath("/employees");
  redirect("/employees");
}

export async function updateEmployee(
  id: string,
  raw: unknown,
): Promise<ActionResult> {
  const idParsed = employeeIdSchema.safeParse(id);
  if (!idParsed.success) {
    return { success: false, error: "ID tidak valid" };
  }

  const parsed = employeeFormSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      success: false,
      error: "Validasi gagal",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.employee.update({
      where: { id: idParsed.data },
      data: {
        ...parsed.data,
        phone: parsed.data.phone || null,
      },
    });
  } catch (error) {
    return mapPrismaError(error);
  }

  revalidatePath("/employees");
  revalidatePath(`/employees/${idParsed.data}`);
  redirect(`/employees/${idParsed.data}`);
}

export async function deleteEmployee(id: string): Promise<ActionResult> {
  const idParsed = employeeIdSchema.safeParse(id);
  if (!idParsed.success) {
    return { success: false, error: "ID tidak valid" };
  }

  try {
    await prisma.employee.delete({ where: { id: idParsed.data } });
  } catch (error) {
    return mapPrismaError(error);
  }

  revalidatePath("/employees");
  redirect("/employees");
}
