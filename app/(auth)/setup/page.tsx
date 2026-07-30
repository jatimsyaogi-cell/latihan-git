import { redirect } from "next/navigation";
import { hasAnyUser } from "@/lib/auth/actions";
import { SetupForm } from "@/components/auth/setup-form";

export const metadata = { title: "Buat Akun Admin" };

export default async function SetupPage() {
  // Sudah ada user → jangan buka setup lagi
  if (await hasAnyUser()) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Selamat datang 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Buat akun admin pertama untuk mulai mengelola data karyawan.
          </p>
        </div>
        <SetupForm />
      </div>
    </div>
  );
}
