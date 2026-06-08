"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function AdminLogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin-auth", { method: "DELETE" });
    router.replace("/admin/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-zinc-900 transition font-bold uppercase italic text-xs tracking-wider text-zinc-500 w-full mt-1"
    >
      <LogOut size={18} /> Logout
    </button>
  );
}