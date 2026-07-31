import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const [total, superAdmins, admins, viewers] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "SUPER_ADMIN" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { role: "VIEWER" } }),
  ]);

  const publicUsers = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({
    stats: {
      total,
      superAdmins,
      admins,
      viewers,
    },
    users: publicUsers.map((u) => ({
      id: u.id,
      name: u.name,
      role: u.role,
      registeredAt: u.createdAt,
    })),
  });
}