import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 hari

import type { UserRole } from "@prisma/client";

export type { UserRole };

type SessionPayload = {
  userId: string;
  email: string;
  role: UserRole;
};

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET belum diset di environment");
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(
  userId: string,
  email: string,
  role: UserRole,
): Promise<void> {
  const cookieStore = await cookies();
  const token = await new SignJWT({ userId, email, role } satisfies SessionPayload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (
      typeof payload.userId === "string" &&
      typeof payload.email === "string" &&
      (payload.role === "SUPER_ADMIN" ||
        payload.role === "ADMIN" ||
        payload.role === "VIEWER")
    ) {
      return {
        userId: payload.userId,
        email: payload.email,
        role: payload.role as UserRole,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    const { redirect } = await import("next/navigation");
    redirect("/login");
  }

  return session;
}

/** Tolak VIEWER — hanya ADMIN & SUPER_ADMIN yang boleh mutasi. */
export async function requireWriteSession(): Promise<SessionPayload> {
  const session = await requireSession();
  if (session.role === "VIEWER") {
    throw new Error("FORBIDDEN");
  }
  return session;
}

export function canWrite(role: UserRole | undefined): boolean {
  return role === "SUPER_ADMIN" || role === "ADMIN";
}

export function canManageUsers(role: UserRole | undefined): boolean {
  return role === "SUPER_ADMIN";
}

/** Dipakai di middleware (edge context). */
export async function getSessionFromToken(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (
      typeof payload.userId === "string" &&
      typeof payload.email === "string" &&
      (payload.role === "SUPER_ADMIN" ||
        payload.role === "ADMIN" ||
        payload.role === "VIEWER")
    ) {
      return {
        userId: payload.userId,
        email: payload.email,
        role: payload.role as UserRole,
      };
    }
    return null;
  } catch {
    return null;
  }
}
