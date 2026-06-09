"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Truck,
  Layers,
  Menu,
  X,
} from "lucide-react";

export default function MobileAdminNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, section: "Core" },
    { href: "/admin", label: "Site Content", icon: Layers, section: "Core" },
    { href: "/admin/inventory", label: "Inventory Hub", icon: Package, section: "Core" },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart, section: "Operations" },
    { href: "/admin/shipping", label: "Shipping", icon: Truck, section: "Operations" },
    { href: "/admin/customers", label: "Customers", icon: Users, section: "Operations" },
    { href: "/admin/settings", label: "Settings", icon: Settings, section: "Operations" },
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-[200] bg-black text-white px-5 h-16 flex items-center justify-between">
        <h2 className="text-xl font-black tracking-tighter italic">BTH+ ADMIN</h2>
        <button
          onClick={() => setOpen((v) => !v)}
          className="p-2 rounded-xl hover:bg-zinc-800 transition"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-[190] bg-black text-white pt-16 flex flex-col">
          <nav className="flex-1 overflow-y-auto px-5 py-6 space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-3">Core</p>

            {links.filter(l => l.section === "Core").map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 py-3 px-4 rounded-xl transition font-bold uppercase italic text-xs tracking-wider ${
                  pathname === href ? "bg-zinc-800 text-white" : "hover:bg-zinc-900 text-zinc-400"
                }`}
              >
                <Icon size={18} /> {label}
              </Link>
            ))}

            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-3 mt-8">Operations</p>

            {links.filter(l => l.section === "Operations").map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 py-3 px-4 rounded-xl transition font-bold uppercase italic text-xs tracking-wider ${
                  pathname === href ? "bg-zinc-800 text-white" : "hover:bg-zinc-900 text-zinc-400"
                }`}
              >
                <Icon size={18} /> {label}
              </Link>
            ))}
          </nav>

          <div className="px-5 pb-8 border-t border-zinc-800 pt-4">
            <AdminLogoutButton />
          </div>
        </div>
      )}

      {/* Spacer for mobile top bar */}
      <div className="lg:hidden h-16" />
    </>
  );
}