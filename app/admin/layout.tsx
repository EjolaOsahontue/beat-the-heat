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
  PanelTop,
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-72 bg-black text-white p-8 sticky top-0 h-screen shrink-0 flex flex-col justify-between">
        <div>
          <h2 className="text-3xl font-black mb-12 tracking-tighter italic leading-none">
            BTH+ <br /> <span className="text-white">ADMIN</span>
          </h2>

          <nav className="space-y-1">
            <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-4">Core</p>

            <Link href="/admin/dashboard" className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-zinc-900 transition font-bold uppercase italic text-xs tracking-wider">
              <LayoutDashboard size={18} /> Dashboard
            </Link>

            <Link href="/admin" className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-zinc-900 transition font-bold uppercase italic text-xs tracking-wider text-white">
              <Layers size={18} /> Site Content
            </Link>

           

            <Link href="/admin/inventory" className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-zinc-900 transition font-bold uppercase italic text-xs tracking-wider">
              <Package size={18} /> Inventory Hub
            </Link>

            <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-4 mt-8">Operations</p>

            <Link href="/admin/orders" className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-zinc-900 transition font-bold uppercase italic text-xs tracking-wider text-white">
              <ShoppingCart size={18} /> Orders
            </Link>

            <Link href="/admin/shipping" className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-zinc-900 transition font-bold uppercase italic text-xs tracking-wider text-white">
              <Truck size={18} /> Shipping
            </Link>

            <Link href="/admin/customers" className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-zinc-900 transition font-bold uppercase italic text-xs tracking-wider text-white">
              <Users size={18} /> Customers
            </Link>
          </nav>
        </div>

        <div>
          <hr className="border-zinc-800 mb-6" />
          <Link href="/admin/settings" className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-zinc-900 transition font-bold uppercase italic text-xs tracking-wider text-white">
            <Settings size={18} /> Settings
          </Link>
          <AdminLogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="min-h-full bg-zinc-50/50">{children}</div>
      </main>
    </div>
  );
}