"use client";

import { useState } from "react";
import Link from "next/link";
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
  FileText,
  Mail, // 👈 Import Mail icon
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const links = (
    <>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4">
        Core
      </p>

      <Link
        href="/admin/dashboard"
        onClick={() => setOpen(false)}
        className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-zinc-900 font-bold uppercase text-xs"
      >
        <LayoutDashboard size={18} />
        Dashboard
      </Link>

      <Link
        href="/admin"
        onClick={() => setOpen(false)}
        className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-zinc-900 font-bold uppercase text-xs"
      >
        <Layers size={18} />
        Site Content
      </Link>

      <Link
        href="/admin/inventory"
        onClick={() => setOpen(false)}
        className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-zinc-900 font-bold uppercase text-xs"
      >
        <Package size={18} />
        Inventory Hub
      </Link>

      <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-8 mb-4">
        Operations
      </p>

      <Link
        href="/admin/orders"
        onClick={() => setOpen(false)}
        className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-zinc-900 font-bold uppercase text-xs"
      >
        <ShoppingCart size={18} />
        Orders
      </Link>

      <Link
        href="/admin/shipping"
        onClick={() => setOpen(false)}
        className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-zinc-900 font-bold uppercase text-xs"
      >
        <Truck size={18} />
        Shipping
      </Link>

      <Link
        href="/admin/customers"
        onClick={() => setOpen(false)}
        className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-zinc-900 font-bold uppercase text-xs"
      >
        <Users size={18} />
        Customers
      </Link>

      {/* 👈 Added Editable Contact Us Messages Panel link */}
      <Link
        href="/admin/contacts"
        onClick={() => setOpen(false)}
        className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-zinc-900 font-bold uppercase text-xs"
      >
        <Mail size={18} />
        CONTACTS
      </Link>

      <Link
        href="/admin/policies"
        onClick={() => setOpen(false)}
        className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-zinc-900 font-bold uppercase text-xs"
      >
        <FileText size={18} />
        Policies
      </Link>

      <hr className="border-zinc-800 my-6" />

      <Link
        href="/admin/settings"
        onClick={() => setOpen(false)}
        className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-zinc-900 font-bold uppercase text-xs"
      >
        <Settings size={18} />
        Settings
      </Link>

      <AdminLogoutButton />
    </>
  );

  return (
    <div className="min-h-screen bg-white flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-72 bg-black text-white p-8 sticky top-0 h-screen flex-col justify-between">
        <div>
          <h2 className="text-3xl font-black italic mb-12">
            BTH+
            <br />
            ADMIN
          </h2>
          <nav>{links}</nav>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-black text-white flex items-center justify-between px-4 z-50">
        <h2 className="font-black text-lg italic">BTH+ ADMIN</h2>
        <button onClick={() => setOpen(true)}>
          <Menu size={28} />
        </button>
      </div>

      {/* Overlay */}
      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40"
            onClick={() => setOpen(false)}
          />
          <aside className="fixed top-0 left-0 w-72 h-screen bg-black text-white p-8 z-50 overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-black text-2xl italic">
                BTH+
                <br />
                ADMIN
              </h2>
              <button onClick={() => setOpen(false)}>
                <X />
              </button>
            </div>
            <nav>{links}</nav>
          </aside>
        </>
      )}

      {/* Main */}
      <main className="flex-1 pt-16 lg:pt-0">
        <div className="min-h-screen bg-zinc-50">{children}</div>
      </main>
    </div>
  );
}