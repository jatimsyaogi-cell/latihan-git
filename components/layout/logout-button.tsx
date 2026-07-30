"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { logout } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await logout();
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="w-full justify-start"
      onClick={handleLogout}
      disabled={isPending}
    >
      <LogOut className="h-4 w-4" />
      {isPending ? "Keluar..." : "Keluar"}
    </Button>
  );
}
