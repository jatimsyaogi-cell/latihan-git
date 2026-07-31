import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "admin_session";
const PUBLIC_PATHS = ["/login", "/setup", "/forgot-password", "/register", "/api/register", "/api/health", "/api/me", "/registered-accounts", "/api/registered-accounts"];

function isPublic(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET ?? process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_SECRET (atau BETTER_AUTH_SECRET) belum diset di environment",
    );
  }
  return new TextEncoder().encode(secret);
}

async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Root & path publik → biarkan lewat (page-level cek "user exists")
  if (pathname === "/" || isPublic(pathname)) {
    return NextResponse.next();
  }

  // Semua path lain butuh session
  if (!(await isAuthenticated(request))) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads).*)"],
};
